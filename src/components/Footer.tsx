import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-golf-dark text-gray-300 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          {/* サイト説明 */}
          <div className="max-w-sm">
            <div className="flex items-center gap-2 font-bold text-white text-lg mb-3">
              <span>⛳</span>
              <span>関東ゴルフ場ナビ</span>
            </div>
            <p className="text-sm leading-relaxed">
              関東エリアのゴルフ場をかんたん診断で探せる情報サイトです。
              楽天GORAと提携し、最安値でのご予約をサポートします。
            </p>
          </div>

          {/* リンク */}
          <div className="flex flex-col gap-2 text-sm">
            <p className="text-white font-semibold mb-1">メニュー</p>
            <Link href="/" className="hover:text-white transition-colors">トップページ</Link>
            <Link href="/shindan" className="hover:text-white transition-colors">かんたん診断</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">プライバシーポリシー</Link>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-xs text-gray-500 text-center">
          <p>本サイトは楽天アフィリエイトプログラムを利用しています。</p>
          <p className="mt-1">© 2025 関東ゴルフ場ナビ</p>
        </div>
      </div>
    </footer>
  );
}
