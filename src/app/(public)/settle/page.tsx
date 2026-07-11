import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { BilingualResourceCard } from "@/components/settlement/bilingual-resource-card";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "留學和移民" };

const CATEGORIES: { key: string; titleZh: string }[] = [
  { key: "housing", titleZh: "買租房安家" },
  { key: "business", titleZh: "創業做生意" },
  { key: "employment_study", titleZh: "學習與就業" },
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
        <h1 className="text-3xl font-bold">留學和移民</h1>
        <p className="text-muted-foreground mx-auto max-w-2xl text-balance">
          無論你剛抵埗，還是移民二代想重新扎根——買租房、創業、學習就業，這裡都有實用的入門指引。
          歡迎所有新移民朋友，不論是否已信主。
        </p>
      </header>

      {CATEGORIES.map((cat) => {
        const items = (resources ?? []).filter((r) => r.category === cat.key);
        if (items.length === 0) return null;
        return (
          <section key={cat.key} className="space-y-3">
            <h2 className="text-xl font-semibold">{cat.titleZh}</h2>
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
        <p className="text-muted-foreground text-center text-sm">安家資源準備中，敬請期待。</p>
      )}
    </div>
  );
}
