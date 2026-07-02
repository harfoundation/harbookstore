"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  whatsappContactBulkImportSchema,
  whatsappContactSchema,
  type WhatsappContactBulkImportInput,
  type WhatsappContactInput,
} from "@/lib/validation/whatsapp-contact.schema";

type ActionResult = { success: true } | { success: false; error: string };

export async function addWhatsappContact(
  input: WhatsappContactInput,
): Promise<ActionResult> {
  const parsed = whatsappContactSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "聯絡人資料無效" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "請先登入" };

  const v = parsed.data;
  const { error } = await supabase.from("whatsapp_contacts").upsert(
    {
      phone_number: v.phoneNumber,
      display_name: v.displayName || null,
      tags: v.tags,
      opt_in: v.optIn,
      notes: v.notes || null,
      source: "manual",
      imported_by: user.id,
    },
    { onConflict: "phone_number" },
  );

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/whatsapp-contacts");
  return { success: true };
}

export async function bulkImportWhatsappContacts(
  input: WhatsappContactBulkImportInput,
): Promise<ActionResult & { imported?: number }> {
  const parsed = whatsappContactBulkImportSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "匯入資料無效" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "請先登入" };

  const { rows, tags } = parsed.data;
  const { error, count } = await supabase.from("whatsapp_contacts").upsert(
    rows.map((r) => ({
      phone_number: r.phoneNumber,
      display_name: r.displayName || null,
      tags,
      source: "csv_import" as const,
      imported_by: user.id,
    })),
    { onConflict: "phone_number", count: "exact" },
  );

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/whatsapp-contacts");
  return { success: true, imported: count ?? rows.length };
}
