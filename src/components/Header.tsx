"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-golf-dark/95 backdrop-blur-md border-b border-golf-green/20 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* ロゴ */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-gradient-to-br from-golf-gold to-golf-gold-dark rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-golf-dark text-sm font-extrabold">G</span>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg text-white tracking-tight leading-tight">
              ゴルプラ比較
            </span>
            <span className="text-[10px] text-golf-gold tracking-widest font-medium hidden sm:block">
              GOLF PLAN COMPARE
            </span>
          </div>
        </Link>

        {/* PC用ナビ */}
        <nav className="hidden md:flex items-center gap-1">
          <Link href="/" className="text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-white/10 transition-all text-sm font-medium">
            トップ
          </Link>
          <Link href="/shindan" className="text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-white/10 transition-all text-sm font-medium">
            ゴルフ場検索
          </Link>
          <Link href="/blog" className="text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-white/10 transition-all text-sm font-medium">
            コラム
          </Link>
          <Link href="/faq" className="text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-white/10 transition-all text-sm font-medium">
            FAQ
          </Link>
          <Link
            href="/shindan"
            className="ml-2 bg-gradient-to-r from-golf-gold to-golf-gold-dark text-golf-dark px-5 py-2.5 rounded-lg hover:shadow-lg hover:shadow-golf-gold/20 transition-all font-bold text-sm"
          >
            最安値を検索
          </Link>
        </nav>

        {/* ハンバーガーメニュー */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="メニューを開く"
        >
          <div className={`w-5 h-0.5 bg-white transition-all ${menuOpen ? "rotate-45 translate-y-1.5" : ""}`} />
          <div className={`w-5 h-0.5 bg-white my-1 transition-all ${menuOpen ? "opacity-0" : ""}`} />
          <div className={`w-5 h-0.5 bg-white transition-all ${menuOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
        </button>
      </div>

      {/* モバイルメニュー */}
      {menuOpen && (
        <div className="md:hidden bg-golf-dark border-t border-golf-green/20 px-4 py-4 flex flex-col gap-1">
          <Link href="/" onClick={() => setMenuOpen(false)} className="text-gray-300 hover:text-white hover:bg-white/10 px-3 py-3 rounded-lg font-medium transition-all">トップ</Link>
          <Link href="/shindan" onClick={() => setMenuOpen(false)} className="text-gray-300 hover:text-white hover:bg-white/10 px-3 py-3 rounded-lg font-medium transition-all">ゴルフ場検索</Link>
          <Link href="/blog" onClick={() => setMenuOpen(false)} className="text-gray-300 hover:text-white hover:bg-white/10 px-3 py-3 rounded-lg font-medium transition-all">コラム</Link>
          <Link href="/faq" onClick={() => setMenuOpen(false)} className="text-gray-300 hover:text-white hover:bg-white/10 px-3 py-3 rounded-lg font-medium transition-all">FAQ</Link>
          <Link href="/contact" onClick={() => setMenuOpen(false)} className="text-gray-300 hover:text-white hover:bg-white/10 px-3 py-3 rounded-lg font-medium transition-all">お問い合わせ</Link>
          <Link href="/shindan" onClick={() => setMenuOpen(false)} className="mt-2 bg-gradient-to-r from-golf-gold to-golf-gold-dark text-golf-dark px-5 py-3 rounded-lg text-center font-bold">最安値を検索</Link>
        </div>
      )}
    </header>
  );
}
