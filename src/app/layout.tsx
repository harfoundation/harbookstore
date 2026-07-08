import type { Metadata } from "next";
import { Noto_Sans_TC, Poppins } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { LocaleProvider } from "@/components/locale-provider";
import "./globals.css";

const notoSansTC = Noto_Sans_TC({
  variable: "--font-noto-sans-tc",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

// Matches harfoundation.org.au's brand font — used only for the "Har Book
// Club" English wordmark (Poppins has no CJK glyphs, so Chinese body/heading
// text stays on Noto Sans TC).
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "山書坊 Har Book Club",
    template: "%s | 山書坊 Har Book Club",
  },
  description: "山書坊 — 基督教書籍事工：培訓課程、書評、團購與贈書、免費借閱。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-Hant"
      className={`${notoSansTC.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <LocaleProvider>
          {children}
          <Toaster richColors position="top-center" />
        </LocaleProvider>
      </body>
    </html>
  );
}
