"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  settlementResourceFormSchema,
  type SettlementResourceFormInput,
} from "@/lib/validation/settlement.schema";

type ActionResult = { success: true } | { success: false; error: string };

export async function upsertSettlementResource(
  input: SettlementResourceFormInput,
): Promise<ActionResult> {
  const parsed = settlementResourceFormSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "請確認表單內容" };

  const supabase = await createClient();
  const v = parsed.data;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const row = {
    category: v.category,
    title_zh: v.titleZh,
    title_en: v.titleEn,
    body_markdown_zh: v.bodyMarkdownZh,
    body_markdown_en: v.bodyMarkdownEn,
    sort_order: v.sortOrder,
    status: v.status,
    created_by: user?.id,
  };

  const { error } = v.id
    ? await supabase.from("settlement_resources").update(row).eq("id", v.id)
    : await supabase.from("settlement_resources").insert(row);

  if (error) return { success: false, error: error.message };

  revalidatePath("/settle");
  revalidatePath("/admin/settlement-resources");
  return { success: true };
}

export async function deleteSettlementResource(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("settlement_resources").delete().eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/settle");
  revalidatePath("/admin/settlement-resources");
  return { success: true };
}
