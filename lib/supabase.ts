import { createClient } from "@supabase/supabase-js";

export type SessionRow = {
  id: string;
  created_at: string;
  heart_rate: number | null;
  split_time: string | number | null;
  distance: number | null;
  session_time: string | number | null;
  photo_url?: string | null;
};

export function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Missing Supabase environment variables.");
  }

  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}
