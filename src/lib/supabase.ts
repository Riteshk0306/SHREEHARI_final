import { createClient } from '@supabase/supabase-js';

const env = (import.meta as any).env;
const supabaseUrl = env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = () => {
  return !!supabaseUrl && !supabaseUrl.includes('placeholder') && !!supabaseAnonKey && !supabaseAnonKey.includes('placeholder');
};

export const supabase = createClient(
  supabaseUrl || 'https://placeholder-project.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);
