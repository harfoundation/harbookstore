"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { bulkImportWhatsappContacts } from "@/lib/actions/whatsapp-contacts";

function parseCsv(raw: string): { phoneNumber: string; displayName?: string }[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [phoneNumber, displayName] = line.split(",").map((s) => s.trim());
      return { phoneNumber, displayName: displayName || undefined };
    })
    .filter((row) => row.phoneNumber);
}

export function WhatsappCsvImportDialog() {
  const [open, setOpen] = useState(false);
  const [raw, setRaw] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const preview = parseCsv(raw);

  async function handleImport() {
    if (preview.length === 0) {
      toast.error("請貼上至少一筆聯絡人（格式：電話,姓名）");
      return;
    }
    setSubmitting(true);
    const result = await bulkImportWhatsappContacts({ rows: preview, tags: ["csv匯入"] });
    setSubmitting(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(`已匯入 ${result.imported} 筆聯絡人`);
    setRaw("");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>CSV 批量匯入</Button>} />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>從 CSV 匯入 WhatsApp 聯絡人</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <p className="text-muted-foreground text-sm">
            每行一筆，格式：電話號碼,姓名（姓名可省略）。例如：
            <br />
            +61412345678,王小明
          </p>
          <Textarea
            className="min-h-40 font-mono text-sm"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder="+61412345678,王小明&#10;+61498765432"
          />
          <p className="text-muted-foreground text-xs">
            已辨識 {preview.length} 筆聯絡人
          </p>
        </div>
        <DialogFooter>
          <Button disabled={submitting || preview.length === 0} onClick={handleImport}>
            {submitting ? "匯入中…" : `匯入 ${preview.length} 筆`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
