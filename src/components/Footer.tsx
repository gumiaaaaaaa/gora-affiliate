import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          {/* サイト説明 */}
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 bg-golf-green rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-bold">G</span>
              </div>
              <span className="font-bold text-white text-base">関東ゴルフ場ナビ</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-500">
              関東エリアのゴルフ場をかんたんに探せる情報サイトです。
              楽天GORAと提携し、最安値でのご予約をサポートします。
            </p>
          </div>

          {/* リンク */}
          <div className="flex gap-12">
            <div className="flex flex-col gap-2.5 text-sm">
              <p className="text-gray-300 font-semibold mb-1 text-xs uppercase tracking-wider">Menu</p>
              <Link href="/" className="hover:text-white transition-colors">トップ</Link>
              <Link href="/shindan" className="hover:text-white transition-colors">ゴルフ場検索</Link>
            </div>
            <div className="flex flex-col gap-2.5 text-sm">
              <p className="text-gray-300 font-semibold mb-1 text-xs uppercase tracking-wider">Legal</p>
              <Link href="/privacy" className="hover:text-white transition-colors">プライバシーポリシー</Link>
              <Link href="/tokushoho" className="hover:text-white transition-colors">特定商取引法に基づく表記</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-600">
          <p>© {new Date().getFullYear()} 関東ゴルフ場ナビ</p>
          <p>楽天アフィリエイトプログラム提携サイト</p>
        </div>
      </div>
    </footer>
  );
}
