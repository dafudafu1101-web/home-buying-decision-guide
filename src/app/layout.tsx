import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "住まい探し整理",
  description:
    "希望・予算・今の市場を整理しながら、自分に合った住まいの探し方を見つけるツールです。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
