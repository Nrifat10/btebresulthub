import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SITE } from "@/lib/site";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} | ${SITE.tagline}`, template: `%s | ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: ["BTEB result", "bteb.gov.bd result", "diploma result", "polytechnic result", "BTEB CGPA calculator", "বিটিইবি রেজাল্ট"],
  openGraph: { type: "website", siteName: SITE.name, title: `${SITE.name} | ${SITE.tagline}`, description: SITE.description, url: SITE.url },
  twitter: { card: "summary_large_image", title: `${SITE.name} | ${SITE.tagline}`, description: SITE.description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: "#2563eb", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
