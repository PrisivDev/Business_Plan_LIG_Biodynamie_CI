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
  title: "Business Plan — LIG Biodynamie Côte d'Ivoire",
  description: "Business Plan complet pour le Centre de Recherche Agricole LIAMBOU GISELE (LIG) — Biofertilisant Biodynamie en Côte d'Ivoire",
  keywords: ["LIG", "Biodynamie", "Côte d'Ivoire", "biofertilisant", "agriculture", "business plan"],
  authors: [{ name: "Centre LIG — Comptoir Agropastoral CI" }],
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
