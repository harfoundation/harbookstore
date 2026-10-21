// HAR 植堂學院 — public-facing program content in one place, so the name,
// cohort and curriculum can be changed after Keith's review without touching
// the pages. Non-degree vocational training: never call it a seminary or
// promise a qualification (Australian higher-ed titles are TEQSA-regulated).

export const PROGRAM = {
  name: "HAR 植堂學院",
  nameEn: "HAR Church Planting Academy",
  tagline: "為有心植堂的人而設的實務培訓",
  cohortLabel: "啟行班 第一期",
  host: "HAR Cultural Foundation Ltd（HAR 文化基金有限公司）",
  leadInstructor: "Keith Lim 牧師",
} as const;

export const TRACKS = {
  practical: {
    label: "實務軌",
    who: "讀過神學院，正預備或考慮植堂",
    focus: "植堂實務、團隊領導、導師陪跑、實習",
  },
  foundation_practical: {
    label: "基礎＋實務軌",
    who: "沒有讀過神學院，但對植堂有負擔",
    focus: "先補聖經與神學基礎，再進入植堂實務",
  },
} as const;

export type PlantingTrack = keyof typeof TRACKS;

export const COHORT_LESSONS = [
  { title: "福音神學", summary: "福音如何改變人、群體和事奉" },
  { title: "植堂者的屬靈生命", summary: "呼召、品格與自我評估" },
  { title: "處境化", summary: "認識墨爾本華人與城市文化" },
  { title: "福音性人際網絡", summary: "從關係開始傳福音" },
  { title: "宣教性教會論", summary: "我們要植怎樣的教會" },
  { title: "門徒訓練與領袖培養", summary: "從信主到帶領別人" },
  { title: "從全本聖經講基督", summary: "講道與教導" },
  { title: "植堂實務", summary: "團隊、治理、財務與澳洲法規" },
] as const;

export const LESSON_FORMAT = [
  { label: "講授", detail: "Keith 牧師講課，全程錄影，可回放" },
  { label: "案例分享", detail: "植堂牧者分享成功與失敗的真實經歷" },
  { label: "小組互動", detail: "同伴互相教練，把內容應用到自己的處境" },
  { label: "問答", detail: "課後問題可在課堂頁留言，講師回覆" },
  { label: "作業", detail: "每課一份實作作業，導師批改" },
] as const;

export const APPLICATION_STATUS_LABEL: Record<string, string> = {
  submitted: "已提交",
  interview: "待面談",
  accepted: "已錄取",
  waitlist: "候補",
  declined: "未錄取",
};
