import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SessionTimeout from "@/components/providers/SessionTimeout";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BluePeak Trust",
  description: "Secure banking and financial services",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen bg-[#f4f7fb] text-slate-900 antialiased">
        <SessionTimeout />
        {children}
      </body>
    </html>
  );
}
