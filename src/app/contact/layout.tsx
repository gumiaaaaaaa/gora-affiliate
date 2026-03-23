import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "お問い合わせ",
  description: "ゴルプラ比較へのお問い合わせ。サイトに関するご質問・ご要望・不具合のご報告などお気軽にお問い合わせください。",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "お問い合わせ | ゴルプラ比較",
    url: "/contact",
  },
};

const contactJsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "お問い合わせ | ゴルプラ比較",
  url: "https://golf-plat.com/contact",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />
      {children}
    </>
  );
}
