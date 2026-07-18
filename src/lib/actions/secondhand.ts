"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sendOrderConfirmationEmail } from "@/lib/email/send";
import {
  secondhandItemFormSchema,
  secondhandOrderSchema,
  type SecondhandItemFormInput,
  type SecondhandOrderInput,
} from "@/lib/validation/secondhand.schema";

type ActionResult = { success: true } | { success: false; error: string };
type OrderActionResult =
  { success: true; orderNumber: string } | { success: false; error: string };

export async function upsertSecondhandItem(
  input: SecondhandItemFormInput,
): Promise<ActionResult> {
  const parsed = secondhandItemFormSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "商品資料無效" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "請先登入" };

  const v = parsed.data;
  const row = {
    title: v.title,
    author: v.author || null,
    category_id: v.categoryId,
    condition: v.condition,
    description: v.description || null,
    price_cents: v.priceCents,
    original_price_cents: v.originalPriceCents ?? null,
    branch_id: v.branchId,
    status: v.status,
  };

  const { error } = v.id
    ? await supabase.from("secondhand_items").update(row).eq("id", v.id)
    : await supabase.from("secondhand_items").insert({ ...row, submitted_by: user.id });

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/secondhand");
  revalidatePath("/secondhand");
  return { success: true };
}

export async function createSecondhandOrder(
  input: SecondhandOrderInput,
): Promise<OrderActionResult> {
  const parsed = secondhandOrderSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "訂購資料無效" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "請先登入" };

  const { itemId, paymentMethod } = parsed.data;
  const { data: item } = await supabase
    .from("secondhand_items")
    .select("price_cents, status")
    .eq("id", itemId)
    .single();

  if (!item) return { success: false, error: "找不到此商品" };
  if (item.status !== "available")
    return { success: false, error: "此商品已被預訂或售出" };

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      buyer_id: user.id,
      order_type: "secondhand",
      payment_method: paymentMethod,
      subtotal_cents: item.price_cents,
    })
    .select("id, order_number")
    .single();

  if (orderError || !order)
    return { success: false, error: orderError?.message ?? "建立訂單失敗" };

  const { error: itemsError } = await supabase.from("order_items").insert({
    order_id: order.id,
    secondhand_item_id: itemId,
    quantity: 1,
    unit_price_cents: item.price_cents,
  });

  if (itemsError) {
    await supabase.from("orders").delete().eq("id", order.id);
    return { success: false, error: itemsError.message };
  }

  await sendOrderConfirmationEmail({
    userId: user.id,
    orderNumber: order.order_number,
    subtotalCents: item.price_cents,
  });

  revalidatePath("/secondhand");
  revalidatePath("/orders");
  return { success: true, orderNumber: order.order_number };
}
