import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-golf-dark text-gray-400">
      <div className="max-w-6xl mx-auto px-4 py-14">
        <div className="flex flex-col md:flex-row justify-between gap-10">
          {/* サイト説明 */}
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-golf-gold to-golf-gold-dark rounded-lg flex items-center justify-center">
                <span className="text-golf-dark text-xs font-extrabold">G</span>
              </div>
              <div>
                <span className="font-extrabold text-white text-base block leading-tight">ゴルプラ比較</span>
                <span className="text-[9px] text-golf-gold tracking-widest">GOLF PLAN COMPARE</span>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-gray-500">
              関東エリアのゴルフ場を楽天GORA・じゃらん・公式サイトで最安値比較。
              エリア・予算・プレースタイルから最適なゴルフ場が見つかります。
            </p>
          </div>

          {/* リンク */}
          <div className="flex gap-12">
            <div className="flex flex-col gap-2.5 text-sm">
              <p className="text-golf-gold font-semibold mb-1 text-xs uppercase tracking-wider">Menu</p>
              <Link href="/" className="hover:text-white transition-colors">トップ</Link>
              <Link href="/shindan" className="hover:text-white transition-colors">ゴルフ場検索</Link>
              <Link href="/blog" className="hover:text-white transition-colors">コラム</Link>
              <Link href="/faq" className="hover:text-white transition-colors">よくある質問</Link>
            </div>
            <div className="flex flex-col gap-2.5 text-sm">
              <p className="text-golf-gold font-semibold mb-1 text-xs uppercase tracking-wider">Info</p>
              <Link href="/about" className="hover:text-white transition-colors">運営者情報</Link>
              <Link href="/contact" className="hover:text-white transition-colors">お問い合わせ</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">プライバシーポリシー</Link>
              <Link href="/tokushoho" className="hover:text-white transition-colors">特定商取引法に基づく表記</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-golf-green/20 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-600">
          <p>© {new Date().getFullYear()} ゴルプラ比較 All Rights Reserved.</p>
          <p>楽天アフィリエイト・バリューコマース提携サイト</p>
        </div>
      </div>
    </footer>
  );
}
