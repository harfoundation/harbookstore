import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "books.google.com" },
      { protocol: "https", hostname: "covers.openlibrary.org" },
      { protocol: "https", hostname: "*.wedevotebible.org" },
      { protocol: "https", hostname: "wdbook.com" },
      { protocol: "https", hostname: "*.wdbook.com" },
      { protocol: "https", hostname: "shop.campus.org.tw" },
      { protocol: "https", hostname: "www.cclm.com.tw" },
      { protocol: "https", hostname: "www.logos.com.hk" },
      { protocol: "https", hostname: "ccicebookstore.net" },
      { protocol: "https", hostname: "im2.book.com.tw" },
      { protocol: "https", hostname: "hgdhqbkduxibuktytvsu.supabase.co" },
      { protocol: "http", hostname: "127.0.0.1", port: "54321" },
    ],
  },
};

export default nextConfig;
