import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error("缺少 NEXT_PUBLIC_SUPABASE_URL，请在 .env.local 中配置 Supabase Project URL。");
  }

  if (!serviceRoleKey) {
    throw new Error("缺少 SUPABASE_SERVICE_ROLE_KEY，请在 .env.local 中配置服务端 key。");
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
