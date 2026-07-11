import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "books.google.com" },
      { protocol: "https", hostname: "covers.openlibrary.org" },
      { protocol: "https", hostname: "*.wedevotebible.org" },
      { protocol: "https", hostname: "wdbook.com" },
      { protocol: "https", hostname: "*.wdbook.com" },
    ],
  },
};

export default nextConfig;
