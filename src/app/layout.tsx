import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "住まい探し整理 | 住宅購入意思決定OS",
  description:
    "買う・買わないを決める診断ではありません。希望・予算・今の市場を整理して、自分に合った探し方と、自分の言葉で説明できる結論を見つけるためのツールです。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
