import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: " liquidations",
  description: "Cross-protocol liquidation activity across chains",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-aurora`}
      >
        <div className="min-h-dvh flex flex-col">
          <main className="flex-1">{children}</main>
          <footer className="border-t py-6 text-center text-[11px] text-muted-foreground">
            Powered by{" "}
            <a
              href="https://envio.dev"
              target="_blank"
              rel="noreferrer noopener"
              className="underline-offset-2 hover:underline"
            >
              envio.dev
            </a>
          </footer>
        </div>
        <Analytics />
      </body>
    </html>
  );
}
