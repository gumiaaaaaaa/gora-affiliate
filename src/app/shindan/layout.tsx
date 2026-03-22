import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "かんたん診断",
  description:
    "エリア・予算・レベルを選ぶだけで、あなたにぴったりの関東ゴルフ場が見つかります。約3分で完了。",
};

export default function ShindanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
