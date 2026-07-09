import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { BilingualResourceCard } from "@/components/settlement/bilingual-resource-card";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "移民安家 Settle in Australia" };

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
          移民安家 <span className="font-poppins">Settle in Australia</span>
        </h1>
        <p className="text-muted-foreground mx-auto max-w-2xl text-balance">
          無論你剛抵埗，還是移民二代想重新扎根——買租房、創業、學習就業，這裡都有實用的入門指引。
          歡迎所有新移民朋友，不論是否已信主。
        </p>
        <p className="text-muted-foreground mx-auto max-w-2xl text-balance text-sm">
          Whether you&apos;ve just arrived or are a second-generation migrant finding your
          footing again — practical guidance on housing, starting a business, and study
          &amp; employment. Open to all newcomers, believers and non-believers alike.
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
