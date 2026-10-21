import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { COHORT_LESSONS, LESSON_FORMAT, PROGRAM, TRACKS } from "@/lib/planting/program";

export const metadata: Metadata = {
  title: PROGRAM.name,
  description: `${PROGRAM.name}：${PROGRAM.tagline}。非學歷職業培訓，結業發給證明。`,
  // MVP under review with Keith — keep out of search results until launch.
  robots: { index: false, follow: false },
};

export default function PlantingAcademyPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-14">
      <section className="space-y-5 py-8 text-center sm:py-12">
        <p className="text-muted-foreground text-sm">{PROGRAM.nameEn}</p>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          {PROGRAM.name}
        </h1>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg text-balance">
          {PROGRAM.tagline}。不論你是否讀過神學院，只要心中有植堂的負擔，
          這裡有一條適合你的學習路徑。
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Button size="lg" render={<Link href="/planting/apply" />}>
            申請{PROGRAM.cohortLabel}
          </Button>
          <Button size="lg" variant="outline" render={<a href="#curriculum" />}>
            查看課程
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">兩條學習路徑</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {Object.entries(TRACKS).map(([key, track]) => (
            <Card key={key}>
              <CardHeader>
                <CardTitle>{track.label}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>
                  <span className="text-muted-foreground">適合：</span>
                  {track.who}
                </p>
                <p>
                  <span className="text-muted-foreground">重點：</span>
                  {track.focus}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="curriculum" className="scroll-mt-20 space-y-4">
        <div>
          <h2 className="text-xl font-semibold">{PROGRAM.cohortLabel}：8 堂核心課</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            主講：{PROGRAM.leadInstructor}。每兩週一課，約四個月完成。
          </p>
        </div>
        <ol className="divide-y rounded-lg border">
          {COHORT_LESSONS.map((lesson, i) => (
            <li key={lesson.title} className="flex gap-4 p-4">
              <span className="text-muted-foreground w-6 shrink-0 text-right font-semibold">
                {i + 1}
              </span>
              <div>
                <p className="font-medium">{lesson.title}</p>
                <p className="text-muted-foreground text-sm">{lesson.summary}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">每一課怎樣進行</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {LESSON_FORMAT.map((step) => (
            <div key={step.label} className="rounded-lg border p-4">
              <p className="font-medium">{step.label}</p>
              <p className="text-muted-foreground mt-1 text-sm">{step.detail}</p>
            </div>
          ))}
          <div className="rounded-lg border p-4">
            <p className="font-medium">多語言回放</p>
            <p className="text-muted-foreground mt-1 text-sm">
              用筆記本或 iPad 一邊看錄影，一邊讀中、英等多種語言的講稿，可兩種語言對照。
            </p>
          </div>
        </div>
        <p className="text-muted-foreground text-sm">
          課與課之間：閱讀指定書目，每月一次導師陪跑。
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>費用</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-2 text-sm">
            <p>培訓費＋書費＋講師費。第一期金額將於開放報名時公布。</p>
            <p>如在費用上有困難，歡迎與我們聯絡。</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>結業與性質</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-2 text-sm">
            <p>完成課程、作業和實習的學員，獲發結業證明。</p>
            <p>本培訓屬非學歷的事工職業培訓，不授予學位或學歷資格。</p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4 rounded-lg border p-6 text-center">
        <h2 className="text-xl font-semibold">申請流程</h2>
        <ol className="text-muted-foreground mx-auto max-w-xl space-y-1 text-left text-sm">
          <li>1. 註冊網站帳號，填寫申請表（約 10 分鐘）</li>
          <li>2. 與 {PROGRAM.leadInstructor}或培訓團隊面談</li>
          <li>3. 收到錄取通知後報名繳費，開始上課</li>
        </ol>
        <Button size="lg" render={<Link href="/planting/apply" />}>
          開始申請
        </Button>
        <p className="text-muted-foreground text-xs">主辦：{PROGRAM.host}</p>
      </section>
    </div>
  );
}
