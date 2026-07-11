"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { calculateOrderSubtotalCents } from "@/lib/validation/order.schema";
import { sendOrderConfirmationEmail } from "@/lib/email/send";
import type { TablesUpdate } from "@/types/database.types";

const retailItemSchema = z.object({
  bookId: z.string().uuid(),
  quantity: z.number().int().min(1).max(200),
});

const retailOrderSchema = z.object({
  items: z.array(retailItemSchema).min(1),
  paymentMethod: z.enum(["bank_transfer", "in_person"]),
  branchId: z.string().uuid().optional(),
  notes: z.string().max(1000).optional(),
});

const giftOrderSchema = z.object({
  bookId: z.string().uuid(),
  quantity: z.number().int().min(1).max(200),
  paymentMethod: z.enum(["bank_transfer", "in_person"]),
  recipientName: z.string().min(1).max(100),
  recipientEmail: z.string().email().optional().or(z.literal("")),
  recipientAddress: z.string().max(300).optional(),
  dedicationCardMessage: z.string().max(500).optional(),
  giftDeliveryMethod: z.enum(["self_pickup", "mail", "digital_card_only"]),
});

const groupBuyOrderSchema = z.object({
  groupBuyId: z.string().uuid(),
  bookId: z.string().uuid(),
  quantity: z.number().int().min(1).max(200),
  paymentMethod: z.enum(["bank_transfer", "in_person"]),
});

const courseEnrollmentSchema = z.object({
  courseId: z.string().uuid(),
  paymentMethod: z.enum(["bank_transfer", "in_person"]),
});

type ActionResult =
  { success: true; orderNumber: string } | { success: false; error: string };

async function getAuthedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

type BookPricing = {
  priceCents: number;
  groupBuyPriceCents: number | null;
  groupBuyMinQty: number | null;
};

/** Looks up current prices server-side — never trusts client-submitted prices. */
async function fetchBookPrices(
  supabase: Awaited<ReturnType<typeof createClient>>,
  bookIds: string[],
) {
  const { data, error } = await supabase
    .from("books")
    .select("id, price_cents, group_buy_price_cents, group_buy_min_qty")
    .in("id", bookIds);
  if (error) throw error;
  return new Map<string, BookPricing>(
    data.map((b) => [
      b.id,
      {
        priceCents: b.price_cents ?? 0,
        groupBuyPriceCents: b.group_buy_price_cents,
        groupBuyMinQty: b.group_buy_min_qty,
      },
    ]),
  );
}

/** Retail/gift orders unlock the group-buy price once quantity hits the book's minimum. */
function resolveUnitPriceCents(pricing: BookPricing | undefined, quantity: number): number {
  if (!pricing) return 0;
  if (
    pricing.groupBuyPriceCents != null &&
    pricing.groupBuyMinQty != null &&
    quantity >= pricing.groupBuyMinQty
  ) {
    return pricing.groupBuyPriceCents;
  }
  return pricing.priceCents;
}

export async function createRetailOrder(
  input: z.infer<typeof retailOrderSchema>,
): Promise<ActionResult> {
  const parsed = retailOrderSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "訂單資料無效" };

  const { supabase, user } = await getAuthedUser();
  if (!user) return { success: false, error: "請先登入" };

  const { items, paymentMethod, branchId, notes } = parsed.data;
  const priceMap = await fetchBookPrices(
    supabase,
    items.map((i) => i.bookId),
  );
  const orderItems = items.map((i) => ({
    book_id: i.bookId,
    quantity: i.quantity,
    unit_price_cents: resolveUnitPriceCents(priceMap.get(i.bookId), i.quantity),
  }));
  const subtotalCents = calculateOrderSubtotalCents(
    orderItems.map((i) => ({ quantity: i.quantity, unitPriceCents: i.unit_price_cents })),
  );

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      buyer_id: user.id,
      order_type: "retail",
      payment_method: paymentMethod,
      branch_id: branchId ?? null,
      subtotal_cents: subtotalCents,
      notes: notes || null,
    })
    .select("id, order_number")
    .single();

  if (orderError || !order)
    return { success: false, error: orderError?.message ?? "建立訂單失敗" };

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems.map((i) => ({ ...i, order_id: order.id })));

  if (itemsError) {
    await supabase.from("orders").delete().eq("id", order.id);
    return { success: false, error: itemsError.message };
  }

  await sendOrderConfirmationEmail({
    userId: user.id,
    orderNumber: order.order_number,
    subtotalCents,
  });
  revalidatePath("/orders");
  return { success: true, orderNumber: order.order_number };
}

export async function createGiftOrder(
  input: z.infer<typeof giftOrderSchema>,
): Promise<ActionResult> {
  const parsed = giftOrderSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "禮物訂單資料無效" };

  const { supabase, user } = await getAuthedUser();
  if (!user) return { success: false, error: "請先登入" };

  const { bookId, quantity, paymentMethod, giftDeliveryMethod, ...gift } = parsed.data;
  const priceMap = await fetchBookPrices(supabase, [bookId]);
  const unitPriceCents = resolveUnitPriceCents(priceMap.get(bookId), quantity);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      buyer_id: user.id,
      order_type: "gift",
      payment_method: paymentMethod,
      subtotal_cents: unitPriceCents * quantity,
      recipient_name: gift.recipientName,
      recipient_email: gift.recipientEmail || null,
      recipient_address: gift.recipientAddress || null,
      dedication_card_message: gift.dedicationCardMessage || null,
      gift_delivery_method: giftDeliveryMethod,
    })
    .select("id, order_number")
    .single();

  if (orderError || !order)
    return { success: false, error: orderError?.message ?? "建立禮物訂單失敗" };

  const { error: itemsError } = await supabase.from("order_items").insert({
    order_id: order.id,
    book_id: bookId,
    quantity,
    unit_price_cents: unitPriceCents,
  });

  if (itemsError) {
    await supabase.from("orders").delete().eq("id", order.id);
    return { success: false, error: itemsError.message };
  }

  await sendOrderConfirmationEmail({
    userId: user.id,
    orderNumber: order.order_number,
    subtotalCents: unitPriceCents * quantity,
  });
  revalidatePath("/orders");
  return { success: true, orderNumber: order.order_number };
}

export async function createGroupBuyOrder(
  input: z.infer<typeof groupBuyOrderSchema>,
): Promise<ActionResult> {
  const parsed = groupBuyOrderSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "團購訂單資料無效" };

  const { supabase, user } = await getAuthedUser();
  if (!user) return { success: false, error: "請先登入" };

  const { groupBuyId, bookId, quantity, paymentMethod } = parsed.data;
  const priceMap = await fetchBookPrices(supabase, [bookId]);
  const pricing = priceMap.get(bookId);
  // Joining an established group-buy campaign always gets the group price,
  // regardless of the individual order's own quantity.
  const unitPriceCents = pricing?.groupBuyPriceCents ?? pricing?.priceCents ?? 0;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      buyer_id: user.id,
      order_type: "group_buy",
      group_buy_id: groupBuyId,
      payment_method: paymentMethod,
      subtotal_cents: unitPriceCents * quantity,
    })
    .select("id, order_number")
    .single();

  if (orderError || !order)
    return { success: false, error: orderError?.message ?? "加入團購失敗" };

  const { error: itemsError } = await supabase.from("order_items").insert({
    order_id: order.id,
    book_id: bookId,
    quantity,
    unit_price_cents: unitPriceCents,
  });

  if (itemsError) {
    await supabase.from("orders").delete().eq("id", order.id);
    return { success: false, error: itemsError.message };
  }

  await sendOrderConfirmationEmail({
    userId: user.id,
    orderNumber: order.order_number,
    subtotalCents: unitPriceCents * quantity,
  });
  revalidatePath("/orders");
  revalidatePath("/catalog");
  return { success: true, orderNumber: order.order_number };
}

export async function createCourseEnrollmentOrder(
  input: z.infer<typeof courseEnrollmentSchema>,
): Promise<ActionResult> {
  const parsed = courseEnrollmentSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "報名資料無效" };

  const { supabase, user } = await getAuthedUser();
  if (!user) return { success: false, error: "請先登入" };

  const { courseId, paymentMethod } = parsed.data;
  const { data: course } = await supabase
    .from("courses")
    .select("price_cents")
    .eq("id", courseId)
    .single();
  const unitPriceCents = course?.price_cents ?? 0;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      buyer_id: user.id,
      order_type: "course_enrollment",
      payment_method: paymentMethod,
      subtotal_cents: unitPriceCents,
    })
    .select("id, order_number")
    .single();

  if (orderError || !order)
    return { success: false, error: orderError?.message ?? "建立報名訂單失敗" };

  const { error: itemsError } = await supabase.from("order_items").insert({
    order_id: order.id,
    course_id: courseId,
    quantity: 1,
    unit_price_cents: unitPriceCents,
  });

  if (itemsError) {
    await supabase.from("orders").delete().eq("id", order.id);
    return { success: false, error: itemsError.message };
  }

  await sendOrderConfirmationEmail({
    userId: user.id,
    orderNumber: order.order_number,
    subtotalCents: unitPriceCents,
  });
  revalidatePath("/orders");
  return { success: true, orderNumber: order.order_number };
}

const adminUpdateStatusSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum(["pending_review", "confirmed", "fulfilled", "cancelled"]),
});

export async function adminUpdateOrderStatus(
  input: z.infer<typeof adminUpdateStatusSchema>,
): Promise<ActionResult> {
  const parsed = adminUpdateStatusSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "資料無效" };

  const { supabase } = await getAuthedUser();
  const update: TablesUpdate<"orders"> = { status: parsed.data.status };
  if (parsed.data.status === "confirmed")
    update.payment_received_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("orders")
    .update(update)
    .eq("id", parsed.data.orderId)
    .select("order_number")
    .single();

  if (error || !data)
    return { success: false, error: error?.message ?? "更新失敗（僅限管理員）" };

  revalidatePath("/admin/orders");
  revalidatePath("/orders");
  return { success: true, orderNumber: data.order_number };
}
