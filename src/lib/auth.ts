import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Verifies the current Supabase session and checks if the logged-in user
 * has the 'admin' role in the `profiles` table.
 *
 * This function makes a live server-side database check — not just local state —
 * so it cannot be bypassed by manipulating the Zustand store in the browser.
 *
 * @returns true if authenticated and role === 'admin', false otherwise.
 */
export async function verifyAdminRole(): Promise<boolean> {
  try {
    // Step 1: Get the current active session from Supabase Auth
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return false;
    }

    if (!isSupabaseConfigured()) {
      // In mock/demo mode, only allow known demo admin email
      return session.user.email === 'admin@shreehari.com';
    }

    // Step 2: Verify against the database profiles table (not just JWT claims)
    // This is a live server-side check — role changes take effect immediately.
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profileError || !profile) {
      return false;
    }

    return profile.role === 'admin';
  } catch (err) {
    console.error('[AuthGuard] Admin verification failed:', err);
    return false;
  }
}

/**
 * Returns the current authenticated user's role from the database.
 * Returns null if not authenticated.
 */
export async function getAuthenticatedUserRole(): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    return profile?.role || null;
  } catch {
    return null;
  }
}
