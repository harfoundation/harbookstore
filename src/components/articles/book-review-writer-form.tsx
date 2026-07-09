"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitTeamApplication } from "@/lib/actions/team-applications";

type Lang = "zh-Hant" | "zh-Hans" | "en";

const LABELS: Record<Lang, Record<string, string>> = {
  "zh-Hant": {
    name: "姓名",
    email: "電郵",
    phone: "電話（選填）",
    books: "有興趣評論的書籍（可複選，選填）",
    noBooks: "目前暫無書目可供選擇。",
    message: "寫作經驗 / 想對書評委員會說的話（選填）",
    messagePlaceholder: "是否曾寫過書評、閱讀習慣、期望的參與方式等",
    submit: "報名參與書評寫作",
    submitting: "送出中…",
    requireError: "請填寫姓名與電郵",
    thanksTitle: "感謝您的報名！",
    thanksBody: "書評委員會會盡快與您聯絡，一起閱讀、思考、書寫。",
  },
  "zh-Hans": {
    name: "姓名",
    email: "电邮",
    phone: "电话（选填）",
    books: "有兴趣评论的书籍（可复选，选填）",
    noBooks: "目前暂无书目可供选择。",
    message: "写作经验 / 想对书评委员会说的话（选填）",
    messagePlaceholder: "是否曾写过书评、阅读习惯、期望的参与方式等",
    submit: "报名参与书评写作",
    submitting: "送出中…",
    requireError: "请填写姓名与电邮",
    thanksTitle: "感谢您的报名！",
    thanksBody: "书评委员会会尽快与您联络，一起阅读、思考、书写。",
  },
  en: {
    name: "Full Name",
    email: "Email",
    phone: "Phone (optional)",
    books: "Books you're interested in reviewing (select any, optional)",
    noBooks: "No books available to select right now.",
    message: "Writing experience / anything you'd like the committee to know (optional)",
    messagePlaceholder: "Prior review writing, reading habits, how you'd like to participate, etc.",
    submit: "Sign Up to Write Reviews",
    submitting: "Submitting…",
    requireError: "Please fill in your name and email",
    thanksTitle: "Thank you for signing up!",
    thanksBody: "The Book Review Committee will be in touch soon — let's read, think, and write together.",
  },
};

export function BookReviewWriterForm({
  books,
  defaultName = "",
  defaultEmail = "",
  lang = "zh-Hant",
}: {
  books: { id: string; title: string }[];
  defaultName?: string;
  defaultEmail?: string;
  lang?: Lang;
}) {
  const t = LABELS[lang];
  const [fullName, setFullName] = useState(defaultName);
  const [contactEmail, setContactEmail] = useState(defaultEmail);
  const [contactPhone, setContactPhone] = useState("");
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="rounded-lg border p-6 text-center">
        <p className="font-medium">{t.thanksTitle}</p>
        <p className="text-muted-foreground mt-1 text-sm">{t.thanksBody}</p>
      </div>
    );
  }

  function toggleBook(id: string) {
    setSelectedBookIds((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id],
    );
  }

  async function handleSubmit() {
    if (!fullName.trim() || !contactEmail.trim()) {
      toast.error(t.requireError);
      return;
    }
    setSubmitting(true);
    const selectedTitles = books
      .filter((b) => selectedBookIds.includes(b.id))
      .map((b) => b.title)
      .join("、");
    const result = await submitTeamApplication({
      fullName,
      contactEmail,
      contactPhone: contactPhone || undefined,
      applicationType: "book_review_writer",
      roleInterest: selectedTitles || undefined,
      message: message || undefined,
    });
    setSubmitting(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    setSubmitted(true);
  }

  return (
    <div className="space-y-4 rounded-lg border p-5">
      <div className="space-y-1.5">
        <Label>{t.name}</Label>
        <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>{t.email}</Label>
          <Input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>{t.phone}</Label>
          <Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>{t.books}</Label>
        {books.length === 0 ? (
          <p className="text-muted-foreground text-sm">{t.noBooks}</p>
        ) : (
          <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border p-3">
            {books.map((book) => (
              <label key={book.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedBookIds.includes(book.id)}
                  onChange={() => toggleBook(book.id)}
                />
                {book.title}
              </label>
            ))}
          </div>
        )}
      </div>
      <div className="space-y-1.5">
        <Label>{t.message}</Label>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t.messagePlaceholder}
        />
      </div>
      <Button className="w-full" disabled={submitting} onClick={handleSubmit}>
        {submitting ? t.submitting : t.submit}
      </Button>
    </div>
  );
}
