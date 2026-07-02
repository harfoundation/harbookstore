"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { branchFormSchema, type BranchFormInput } from "@/lib/validation/branch.schema";

type ActionResult = { success: true } | { success: false; error: string };

export async function upsertBranch(input: BranchFormInput): Promise<ActionResult> {
  const parsed = branchFormSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "分店資料無效" };

  const supabase = await createClient();
  const v = parsed.data;
  const row = {
    state: v.state,
    city: v.city,
    suburb: v.suburb,
    address: v.address || null,
    is_default: v.isDefault,
    is_active: v.isActive,
    sort_order: v.sortOrder,
  };

  // Only one branch may be default — clear any existing default first when
  // this one is being promoted (the DB has a unique partial index too).
  if (v.isDefault) {
    await supabase
      .from("branches")
      .update({ is_default: false })
      .neq("id", v.id ?? "");
  }

  const { error } = v.id
    ? await supabase.from("branches").update(row).eq("id", v.id)
    : await supabase.from("branches").insert(row);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/branches");
  revalidatePath("/branches");
  return { success: true };
}
