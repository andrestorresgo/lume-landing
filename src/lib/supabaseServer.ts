import { createClient } from '@supabase/supabase-js';
import type { AstroCookies } from 'astro';

/**
 * Creates a server-side Supabase client and extracts the access and refresh tokens from cookies.
 */
export function createServerClient(cookies: AstroCookies) {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables are missing on the server.');
  }

  const accessToken = cookies.get('sb-access-token')?.value;
  const refreshToken = cookies.get('sb-refresh-token')?.value;

  const client = createClient(supabaseUrl || '', supabaseAnonKey || '', {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return { client, accessToken, refreshToken };
}
