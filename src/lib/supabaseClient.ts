import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are missing. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Listen to auth changes on the client side to sync session tokens to cookies
if (typeof window !== 'undefined') {
  supabase.auth.onAuthStateChange((event, session) => {
    if (session) {
      const maxAge = 60 * 60 * 24 * 7; // 7 days
      document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=${maxAge}; SameSite=Lax; Secure`;
      document.cookie = `sb-refresh-token=${session.refresh_token}; path=/; max-age=${maxAge}; SameSite=Lax; Secure`;
    } else {
      // Clear cookies on sign out or when no session exists
      document.cookie = `sb-access-token=; path=/; max-age=0; SameSite=Lax; Secure`;
      document.cookie = `sb-refresh-token=; path=/; max-age=0; SameSite=Lax; Secure`;
    }
  });
}

