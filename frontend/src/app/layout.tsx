import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppHeader from "@/components/AppHeader";
import AppFooter from "@/components/AppFooter";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CKD AI Risk Screener",
    template: "%s | CKD AI Risk Screener",
  },
  description:
    "Estimate Chronic Kidney Disease risk from clinical values using AI. For educational and screening-support purposes only — not a medical diagnosis tool.",
  keywords: ["CKD", "chronic kidney disease", "AI screening", "clinical risk assessment", "DistilBERT"],
  authors: [{ name: "CKD AI Risk Screener" }],
  openGraph: {
    title: "CKD AI Risk Screener",
    description: "AI-powered CKD risk estimation from clinical inputs.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-dvh flex flex-col bg-background text-foreground antialiased">
        <AppHeader />
        <main className="flex-1">{children}</main>
        <AppFooter />
      </body>
    </html>
  );
}
