"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { deleteLessonTranscript, upsertLessonTranscript } from "@/lib/actions/courses";
import {
  TRANSCRIPT_LANGUAGES,
  type TranscriptLanguage,
} from "@/lib/courses/transcript-languages";

export type AdminTranscript = {
  language: TranscriptLanguage;
  is_original: boolean;
  content: string;
};

export function LessonTranscriptsDialog({
  courseId,
  lessonId,
  lessonTitle,
  transcripts,
  trigger,
}: {
  courseId: string;
  lessonId: string;
  lessonTitle: string;
  transcripts: AdminTranscript[];
  trigger: React.ReactElement;
}) {
  const first = transcripts[0];
  const [language, setLanguage] = useState<TranscriptLanguage>(
    first?.language ?? "zh-Hant",
  );
  const [isOriginal, setIsOriginal] = useState(first?.is_original ?? true);
  const [content, setContent] = useState(first?.content ?? "");
  const [saving, setSaving] = useState(false);

  const load = (lang: TranscriptLanguage) => {
    const existing = transcripts.find((t) => t.language === lang);
    setLanguage(lang);
    setIsOriginal(existing?.is_original ?? transcripts.length === 0);
    setContent(existing?.content ?? "");
  };

  return (
    <Dialog>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>講稿與翻譯 — {lessonTitle}</DialogTitle>
        </DialogHeader>

        <p className="text-muted-foreground text-xs">
          每種語言一份講稿。學員在課堂頁一邊看錄影、一邊閱讀，也可以兩種語言對照。簡體中文由網站的繁／简切換自動轉換，不必另存。
        </p>

        {transcripts.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {transcripts.map((t) => (
              <Button
                key={t.language}
                size="sm"
                variant={t.language === language ? "secondary" : "outline"}
                onClick={() => load(t.language)}
              >
                {TRANSCRIPT_LANGUAGES[t.language]}
                {t.is_original && "（原文）"}
              </Button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>語言</Label>
            <Select
              items={TRANSCRIPT_LANGUAGES}
              value={language}
              onValueChange={(v) => load(v as TranscriptLanguage)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TRANSCRIPT_LANGUAGES).map(([code, label]) => (
                  <SelectItem key={code} value={code}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <label className="flex items-end gap-2 pb-2 text-sm">
            <input
              type="checkbox"
              checked={isOriginal}
              onChange={(e) => setIsOriginal(e.target.checked)}
            />
            這是講員原文（其他語言為翻譯）
          </label>
        </div>

        <div className="space-y-1.5">
          <Label>講稿內容</Label>
          <Textarea
            className="min-h-64 text-sm"
            placeholder="貼上錄影的文字稿或翻譯。段落之間空一行。"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div className="flex justify-between gap-2">
          {transcripts.some((t) => t.language === language) ? (
            <Button
              variant="ghost"
              disabled={saving}
              onClick={async () => {
                setSaving(true);
                const result = await deleteLessonTranscript(courseId, lessonId, language);
                setSaving(false);
                if (!result.success) toast.error(result.error);
                else toast.success("已刪除");
              }}
            >
              刪除此語言
            </Button>
          ) : (
            <span />
          )}
          <Button
            disabled={saving || !content.trim()}
            onClick={async () => {
              setSaving(true);
              const result = await upsertLessonTranscript({
                courseId,
                lessonId,
                language,
                isOriginal,
                content,
              });
              setSaving(false);
              if (!result.success) toast.error(result.error);
              else toast.success(`已儲存${TRANSCRIPT_LANGUAGES[language]}講稿`);
            }}
          >
            {saving ? "儲存中…" : "儲存"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
