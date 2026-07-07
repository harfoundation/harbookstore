"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { eventFormSchema, type EventFormInput } from "@/lib/validation/event.schema";

type ActionResult = { success: true } | { success: false; error: string };

export async function upsertEvent(input: EventFormInput): Promise<ActionResult> {
  const parsed = eventFormSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "活動資料無效" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "請先登入" };

  const v = parsed.data;
  const row = {
    title: v.title,
    slug: v.slug,
    description: v.description || null,
    body_markdown: v.bodyMarkdown || null,
    event_date: v.eventDate,
    event_time: v.eventTime || null,
    location: v.location || null,
    poster_image_url: v.posterImageUrl || null,
    status: v.status,
  };

  const { error } = v.id
    ? await supabase.from("events").update(row).eq("id", v.id)
    : await supabase.from("events").insert({ ...row, created_by: user.id });

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/events");
  revalidatePath("/events");
  revalidatePath(`/events/${v.slug}`);
  revalidatePath("/");
  return { success: true };
}
