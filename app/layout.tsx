import type { Metadata } from "next";

import { SiteFooter } from "@/components/site-footer";

import "./globals.css";

export const metadata: Metadata = {
  title: "MyGrad",
  description: "面向本科生的研究生申请决策平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
