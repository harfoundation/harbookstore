"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitPlantingApplication } from "@/lib/actions/planting-applications";
import { TRACKS, type PlantingTrack } from "@/lib/planting/program";

export function PlantingApplicationForm({
  defaultName,
  defaultEmail,
}: {
  defaultName: string;
  defaultEmail: string;
}) {
  const [form, setForm] = useState({
    fullName: defaultName,
    contactEmail: defaultEmail,
    contactPhone: "",
    homeChurch: "",
    refereeName: "",
    refereeContact: "",
    track: "foundation_practical" as PlantingTrack,
    seminaryBackground: "",
    plantingVision: "",
    weeklyHours: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  if (submitted) {
    return (
      <div className="space-y-1 rounded-lg border p-6 text-center">
        <p className="font-medium">申請已收到，感謝你！</p>
        <p className="text-muted-foreground text-sm">培訓團隊會與你聯絡，安排面談。</p>
      </div>
    );
  }

  async function handleSubmit() {
    setSubmitting(true);
    const result = await submitPlantingApplication({
      fullName: form.fullName,
      contactEmail: form.contactEmail,
      contactPhone: form.contactPhone || undefined,
      homeChurch: form.homeChurch || undefined,
      refereeName: form.refereeName || undefined,
      refereeContact: form.refereeContact || undefined,
      track: form.track,
      seminaryBackground: form.seminaryBackground || undefined,
      plantingVision: form.plantingVision,
      weeklyHours: form.weeklyHours ? Number(form.weeklyHours) : undefined,
    });
    setSubmitting(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    setSubmitted(true);
  }

  return (
    <div className="space-y-6">
      <fieldset className="space-y-3">
        <legend className="mb-2 font-semibold">聯絡資料</legend>
        <div className="space-y-1.5">
          <Label>姓名</Label>
          <Input
            value={form.fullName}
            onChange={(e) => set("fullName")(e.target.value)}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>電郵</Label>
            <Input
              type="email"
              value={form.contactEmail}
              onChange={(e) => set("contactEmail")(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>電話（選填）</Label>
            <Input
              value={form.contactPhone}
              onChange={(e) => set("contactPhone")(e.target.value)}
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="mb-2 font-semibold">背景</legend>
        <div className="space-y-1.5">
          <Label>學習路徑</Label>
          <div className="grid gap-2 sm:grid-cols-2">
            {Object.entries(TRACKS).map(([key, track]) => (
              <label
                key={key}
                className={`cursor-pointer rounded-lg border p-3 text-sm ${
                  form.track === key ? "border-primary bg-muted" : ""
                }`}
              >
                <input
                  type="radio"
                  name="track"
                  className="sr-only"
                  checked={form.track === key}
                  onChange={() => set("track")(key)}
                />
                <span className="font-medium">{track.label}</span>
                <span className="text-muted-foreground block">{track.who}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>神學或事奉背景（選填）</Label>
          <Textarea
            placeholder="例如：就讀過的神學院、課程；在教會的事奉經驗"
            value={form.seminaryBackground}
            onChange={(e) => set("seminaryBackground")(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>所屬教會（選填）</Label>
          <Input
            value={form.homeChurch}
            onChange={(e) => set("homeChurch")(e.target.value)}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>推薦人（牧者或長執，選填）</Label>
            <Input
              value={form.refereeName}
              onChange={(e) => set("refereeName")(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>推薦人聯絡方式（選填）</Label>
            <Input
              value={form.refereeContact}
              onChange={(e) => set("refereeContact")(e.target.value)}
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="mb-2 font-semibold">植堂意向</legend>
        <div className="space-y-1.5">
          <Label>你心中想植怎樣的教會？在哪裡、向哪一群人？</Label>
          <Textarea
            className="min-h-32"
            placeholder="還沒有清楚的方向也沒關係，寫下你目前的感動和想法即可"
            value={form.plantingVision}
            onChange={(e) => set("plantingVision")(e.target.value)}
          />
        </div>
        <div className="space-y-1.5 sm:w-1/2">
          <Label>每週可投入學習的時間（小時，選填）</Label>
          <Input
            type="number"
            min={0}
            max={80}
            value={form.weeklyHours}
            onChange={(e) => set("weeklyHours")(e.target.value)}
          />
        </div>
      </fieldset>

      <Button className="w-full" size="lg" disabled={submitting} onClick={handleSubmit}>
        {submitting ? "送出中…" : "送出申請"}
      </Button>
    </div>
  );
}
