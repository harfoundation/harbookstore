import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { CourseNudgeEmail } from "@/lib/email/templates/course-nudge";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM =
  process.env.RESEND_FROM_EMAIL ?? "山書房 Har Bookstore <no-reply@harfoundation.org.au>";

/**
 * Weekly course-progress nudge. Triggered by Vercel Cron (see vercel.json) —
 * a single scheduled job, not a full notification-preferences subsystem.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: staleProgress, error } = await admin
    .from("course_progress")
    .select("profile_id, updated_at, lessons(title)")
    .eq("completed", false)
    .lt("updated_at", sevenDaysAgo)
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!resend) {
    return NextResponse.json({
      skipped: true,
      reason: "RESEND_API_KEY not set",
      candidates: staleProgress?.length ?? 0,
    });
  }

  const seenProfiles = new Set<string>();
  let sent = 0;

  for (const row of staleProgress ?? []) {
    if (seenProfiles.has(row.profile_id)) continue;
    seenProfiles.add(row.profile_id);

    const { data } = await admin.auth.admin.getUserById(row.profile_id);
    const to = data.user?.email;
    if (!to) continue;

    const lesson = row.lessons as unknown as { title: string } | null;
    await resend.emails.send({
      from: FROM,
      to,
      subject: "還在等您回來 — 山書房課程陪伴提醒",
      react: CourseNudgeEmail({ lessonTitle: lesson?.title ?? "您的課程" }),
    });
    sent++;
  }

  return NextResponse.json({ sent });
}
