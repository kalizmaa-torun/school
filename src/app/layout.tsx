import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "../components/ClientLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "스쿨 보드",
  description: "Next.js와 Tailwind CSS로 구축된 학교 주간 시간표 및 과제 관리 앱",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${inter.className} antialiased bg-[var(--background)] text-[var(--foreground)]`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
