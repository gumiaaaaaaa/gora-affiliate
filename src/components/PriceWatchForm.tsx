"use client";

import { useState } from "react";

type Props = {
  courseId: string;
  courseName: string;
  currentPrice?: number;
};

export default function PriceWatchForm({ courseId, courseName, currentPrice }: Props) {
  const [email, setEmail] = useState("");
  const [threshold, setThreshold] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      setMessage("有効なメールアドレスを入力してください");
      setStatus("error");
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/price-watch/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          golfCourseId: courseId,
          golfCourseName: courseName,
          thresholdPrice: threshold ? parseInt(threshold) : null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage("通知登録が完了しました！料金が下がったらメールでお知らせします。");
      } else {
        setStatus("error");
        setMessage(data.error ?? "登録に失敗しました。もう一度お試しください。");
      }
    } catch {
      setStatus("error");
      setMessage("通信エラーが発生しました。");
    }
  }

  if (status === "success") {
    return (
      <div id="price-watch" className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
        <div className="text-3xl mb-3">✅</div>
        <p className="font-bold text-golf-green mb-1">通知登録完了！</p>
        <p className="text-sm text-gray-600">{message}</p>
      </div>
    );
  }

  return (
    <div id="price-watch" className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🔔</span>
        <div>
          <h3 className="font-bold text-gray-800">料金が下がったら通知</h3>
          <p className="text-xs text-gray-400">メールでお知らせします（登録無料）</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-golf-green transition-colors"
          />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder={currentPrice ? `${currentPrice.toLocaleString()}` : "希望価格（任意）"}
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              className="flex-1 border border-gray-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-golf-green transition-colors"
            />
            <span className="text-sm text-gray-400 whitespace-nowrap">円以下で通知</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            ※ 未入力の場合、料金が下がったら都度お知らせします
          </p>
        </div>

        {status === "error" && (
          <p className="text-sm text-red-500">{message}</p>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          className={`w-full py-3 rounded-xl font-bold text-white transition-all ${
            status === "loading"
              ? "bg-gray-400 cursor-wait"
              : "bg-golf-gold hover:opacity-90 active:scale-[0.98]"
          }`}
        >
          {status === "loading" ? "登録中..." : "🔔 通知を受け取る"}
        </button>
      </form>
    </div>
  );
}
