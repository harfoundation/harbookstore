import QRCode from "qrcode";
import { getWhatsappLink } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";

export async function WhatsappContactCard() {
  const link = getWhatsappLink("您好，我想了解山書坊的相關資訊。");
  if (!link) return null;

  const qrDataUrl = await QRCode.toDataURL(link, { margin: 1, width: 160 });

  return (
    <div className="flex items-center gap-4 rounded-lg border p-4">
      {/* eslint-disable-next-line @next/next/no-img-element -- small local data: URI, no benefit from next/image */}
      <img
        src={qrDataUrl}
        alt="WhatsApp 聯絡二維碼"
        width={80}
        height={80}
        className="shrink-0"
      />
      <div className="space-y-1">
        <p className="font-medium">透過 WhatsApp 聯絡我們</p>
        <p className="text-muted-foreground text-sm">
          掃描二維碼，或點擊下方按鈕直接開始對話。
        </p>
        <Button
          render={<a href={link} target="_blank" rel="noopener noreferrer" />}
          size="sm"
        >
          開啟 WhatsApp
        </Button>
      </div>
    </div>
  );
}
