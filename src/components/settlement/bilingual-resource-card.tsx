"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";

const proseClasses =
  "max-w-none space-y-3 text-sm leading-relaxed [&_a]:underline [&_li]:ml-4 [&_li]:list-disc [&_p]:leading-relaxed";

export function BilingualResourceCard({
  titleZh,
  titleEn,
  bodyMarkdownZh,
  bodyMarkdownEn,
}: {
  titleZh: string;
  titleEn: string;
  bodyMarkdownZh: string;
  bodyMarkdownEn: string;
}) {
  const [showEnglish, setShowEnglish] = useState(false);

  return (
    <div className="space-y-3 rounded-lg border p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{showEnglish ? titleEn : titleZh}</h3>
          {!showEnglish && <p className="text-muted-foreground text-sm">{titleEn}</p>}
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowEnglish((v) => !v)}>
          {showEnglish ? "中文" : "English"}
        </Button>
      </div>
      <div className={proseClasses}>
        <ReactMarkdown>{showEnglish ? bodyMarkdownEn : bodyMarkdownZh}</ReactMarkdown>
      </div>
    </div>
  );
}
