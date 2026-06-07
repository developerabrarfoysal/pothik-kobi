import type { Metadata } from "next";
import { Hind_Siliguri, Noto_Serif_Bengali } from "next/font/google";
import "./globals.css";

const bengali = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-bengali",
  display: "swap",
});

const bengaliSerif = Noto_Serif_Bengali({
  subsets: ["bengali", "latin"],
  variable: "--font-bengali-serif",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://pathikkobi.com"),
  title: {
    default: "পথিক কবি | মুজাহিদ প্রিন্স",
    template: "%s | পথিক কবি",
  },
  description: "মুজাহিদ প্রিন্স — পথিক কবির কবিতা, গল্প ও সাহিত্য",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning lang="bn" className={`${bengali.variable} ${bengaliSerif.variable} h-full`}>
      <body suppressHydrationWarning className="min-h-full antialiased">{children}</body>
    </html>
  );
}
