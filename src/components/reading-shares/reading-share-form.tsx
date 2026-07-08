"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { submitReadingShare } from "@/lib/actions/reading-shares";

export function ReadingShareForm({
  books,
  defaultBookId,
}: {
  books: { id: string; title: string }[];
  defaultBookId?: string;
}) {
  const [bookId, setBookId] = useState(defaultBookId ?? books[0]?.id ?? "");
  const [sharedByName, setSharedByName] = useState("");
  const [sourceGroup, setSourceGroup] = useState("");
  const [quoteText, setQuoteText] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (!bookId || !quoteText.trim()) {
      toast.error("請選擇書籍並貼上分享內容");
      return;
    }
    startTransition(async () => {
      const result = await submitReadingShare({
        bookId,
        sharedByName: sharedByName || undefined,
        sourceGroup: sourceGroup || undefined,
        quoteText,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("已錄入分享，謝謝！");
      setSharedByName("");
      setSourceGroup("");
      setQuoteText("");
    });
  }

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <p className="text-muted-foreground text-sm">
        在 WhatsApp 群組／社群看到好的分享？把內容貼過來，讓好句子不再被洗掉。
      </p>
      <div className="space-y-1.5">
        <Label>書籍</Label>
        <Select items={Object.fromEntries(books.map((b) => [b.id, b.title]))} value={bookId} onValueChange={(v) => v && setBookId(v)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {books.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>分享內容（直接貼上 WhatsApp 訊息）</Label>
        <Textarea
          className="min-h-24"
          value={quoteText}
          onChange={(e) => setQuoteText(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>原分享人（選填）</Label>
          <Input
            placeholder="若不是你自己分享的"
            value={sharedByName}
            onChange={(e) => setSharedByName(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>來源群組（選填）</Label>
          <Input
            placeholder="例如：Boroondara 讀書會"
            value={sourceGroup}
            onChange={(e) => setSourceGroup(e.target.value)}
          />
        </div>
      </div>
      <Button disabled={isPending} onClick={handleSubmit}>
        {isPending ? "送出中…" : "錄入分享"}
      </Button>
    </div>
  );
}
