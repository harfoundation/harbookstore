import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { BilingualResourceCard } from "@/components/settlement/bilingual-resource-card";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "留學和移民 Study & Migration" };

const CATEGORIES: { key: string; titleZh: string; titleEn: string }[] = [
  { key: "housing", titleZh: "買租房安家", titleEn: "Housing" },
  { key: "business", titleZh: "創業做生意", titleEn: "Starting a Business" },
  { key: "employment_study", titleZh: "學習與就業", titleEn: "Study & Employment" },
];

export default async function SettlePage() {
  const supabase = await createClient();
  const { data: resources } = await supabase
    .from("settlement_resources")
    .select("id, category, title_zh, title_en, body_markdown_zh, body_markdown_en")
    .eq("status", "published")
    .order("sort_order");

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <header className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">
          留學和移民 <span className="font-poppins">Study &amp; Migration</span>
        </h1>
        <p className="text-muted-foreground mx-auto max-w-2xl text-balance">
          無論你是遠道而來的留學生，或正努力在澳洲落地生根的新移民，這條路上少不了學業、工作、婚姻與家庭的種種挑戰。山書坊願以聖經的智慧書卷——箴言、傳道書、約伯記——陪你走過這段旅程，不僅幫助你順利完成學業、開展事業、建立婚姻家庭，更帶你看見這一切經歷背後，神為你預備的更深意義。歡迎所有新移民朋友，不論是否已信主。
        </p>
        <p className="text-muted-foreground mx-auto max-w-2xl text-balance text-sm">
          Whether you&apos;ve come from afar to study, or are working to put down roots as a
          new migrant in Australia, this road brings its own challenges — studies, work,
          marriage, and family. Har Book Club walks alongside you with Scripture&apos;s Wisdom
          Books — Proverbs, Ecclesiastes, Job — not just to help you finish your studies,
          build a career, and start a family, but to help you see the deeper meaning God has
          prepared behind it all. Open to all newcomers, believers and non-believers alike.
        </p>
      </header>

      {CATEGORIES.map((cat) => {
        const items = (resources ?? []).filter((r) => r.category === cat.key);
        if (items.length === 0) return null;
        return (
          <section key={cat.key} className="space-y-3">
            <h2 className="text-xl font-semibold">
              {cat.titleZh} <span className="text-muted-foreground font-poppins text-base">{cat.titleEn}</span>
            </h2>
            <div className="space-y-3">
              {items.map((r) => (
                <BilingualResourceCard
                  key={r.id}
                  titleZh={r.title_zh}
                  titleEn={r.title_en}
                  bodyMarkdownZh={r.body_markdown_zh}
                  bodyMarkdownEn={r.body_markdown_en}
                />
              ))}
            </div>
          </section>
        );
      })}

      {(resources ?? []).length === 0 && (
        <p className="text-muted-foreground text-center text-sm">
          安家資源準備中，敬請期待。 Resources coming soon.
        </p>
      )}
    </div>
  );
}
