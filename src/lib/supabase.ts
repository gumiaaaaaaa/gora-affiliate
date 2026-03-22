import { createClient } from "@supabase/supabase-js";

// サーバーサイド専用のSupabaseクライアント（API routes, Cron用）
// service_role keyを使うのでRLSをバイパスできる
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase環境変数が未設定です");
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
