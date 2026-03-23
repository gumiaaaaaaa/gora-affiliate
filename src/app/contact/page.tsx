"use client";

import { useState } from "react";
import Link from "next/link";
import type { Metadata } from "next";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", category: "general", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;

    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("sent");
        setForm({ name: "", email: "", category: "general", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-12">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-golf-green mb-3">送信完了</h1>
          <p className="text-gray-600 mb-6">
            お問い合わせありがとうございます。<br />
            2営業日以内にご返信いたします。
          </p>
          <Link
            href="/"
            className="inline-block bg-golf-green text-white font-semibold px-8 py-3 rounded-xl hover:bg-golf-light transition-colors"
          >
            トップページへ戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* パンくず */}
      <nav className="text-xs text-gray-400 mb-6">
        <Link href="/" className="hover:text-golf-green">トップ</Link>
        <span className="mx-1">›</span>
        <span className="text-gray-600">お問い合わせ</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-800 mb-2">お問い合わせ</h1>
      <p className="text-sm text-gray-500 mb-8">
        サイトに関するご質問・ご要望・不具合のご報告などお気軽にお問い合わせください。
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* お名前 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            お名前 <span className="text-red-400 text-xs">必須</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            maxLength={100}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-golf-green/30 focus:border-golf-green"
            placeholder="山田太郎"
          />
        </div>

        {/* メールアドレス */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            メールアドレス <span className="text-red-400 text-xs">必須</span>
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            maxLength={254}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-golf-green/30 focus:border-golf-green"
            placeholder="example@email.com"
          />
        </div>

        {/* カテゴリ */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">お問い合わせ種別</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-golf-green/30 focus:border-golf-green bg-white"
          >
            <option value="general">一般的なお問い合わせ</option>
            <option value="bug">不具合の報告</option>
            <option value="feature">機能のご要望</option>
            <option value="business">ビジネスに関するお問い合わせ</option>
            <option value="other">その他</option>
          </select>
        </div>

        {/* メッセージ */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            お問い合わせ内容 <span className="text-red-400 text-xs">必須</span>
          </label>
          <textarea
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            required
            maxLength={2000}
            rows={6}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-golf-green/30 focus:border-golf-green resize-none"
            placeholder="お問い合わせ内容をご記入ください"
          />
          <p className="text-xs text-gray-400 mt-1 text-right">{form.message.length}/2000</p>
        </div>

        {status === "error" && (
          <p className="text-red-500 text-sm">送信に失敗しました。しばらくしてからお試しください。</p>
        )}

        <button
          type="submit"
          disabled={status === "sending" || !form.name || !form.email || !form.message}
          className="w-full bg-golf-green text-white font-bold py-4 rounded-xl hover:bg-golf-light disabled:opacity-50 disabled:cursor-not-allowed transition-all text-base"
        >
          {status === "sending" ? "送信中..." : "送信する"}
        </button>
      </form>

      <p className="text-xs text-gray-400 mt-6 text-center">
        ※ 2営業日以内にご返信いたします。<br />
        ※ お問い合わせ内容により返信にお時間をいただく場合があります。
      </p>
    </div>
  );
}
