// シンプルなインメモリレート制限
// Vercel Serverlessでは関数インスタンスごとにメモリが独立するため完全ではないが、
// 基本的なスパム防止には有効

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

// 定期的に古いエントリを削除
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap) {
    if (now > value.resetAt) {
      rateLimitMap.delete(key);
    }
  }
}, 60000);

type RateLimitOptions = {
  maxRequests: number; // 最大リクエスト数
  windowMs: number;    // 時間枠（ミリ秒）
};

/**
 * レート制限チェック
 * @returns true = 制限内（OK）, false = 制限超過（ブロック）
 */
export function checkRateLimit(
  key: string,
  options: RateLimitOptions
): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, {
      count: 1,
      resetAt: now + options.windowMs,
    });
    return true;
  }

  if (entry.count >= options.maxRequests) {
    return false;
  }

  entry.count++;
  return true;
}

/**
 * リクエストからIPアドレスを取得
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const real = request.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}
