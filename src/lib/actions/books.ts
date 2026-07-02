"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { bookFormSchema, type BookFormInput } from "@/lib/validation/book.schema";

type ActionResult = { success: true } | { success: false; error: string };

export async function upsertBook(input: BookFormInput): Promise<ActionResult> {
  const parsed = bookFormSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "書籍資料無效" };

  const supabase = await createClient();
  const v = parsed.data;

  const row = {
    category_id: v.categoryId,
    poster_number: v.posterNumber,
    title: v.title,
    author: v.author || null,
    translator: v.translator || null,
    isbn: v.isbn || null,
    description: v.description || null,
    price_cents: v.priceCents,
    procurement_status: v.procurementStatus,
    stock_qty: v.stockQty,
    is_lendable: v.isLendable,
    is_active: v.isActive,
  };

  const { error } = v.id
    ? await supabase.from("books").update(row).eq("id", v.id)
    : await supabase.from("books").insert(row);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/books");
  revalidatePath("/catalog");
  return { success: true };
}

export async function setBookActive(
  bookId: string,
  isActive: boolean,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("books")
    .update({ is_active: isActive })
    .eq("id", bookId);
  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/books");
  revalidatePath("/catalog");
  return { success: true };
}

export async function submitBookForReview(input: BookFormInput): Promise<ActionResult> {
  const parsed = bookFormSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "書籍資料無效" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "請先登入" };

  const v = parsed.data;
  const { error } = await supabase.from("books").insert({
    category_id: v.categoryId,
    poster_number: v.posterNumber,
    title: v.title,
    author: v.author || null,
    translator: v.translator || null,
    isbn: v.isbn || null,
    description: v.description || null,
    price_cents: v.priceCents,
    procurement_status: v.procurementStatus,
    stock_qty: v.stockQty,
    is_lendable: v.isLendable,
    is_active: false,
    submitted_by: user.id,
    approval_status: "pending_review",
  });

  if (error) return { success: false, error: error.message };

  revalidatePath("/partner/submissions");
  return { success: true };
}

export async function adminReviewBook(
  bookId: string,
  decision: "approved" | "rejected",
  reviewNotes?: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("books")
    .update({
      approval_status: decision,
      review_notes: reviewNotes || null,
      is_active: decision === "approved",
    })
    .eq("id", bookId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/books");
  revalidatePath("/catalog");
  return { success: true };
}
