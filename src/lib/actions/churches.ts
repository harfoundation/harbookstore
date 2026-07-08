"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  churchFormSchema,
  churchServiceFormSchema,
  worshipSongFormSchema,
  serviceMaterialFormSchema,
  churchRegistrationFormSchema,
  respondChurchRegistrationSchema,
  churchAnnouncementFormSchema,
  type ChurchFormInput,
  type ChurchServiceFormInput,
  type WorshipSongFormInput,
  type ServiceMaterialFormInput,
  type ChurchRegistrationFormInput,
  type RespondChurchRegistrationInput,
  type ChurchAnnouncementFormInput,
} from "@/lib/validation/church.schema";

type ActionResult = { success: true } | { success: false; error: string };

export async function upsertChurch(input: ChurchFormInput): Promise<ActionResult> {
  const parsed = churchFormSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "堂會資料無效" };

  const supabase = await createClient();
  const v = parsed.data;
  const row = {
    slug: v.slug,
    name_zh: v.nameZh,
    name_en: v.nameEn || null,
    contact_name: v.contactName || null,
    contact_email: v.contactEmail || null,
    contact_phone: v.contactPhone || null,
    is_active: v.isActive,
    billing_status: v.billingStatus,
    billing_plan_cents: v.billingPlanCents,
    billing_notes: v.billingNotes || null,
  };

  const { error } = v.id
    ? await supabase.from("churches").update(row).eq("id", v.id)
    : await supabase.from("churches").insert(row);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/churches");
  return { success: true };
}

export async function upsertChurchService(
  input: ChurchServiceFormInput,
): Promise<ActionResult> {
  const parsed = churchServiceFormSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "聚會資料無效" };

  const supabase = await createClient();
  const v = parsed.data;
  const row = {
    church_id: v.churchId,
    name_zh: v.nameZh,
    schedule_label: v.scheduleLabel,
    day_of_week: v.dayOfWeek,
    language: v.language || null,
    description: v.description || null,
    sort_order: v.sortOrder,
    is_active: v.isActive,
  };

  const { error } = v.id
    ? await supabase.from("church_services").update(row).eq("id", v.id)
    : await supabase.from("church_services").insert(row);

  if (error) return { success: false, error: error.message };

  revalidatePath(`/admin/churches/${v.churchId}`);
  return { success: true };
}

export async function upsertWorshipSong(input: WorshipSongFormInput): Promise<ActionResult> {
  const parsed = worshipSongFormSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "詩歌資料無效" };

  const supabase = await createClient();
  const v = parsed.data;
  const row = {
    church_id: v.churchId,
    title: v.title,
    lyrics_markdown: v.lyricsMarkdown || null,
    file_url: v.fileUrl || null,
  };

  const { error } = v.id
    ? await supabase.from("worship_songs").update(row).eq("id", v.id)
    : await supabase.from("worship_songs").insert(row);

  if (error) return { success: false, error: error.message };

  revalidatePath(`/admin/churches/${v.churchId}`);
  return { success: true };
}

export async function upsertServiceMaterial(
  input: ServiceMaterialFormInput,
): Promise<ActionResult> {
  const parsed = serviceMaterialFormSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "資料無效" };

  const supabase = await createClient();
  const v = parsed.data;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const row = {
    church_id: v.churchId,
    service_id: v.serviceId,
    service_date: v.serviceDate,
    sermon_title: v.sermonTitle || null,
    sermon_speaker: v.sermonSpeaker || null,
    sermon_ppt_url: v.sermonPptUrl || null,
    notes: v.notes || null,
    status: v.status,
    created_by: user?.id,
  };

  let materialId = v.id;
  if (materialId) {
    const { error } = await supabase.from("service_materials").update(row).eq("id", materialId);
    if (error) return { success: false, error: error.message };
  } else {
    const { data, error } = await supabase
      .from("service_materials")
      .insert(row)
      .select("id")
      .single();
    if (error) return { success: false, error: error.message };
    materialId = data.id;
  }

  const { error: deleteError } = await supabase
    .from("service_material_songs")
    .delete()
    .eq("service_material_id", materialId);
  if (deleteError) return { success: false, error: deleteError.message };

  if (v.songIds.length > 0) {
    const { error: songsError } = await supabase.from("service_material_songs").insert(
      v.songIds.map((songId, index) => ({
        service_material_id: materialId,
        worship_song_id: songId,
        sort_order: index,
      })),
    );
    if (songsError) return { success: false, error: songsError.message };
  }

  revalidatePath(`/admin/churches/${v.churchId}`);
  return { success: true };
}

export async function submitChurchRegistration(
  input: ChurchRegistrationFormInput,
): Promise<ActionResult> {
  const parsed = churchRegistrationFormSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "請確認表單內容" };

  const supabase = await createClient();
  const v = parsed.data;
  const { error } = await supabase.from("church_registrations").insert({
    church_id: v.churchId,
    registration_type: v.registrationType,
    full_name: v.fullName,
    phone: v.phone || null,
    email: v.email || null,
    congregation_id: v.congregationId || null,
    message: v.message || null,
  });

  if (error) return { success: false, error: error.message };

  return { success: true };
}

export async function respondToChurchRegistration(
  input: RespondChurchRegistrationInput,
): Promise<ActionResult> {
  const parsed = respondChurchRegistrationSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "資料無效" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("church_registrations")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.registrationId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/churches");
  return { success: true };
}

export async function upsertChurchAnnouncement(
  input: ChurchAnnouncementFormInput,
): Promise<ActionResult> {
  const parsed = churchAnnouncementFormSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "公告資料無效" };

  const supabase = await createClient();
  const v = parsed.data;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const row = {
    church_id: v.churchId,
    title: v.title,
    body_markdown: v.bodyMarkdown,
    status: v.status,
    published_at: v.status === "published" ? new Date().toISOString() : null,
    created_by: user?.id,
  };

  const { error } = v.id
    ? await supabase.from("church_announcements").update(row).eq("id", v.id)
    : await supabase.from("church_announcements").insert(row);

  if (error) return { success: false, error: error.message };

  revalidatePath(`/admin/churches/${v.churchId}`);
  revalidatePath("/church");
  return { success: true };
}
