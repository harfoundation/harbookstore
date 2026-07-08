import Image from "next/image";
import { getWhatsappLink } from "@/lib/whatsapp";

export function SiteFooter() {
  const whatsappLink = getWhatsappLink("您好，我想了解山書坊的相關資訊。");

  return (
    <footer className="border-border text-muted-foreground mt-16 border-t py-8 text-sm">
      <div className="mx-auto max-w-6xl space-y-4 px-4">
        <a
          href="https://www.harfoundation.org.au/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block"
        >
          <Image
            src="/brand/har-foundation-logo.png"
            alt="Har Foundation"
            width={178}
            height={24}
            className="h-5 w-auto opacity-70 transition-opacity hover:opacity-100"
          />
        </a>

        <div className="space-y-1">
          <p>
            山書坊 Har Book Club — 由 HAR Cultural Foundation Ltd（HAR
            文化基金有限公司）主辦
          </p>
          <p>
            2–6 Oxford Street, (Wesley Uniting Church Box Hill), Box Hill, VIC Australia
            3128
          </p>
          <p>純公益服務：所有訂購、團購與贈書均為非營利用途，款項透明化公開使用。</p>
          {whatsappLink && (
            <p>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                透過 WhatsApp 聯絡我們
              </a>
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
