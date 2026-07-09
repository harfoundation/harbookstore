"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toSimplified } from "@/lib/i18n/opencc-converter";
import { BookReviewWriterForm } from "@/components/articles/book-review-writer-form";

type Lang = "zh-Hant" | "zh-Hans" | "en";

const TITLE_ZH = "山書坊邀請｜中文屬靈書籍書評寫作";
const TITLE_EN = "Har Book Club Invites You | Chinese Spiritual Book Review Writing";

const BODY_ZH = [
  "閱讀，不只是為了增加知識，更是為了讓生命被塑造。",
  "山書坊誠意邀請喜愛閱讀、願意思考、樂於分享的弟兄姊妹，參與「中文屬靈書籍書評寫作」。",
  "透過閱讀與書評，我們盼望：",
  [
    "培養教會閱讀屬靈書籍的文化；",
    "分享閱讀所得，彼此建立生命；",
    "推廣優質中文屬靈出版，讓更多人受益；",
    "建立一個彼此交流、共同成長的閱讀群體。",
  ],
  "無論您是第一次嘗試寫書評，還是已有寫作經驗，都非常歡迎參與。我們將提供適當的交流、分享及寫作指引，讓大家一起學習、一起成長。",
  "山書坊書評委員會已正式成立，將配合推動這項事工，主要負責：",
  [
    "提供書評寫作訓練，幫助參與者掌握書評寫作的基本技巧；",
    "為投稿書評提供編輯及修改建議，提升書評的內容、結構及表達；",
    "審閱所有投稿作品，並決定書評是否採納及安排發表。",
  ],
  "我們盼望透過書評委員會的服事，培育更多樂於閱讀、善於思考、勇於分享的基督徒作者，讓優質的屬靈閱讀資源成為眾教會的祝福。",
  "誠邀您加入我們，一起閱讀、思考、書寫，讓一本好書成為更多人的祝福。",
  "如有興趣參與，歡迎與山書坊聯絡，或報名加入「中文屬靈書籍書評寫作」。",
] as const;

const BODY_EN = [
  "Reading isn't just about gaining knowledge — it's about letting our lives be shaped.",
  "Har Book Club warmly invites brothers and sisters who love reading, enjoy thinking deeply, and are eager to share, to join our “Chinese Spiritual Book Review Writing” initiative.",
  "Through reading and reviewing, we hope to:",
  [
    "Cultivate a culture of reading spiritual books within the church;",
    "Share what we gain from reading, so we can build one another up;",
    "Promote quality Chinese-language spiritual publishing, for the benefit of more readers;",
    "Build a community of readers who learn and grow together.",
  ],
  "Whether this is your first time writing a book review or you already have writing experience, you are warmly welcome to join. We'll provide guidance, discussion, and sharing along the way, so we can all learn and grow together.",
  "The Har Book Club Book Review Committee has been formally established to help drive this ministry forward. Its main responsibilities are to:",
  [
    "Provide training in book review writing, helping participants grasp the basics;",
    "Offer editorial suggestions on submitted reviews, to improve their content, structure, and expression;",
    "Review all submissions and decide whether — and when — a review is accepted for publication.",
  ],
  "Through the Book Review Committee's service, we hope to nurture more Christian writers who love to read, think carefully, and share courageously — turning quality spiritual reading resources into a blessing for churches everywhere.",
  "We warmly invite you to join us — to read, think, and write, so that one good book can become a blessing to many more people.",
  "If you're interested in taking part, please get in touch with Har Book Club, or sign up for “Chinese Spiritual Book Review Writing” below.",
] as const;

const GATE_TEXT = {
  "zh-Hant": {
    heading: "請先註冊或登入帳號",
    body: "這樣書評委員會日後才能透過您的帳號與您聯繫、追蹤投稿進度。",
    signup: "立即註冊",
    login: "登入",
  },
  "zh-Hans": {
    heading: "请先注册或登入帐号",
    body: "这样书评委员会日后才能透过您的帐号与您联系、追踪投稿进度。",
    signup: "立即注册",
    login: "登入",
  },
  en: {
    heading: "Please sign up or log in first",
    body: "This lets the Book Review Committee follow up with you and track your submission through your account.",
    signup: "Sign Up",
    login: "Log In",
  },
} as const;

const LANG_LABELS: Record<Lang, string> = { "zh-Hant": "繁體", "zh-Hans": "簡體", en: "English" };

function renderBody(lang: Lang) {
  const paragraphs: readonly (string | readonly string[])[] = lang === "en" ? BODY_EN : BODY_ZH;
  return paragraphs.map((item, i) => {
    if (typeof item !== "string") {
      return (
        <ul key={i} className="ml-4 list-disc space-y-1">
          {item.map((line, j) => (
            <li key={j}>{lang === "zh-Hans" ? toSimplified(line) : line}</li>
          ))}
        </ul>
      );
    }
    const text = lang === "zh-Hans" ? toSimplified(item) : item;
    return (
      <p key={i} className={i === paragraphs.length - 1 ? "text-muted-foreground" : undefined}>
        {text}
      </p>
    );
  });
}

export function WriteReviewPageContent({
  isLoggedIn,
  books,
  defaultName,
  defaultEmail,
}: {
  isLoggedIn: boolean;
  books: { id: string; title: string }[];
  defaultName: string;
  defaultEmail: string;
}) {
  const [lang, setLang] = useState<Lang>("zh-Hant");
  const gate = GATE_TEXT[lang];

  return (
    <div className="space-y-8">
      <div className="flex justify-end gap-1">
        {(Object.keys(LANG_LABELS) as Lang[]).map((l) => (
          <Button
            key={l}
            size="sm"
            variant={lang === l ? "default" : "outline"}
            onClick={() => setLang(l)}
          >
            {LANG_LABELS[l]}
          </Button>
        ))}
      </div>

      <h1 className="text-2xl font-bold">
        {lang === "en" ? TITLE_EN : lang === "zh-Hans" ? toSimplified(TITLE_ZH) : TITLE_ZH}
      </h1>

      <div className="space-y-4 text-sm leading-relaxed">{renderBody(lang)}</div>

      {isLoggedIn ? (
        <BookReviewWriterForm
          books={books}
          defaultName={defaultName}
          defaultEmail={defaultEmail}
          lang={lang}
        />
      ) : (
        <div className="space-y-3 rounded-lg border p-6 text-center">
          <p className="font-medium">{gate.heading}</p>
          <p className="text-muted-foreground text-sm">{gate.body}</p>
          <div className="flex justify-center gap-2 pt-1">
            <Button render={<Link href="/signup?next=/articles/write" />}>{gate.signup}</Button>
            <Button variant="outline" render={<Link href="/login?next=/articles/write" />}>
              {gate.login}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
