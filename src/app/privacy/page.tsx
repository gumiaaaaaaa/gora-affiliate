export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-14">
      <h1 className="text-2xl font-bold text-golf-green mb-8">プライバシーポリシー</h1>

      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-8 text-sm text-gray-700 leading-relaxed">
        <section>
          <h2 className="font-bold text-gray-800 text-base mb-3">アフィリエイトについて</h2>
          <p>
            本サイトは楽天アフィリエイトプログラムを利用しています。
            楽天GORAへのリンクを経由して予約・購入された場合、当サイトに紹介料が発生することがあります。
            ご利用者様にご負担はございません。
          </p>
        </section>

        <section>
          <h2 className="font-bold text-gray-800 text-base mb-3">アクセス解析について</h2>
          <p>
            本サイトではアクセス状況を把握するためにGoogle Analyticsを使用する予定です。
            Google Analyticsはクッキーを通じてデータを収集しますが、個人を特定する情報は含まれません。
          </p>
        </section>

        <section>
          <h2 className="font-bold text-gray-800 text-base mb-3">免責事項</h2>
          <p>
            本サイトに掲載するゴルフ場情報・料金は変動する場合があります。
            最新情報は各ゴルフ場または楽天GORAの公式サイトをご確認ください。
          </p>
        </section>

        <section>
          <h2 className="font-bold text-gray-800 text-base mb-3">お問い合わせ</h2>
          <p>本サイトに関するお問い合わせはサイト運営者までご連絡ください。</p>
        </section>
      </div>
    </div>
  );
}
