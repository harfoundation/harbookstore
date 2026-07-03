import { getWhatsappLink } from "@/lib/whatsapp";

export function SiteFooter() {
  const whatsappLink = getWhatsappLink("您好，我想了解山書房的相關資訊。");

  return (
    <footer className="border-border text-muted-foreground mt-16 border-t py-8 text-sm">
      <div className="mx-auto max-w-6xl px-4">
        <p>
          山書房 Har Bookstore — Har Foundation (
          <a
            href="https://www.harfoundation.org.au/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            harfoundation.org.au
          </a>
          ) 事工
        </p>
        <p className="mt-1">
          純公益服務：所有訂購、團購與贈書均為非營利用途，款項透明化公開使用。
        </p>
        {whatsappLink && (
          <p className="mt-1">
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
    </footer>
  );
}
