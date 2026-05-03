import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Business Plan — CAPS Biodynamie Côte d'Ivoire",
  description: "Business Plan complet pour CAPS Biodynamie — Distributeur exclusif du biofertilisant Biodynamie (LIG, Congo) en Côte d'Ivoire",
  keywords: ["CAPS", "LIG", "Biodynamie", "Côte d'Ivoire", "Congo", "biofertilisant", "agriculture", "business plan"],
  authors: [{ name: "CAPS Biodynamie — Comptoir Agropastoral CI" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
