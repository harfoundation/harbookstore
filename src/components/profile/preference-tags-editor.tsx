"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

export function PreferenceTagsEditor({
  allTags,
  selectedTagIds,
  profileId,
}: {
  allTags: { id: string; label_zh: string }[];
  selectedTagIds: string[];
  profileId: string;
}) {
  const [selected, setSelected] = useState(new Set(selectedTagIds));
  const [isPending, startTransition] = useTransition();

  function toggle(tagId: string) {
    const supabase = createClient();
    const isSelected = selected.has(tagId);

    startTransition(async () => {
      if (isSelected) {
        await supabase
          .from("profile_preference_tags")
          .delete()
          .eq("profile_id", profileId)
          .eq("tag_id", tagId);
      } else {
        await supabase
          .from("profile_preference_tags")
          .insert({ profile_id: profileId, tag_id: tagId });
      }
      setSelected((prev) => {
        const next = new Set(prev);
        if (isSelected) next.delete(tagId);
        else next.add(tagId);
        return next;
      });
      toast.success("已更新喜好標籤");
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {allTags.map((tag) => (
        <button
          key={tag.id}
          type="button"
          disabled={isPending}
          onClick={() => toggle(tag.id)}
        >
          <Badge variant={selected.has(tag.id) ? "default" : "outline"}>
            {tag.label_zh}
          </Badge>
        </button>
      ))}
    </div>
  );
}
