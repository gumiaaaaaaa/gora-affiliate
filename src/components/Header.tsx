"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
        {/* ロゴ */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-golf-green rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">G</span>
          </div>
          <span className="font-bold text-lg text-gray-800 tracking-tight">
            ゴルプラ比較
          </span>
        </Link>

        {/* PC用ナビ */}
        <nav className="hidden md:flex items-center gap-8 text-sm">
          <Link
            href="/"
            className="text-gray-500 hover:text-golf-green transition-colors font-medium"
          >
            トップ
          </Link>
          <Link
            href="/shindan"
            className="text-gray-500 hover:text-golf-green transition-colors font-medium"
          >
            ゴルフ場検索
          </Link>
          <Link
            href="/shindan"
            className="bg-golf-green text-white px-5 py-2 rounded-lg hover:bg-golf-light transition-colors font-semibold text-sm"
          >
            検索する
          </Link>
        </nav>

        {/* ハンバーガーメニュー */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="メニューを開く"
        >
          <div className={`w-5 h-0.5 bg-gray-600 transition-all ${menuOpen ? "rotate-45 translate-y-1.5" : ""}`} />
          <div className={`w-5 h-0.5 bg-gray-600 my-1 transition-all ${menuOpen ? "opacity-0" : ""}`} />
          <div className={`w-5 h-0.5 bg-gray-600 transition-all ${menuOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
        </button>
      </div>

      {/* モバイルメニュー */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-3">
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="text-gray-600 hover:text-golf-green py-2 font-medium"
          >
            トップ
          </Link>
          <Link
            href="/shindan"
            onClick={() => setMenuOpen(false)}
            className="text-gray-600 hover:text-golf-green py-2 font-medium"
          >
            ゴルフ場検索
          </Link>
          <Link
            href="/shindan"
            onClick={() => setMenuOpen(false)}
            className="bg-golf-green text-white px-5 py-3 rounded-lg text-center font-semibold"
          >
            検索する
          </Link>
        </div>
      )}
    </header>
  );
}
