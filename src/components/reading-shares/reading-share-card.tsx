"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getWhatsappShareLink } from "@/lib/whatsapp";
import { setReadingShareHidden, deleteReadingShare } from "@/lib/actions/reading-shares";

export function ReadingShareCard({
  share,
  showModeration = false,
}: {
  share: {
    id: string;
    book_title: string;
    shared_by_name: string | null;
    source_group: string | null;
    quote_text: string;
    is_hidden: boolean;
    created_at: string;
  };
  showModeration?: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  const shareMessage = `《${share.book_title}》讀書分享：\n\n${share.quote_text}${
    share.shared_by_name ? `\n\n— ${share.shared_by_name}` : ""
  }`;

  function toggleHidden() {
    startTransition(async () => {
      const result = await setReadingShareHidden(share.id, !share.is_hidden);
      if (!result.success) toast.error(result.error);
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteReadingShare(share.id);
      if (!result.success) toast.error(result.error);
    });
  }

  return (
    <div className="space-y-2 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <Badge variant="outline">{share.book_title}</Badge>
        {share.is_hidden && <Badge variant="secondary">已隱藏</Badge>}
      </div>
      <p className="text-sm whitespace-pre-wrap">{share.quote_text}</p>
      <div className="text-muted-foreground flex flex-wrap items-center gap-x-2 text-xs">
        {share.shared_by_name && <span>分享人：{share.shared_by_name}</span>}
        {share.source_group && <span>來源：{share.source_group}</span>}
        <span>{new Date(share.created_at).toLocaleDateString("zh-TW")}</span>
      </div>
      <div className="flex flex-wrap gap-2 pt-1">
        <Button
          size="sm"
          variant="outline"
          render={
            <a
              href={getWhatsappShareLink(shareMessage)}
              target="_blank"
              rel="noreferrer"
            />
          }
        >
          分享到 WhatsApp
        </Button>
        {showModeration && (
          <>
            <Button size="sm" variant="ghost" disabled={isPending} onClick={toggleHidden}>
              {share.is_hidden ? "取消隱藏" : "隱藏"}
            </Button>
            <Button size="sm" variant="ghost" disabled={isPending} onClick={handleDelete}>
              刪除
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
