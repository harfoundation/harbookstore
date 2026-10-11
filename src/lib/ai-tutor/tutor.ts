import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod/v4";
import { createAdminClient } from "@/lib/supabase/admin";

export const TUTOR_MODEL = "claude-opus-5-5";

export type TutorSource = { id: number; source_title: string; ref_label: string };

export type TutorReply = {
  text: string;
  sources: TutorSource[];
  inputTokens: number;
  outputTokens: number;
};

// Kept stable byte-for-byte so the prompt cache hits across requests.
const SYSTEM_PROMPT = `你是「HAR AI 神學導師」，在華人教會的神學教育課程中，協助學生讀經、查考神學資料和獨立思考。課程內容與神學判斷由授課牧師和教師負責，你是輔助者，不是權威。

工作方式：
1. 回答涉及經文或神學家觀點的問題前，先用 search_library 查找文獻庫；需要完整經文時用 get_bible_passage。可以多次搜尋，換用同義詞、人名、書名或經文中的關鍵字。
2. 只把文獻庫中實際找到的內容當作引文。引用時註明出處，例如（約翰福音 3:16）或（加爾文《基督教要義》卷一 第一章）。
3. 文獻庫裡找不到可靠資料時，明確說「文獻庫中沒有找到相關資料」，可以提供一般性的說明，但要標明那是你的概括，不是引文。絕不編造引文、頁碼或出處。
4. 介紹不同傳統（如改革宗、路德宗、天主教、五旬節派）時，公平呈現各自的論據，不替學生下結論；遇到教會內部有爭議的問題，提醒學生與授課牧師討論。
5. 你的回答不能取代聖經原意或教會的權威教導。涉及個人輔導、危機或牧養需要時，溫和地建議學生聯絡牧師。
6. 鼓勵學生自己讀經和思考：適時提出一兩個反思問題。

用學生提問所用的中文字體（繁體或簡體）回答；學生用英文提問時用英文回答。回答條理清楚，使用 Markdown 標題和列表。`;

const MAX_TOOL_ROUNDS = 8;

export async function runTutor(
  history: Anthropic.Beta.BetaMessageParam[],
): Promise<TutorReply> {
  const supabase = createAdminClient();
  const seen = new Map<number, TutorSource>();

  const remember = (rows: { id: number; source_title: string; ref_label: string }[]) => {
    for (const r of rows) {
      seen.set(r.id, { id: r.id, source_title: r.source_title, ref_label: r.ref_label });
    }
  };

  const searchLibrary = betaZodTool({
    name: "search_library",
    description:
      "在 HAR 神學文獻庫（聖經譯本、公版神學著作、教師講義）中按關鍵字搜尋段落。中文沒有詞界，請提供 2–6 個簡短的關鍵字或片語（例如「因信稱義」「禱告」「加爾文」），結果按命中關鍵字數量排序。",
    inputSchema: z.object({
      keywords: z.array(z.string().min(1).max(40)).min(1).max(8),
      only_bible: z.boolean().optional().describe("只搜尋聖經經文"),
    }),
    run: async ({ keywords, only_bible }) => {
      const { data, error } = await supabase.rpc("search_theology_chunks", {
        terms: keywords,
        max_results: 12,
        only_kind: only_bible ? "bible" : undefined,
      });
      if (error) return `搜尋失敗：${error.message}`;
      if (!data || data.length === 0) return "文獻庫中沒有找到包含這些關鍵字的段落。";
      remember(data);
      return data
        .map(
          (r) =>
            `【${r.source_title}${r.source_author ? `（${r.source_author}）` : ""} · ${r.ref_label}】\n${r.content}`,
        )
        .join("\n\n");
    },
  });

  const getBiblePassage = betaZodTool({
    name: "get_bible_passage",
    description:
      "取得一段完整經文（和合本等文獻庫內的譯本）。book 使用中文書卷全名，例如「約翰福音」「詩篇」「羅馬書」。",
    inputSchema: z.object({
      book: z.string().min(1).max(20),
      chapter: z.number().int().min(1).max(150),
      verse_start: z.number().int().min(1).optional(),
      verse_end: z.number().int().min(1).optional(),
    }),
    run: async ({ book, chapter, verse_start, verse_end }) => {
      let query = supabase
        .from("theology_chunks")
        .select(
          "id, verse, content, ref_label, theology_sources!inner(title, kind, is_published)",
        )
        .eq("theology_sources.kind", "bible")
        .eq("theology_sources.is_published", true)
        .eq("book", book)
        .eq("chapter", chapter)
        .order("verse")
        .limit(176);
      if (verse_start) query = query.gte("verse", verse_start);
      if (verse_end) query = query.lte("verse", verse_end);
      const { data, error } = await query;
      if (error) return `查詢失敗：${error.message}`;
      if (!data || data.length === 0)
        return `文獻庫中沒有「${book} ${chapter} 章」的經文。`;

      const byTranslation = new Map<string, typeof data>();
      for (const row of data) {
        const title = row.theology_sources.title;
        byTranslation.set(title, [...(byTranslation.get(title) ?? []), row]);
      }
      remember(
        data.map((r) => ({
          id: r.id,
          source_title: r.theology_sources.title,
          ref_label: r.ref_label,
        })),
      );
      return [...byTranslation.entries()]
        .map(
          ([title, rows]) =>
            `【${title} · ${book} ${chapter}】\n` +
            rows.map((r) => `${r.verse} ${r.content}`).join("\n"),
        )
        .join("\n\n");
    },
  });

  const client = new Anthropic();
  const runner = client.beta.messages.toolRunner({
    model: TUTOR_MODEL,
    max_tokens: 16000,
    max_iterations: MAX_TOOL_ROUNDS,
    output_config: { effort: "medium" },
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    tools: [searchLibrary, getBiblePassage],
    messages: history,
  });

  let inputTokens = 0;
  let outputTokens = 0;
  let last: Anthropic.Beta.BetaMessage | undefined;
  for await (const message of runner) {
    inputTokens +=
      message.usage.input_tokens +
      (message.usage.cache_read_input_tokens ?? 0) +
      (message.usage.cache_creation_input_tokens ?? 0);
    outputTokens += message.usage.output_tokens;
    last = message;
  }

  if (!last) throw new Error("AI 導師沒有回應");
  if (last.stop_reason === "refusal") {
    return {
      text: "抱歉，這個問題我無法回答。建議直接與授課牧師討論。",
      sources: [],
      inputTokens,
      outputTokens,
    };
  }

  const text = last.content
    .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n\n")
    .trim();

  return {
    text: text || "抱歉，這次沒有產生回答，請換個方式再問一次。",
    sources: [...seen.values()],
    inputTokens,
    outputTokens,
  };
}
