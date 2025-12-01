// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/shared/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VOS BI Dashboard",
  description: "Business Intelligence Portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        {/* MAIN LAYOUT WRAPPER */}
        <div className="flex min-h-screen w-full">
          
          {/* SIDEBAR ALWAYS VISIBLE */}
          <Sidebar />

          {/* PAGE CONTENT AREA */}
          <main className="flex-1 ml-64 p-6 transition-all duration-300">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
