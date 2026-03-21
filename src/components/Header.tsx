"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-golf-green text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* ロゴ */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <span className="text-2xl">⛳</span>
          <span>関東ゴルフ場ナビ</span>
        </Link>

        {/* PC用ナビ */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="hover:text-green-200 transition-colors">
            トップ
          </Link>
          <Link href="/shindan" className="hover:text-green-200 transition-colors">
            かんたん診断
          </Link>
          <Link
            href="/shindan"
            className="bg-golf-gold text-white px-4 py-2 rounded-full hover:opacity-90 transition-opacity font-bold"
          >
            診断スタート →
          </Link>
        </nav>

        {/* ハンバーガーメニュー（モバイル） */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-golf-light transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="メニューを開く"
        >
          <div className="w-5 h-0.5 bg-white mb-1" />
          <div className="w-5 h-0.5 bg-white mb-1" />
          <div className="w-5 h-0.5 bg-white" />
        </button>
      </div>

      {/* モバイルメニュー */}
      {menuOpen && (
        <div className="md:hidden bg-golf-dark px-4 py-4 flex flex-col gap-4 text-sm font-medium">
          <Link href="/" onClick={() => setMenuOpen(false)} className="hover:text-green-200">
            トップ
          </Link>
          <Link href="/shindan" onClick={() => setMenuOpen(false)} className="hover:text-green-200">
            かんたん診断
          </Link>
          <Link
            href="/shindan"
            onClick={() => setMenuOpen(false)}
            className="bg-golf-gold text-white px-4 py-2 rounded-full text-center font-bold"
          >
            診断スタート →
          </Link>
        </div>
      )}
    </header>
  );
}
