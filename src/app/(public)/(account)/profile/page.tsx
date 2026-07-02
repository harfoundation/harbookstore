import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { PreferenceTagsEditor } from "@/components/profile/preference-tags-editor";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "個人資料" };

export default async function ProfilePage() {
  const profile = await getCurrentProfile();
  if (!profile) return null; // guarded by (account) layout

  const supabase = await createClient();
  const [{ data: allTags }, { data: selectedTags }] = await Promise.all([
    supabase.from("preference_tags").select("id, label_zh").order("sort_order"),
    supabase
      .from("profile_preference_tags")
      .select("tag_id")
      .eq("profile_id", profile.id),
  ]);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">個人資料</h1>

      <div className="space-y-1">
        <p className="text-muted-foreground text-sm">名稱</p>
        <p>{profile.displayName ?? "（未設定）"}</p>
      </div>

      <div className="space-y-1">
        <p className="text-muted-foreground text-sm">電郵</p>
        <p>{profile.email}</p>
      </div>

      <div className="space-y-2">
        <p className="text-muted-foreground text-sm">喜好標籤（點選以切換）</p>
        <PreferenceTagsEditor
          allTags={allTags ?? []}
          selectedTagIds={(selectedTags ?? []).map((t) => t.tag_id)}
          profileId={profile.id}
        />
      </div>
    </div>
  );
}
