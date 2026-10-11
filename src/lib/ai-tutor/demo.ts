import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { EXAMPLE_QUESTIONS } from "@/lib/ai-tutor/examples";
import type { TutorReply, TutorSource } from "@/lib/ai-tutor/tutor";

// Demo mode: used when ANTHROPIC_API_KEY is not set, so the pastor and board
// can try the page before the API account exists. No model is called. The
// starter questions get prepared answers written against the sample library;
// anything else gets the raw library search results. Every reply says so.

export function isTutorLive() {
  return !!process.env.ANTHROPIC_API_KEY;
}

const DEMO_NOTICE =
  "> **演示模式**：AI 尚未接通，以下內容是預先準備的示範，並非即時生成。";

const PREPARED: Record<
  (typeof EXAMPLE_QUESTIONS)[number],
  { refs: string[]; answer: string }
> = {
  [EXAMPLE_QUESTIONS[0]]: {
    refs: [
      "馬太福音 6:9",
      "馬太福音 6:10",
      "馬太福音 6:11",
      "馬太福音 6:12",
      "馬太福音 6:13",
    ],
    answer: `## 主禱文逐句解讀

主禱文由稱呼、三個關於神的祈求、三個關於我們的祈求，以及結尾的頌讚組成。

1. **「我們在天上的父」**（馬太福音 6:9）：禱告從關係開始。「我們」表示這是群體的禱告，「天上」提醒我們父的尊貴與主權。
2. **「願人都尊你的名為聖」**（6:9）：第一個祈求不是為自己，而是願神的名被尊崇。
3. **「願你的國降臨；願你的旨意行在地上，如同行在天上」**（6:10）：求神的統治在世上彰顯，也是把自己的意願交在神的旨意之下。
4. **「我們日用的飲食，今日賜給我們」**（6:11）：轉向我們的需要，只求「今日」所需，學習天天倚靠。
5. **「免我們的債，如同我們免了人的債」**（6:12）：蒙赦免與饒恕人連在一起。
6. **「不叫我們遇見試探；救我們脫離兇惡」**（6:13）：承認自己軟弱，求神保守。
7. **「因為國度、權柄、榮耀，全是你的，直到永遠。阿們！」**（6:13）：以頌讚作結，回到開頭對神的仰望。

**反思問題**
- 你平常的禱告，關於神的祈求和關於自己的祈求，比例如何？
- 第 12 節把領受赦免和饒恕別人放在一起，這對你目前的人際關係有什麼提醒？`,
  },
  [EXAMPLE_QUESTIONS[1]]: {
    refs: [
      "羅馬書 1:16",
      "羅馬書 1:17",
      "羅馬書 3:23",
      "羅馬書 3:24",
      "羅馬書 5:1",
      "以弗所書 2:8",
      "以弗所書 2:9",
    ],
    answer: `## 羅馬書中的「因信稱義」

文獻庫目前的節選可以勾勒出保羅論證的主線：

1. **福音顯明神的義**：「神的義正在這福音上顯明出來；這義是本於信，以致於信。如經上所記：義人必因信得生。」（羅馬書 1:17）
2. **人人都需要**：「世人都犯了罪，虧缺了神的榮耀」（3:23），所以沒有人能靠自己被算為義。
3. **白白的恩典**：「如今卻蒙神的恩典，因基督耶穌的救贖，就白白地稱義。」（3:24）稱義的根據是基督的救贖，不是人的功德。
4. **稱義的結果**：「我們既因信稱義，就藉著我們的主耶穌基督得與神相和。」（5:1）

保羅在以弗所書也有相同的教導：「你們得救是本乎恩，也因著信……也不是出於行為，免得有人自誇。」（以弗所書 2:8–9）

**提醒**：示範文獻庫只有少量節選。羅馬書第 4 章以亞伯拉罕為例的論證尚未收錄，正式使用時會有更完整的引文。

**反思問題**
- 「白白地稱義」與你過去對信仰的理解有什麼不同？`,
  },
  [EXAMPLE_QUESTIONS[2]]: {
    refs: [],
    answer: `## 加爾文與路德對聖餐的理解

**文獻庫中沒有找到相關資料。** 目前收錄的只有少量聖經節選，還沒有加爾文或路德的著作，所以下面只能提供一般性的概括，**不是引文**：

- **路德**強調基督的身體和血真實地臨在於聖餐的餅和杯「之中、同在、之下」，並以「這是我的身體」的字面意義為依據。
- **加爾文**同樣肯定基督真實臨在，但理解為屬靈的臨在：信徒藉著聖靈，在領受聖餐時真實地與基督相交。

**建議**
- 這是宗派之間長期討論的題目，請與授課牧師一起研讀。
- 若要 AI 導師能引用原文，可考慮把加爾文《基督教要義》卷四第十七章、路德《大教理問答》論聖餐的部分（皆屬公版的舊譯本）加入文獻庫。`,
  },
};

async function sourcesForRefs(refs: string[]): Promise<TutorSource[]> {
  if (refs.length === 0) return [];
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("theology_chunks")
    .select("id, ref_label, theology_sources!inner(title, is_published)")
    .eq("theology_sources.is_published", true)
    .in("ref_label", refs);
  return (data ?? []).map((r) => ({
    id: r.id,
    source_title: r.theology_sources.title,
    ref_label: r.ref_label,
  }));
}

// Character bigrams of the CJK runs plus whole Latin words — a crude stand-in
// for the keywords the model would choose.
function demoSearchTerms(question: string): string[] {
  const terms = new Set<string>();
  for (const run of question.match(/[一-鿿]+/g) ?? []) {
    for (let i = 0; i + 1 < run.length; i++) terms.add(run.slice(i, i + 2));
  }
  for (const word of question.match(/[A-Za-z]{3,}/g) ?? []) terms.add(word);
  return [...terms].slice(0, 40);
}

export async function runDemoTutor(question: string): Promise<TutorReply> {
  const prepared = PREPARED[question.trim() as keyof typeof PREPARED];
  if (prepared) {
    return {
      text: `${DEMO_NOTICE}\n\n${prepared.answer}`,
      sources: await sourcesForRefs(prepared.refs),
      inputTokens: 0,
      outputTokens: 0,
    };
  }

  const supabase = createAdminClient();
  const { data } = await supabase.rpc("search_theology_chunks", {
    terms: demoSearchTerms(question),
    max_results: 5,
  });
  const rows = data ?? [];
  const body =
    rows.length === 0
      ? "文獻庫中沒有找到與這個問題相關的段落。接通 AI 後，導師會說明找不到資料，並提供標明為概括的一般說明。"
      : "AI 接通後會根據這些段落整理成回答並註明出處。目前先列出文獻庫中最相關的段落：\n\n" +
        rows
          .map((r) => `> **${r.ref_label}**（${r.source_title}）\n> ${r.content}`)
          .join("\n\n");

  return {
    text: `> **演示模式**：AI 尚未接通，以下是文獻庫的檢索結果，未經 AI 整理。\n\n${body}`,
    sources: rows.map((r) => ({
      id: r.id,
      source_title: r.source_title,
      ref_label: r.ref_label,
    })),
    inputTokens: 0,
    outputTokens: 0,
  };
}
