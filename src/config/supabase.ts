// Supabase configuration details
// By default, the application runs in "Mock Database" mode using localStorage.
// To connect to a live Supabase instance:
// 1. Set 'useSupabase' to true (or toggle it in the Admin Panel)
// 2. Provide your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (either here or via environment variables)

export const SUPABASE_CONFIG = {
  url: import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || import.meta.env.SUPABASE_URL || '',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY || '',
  // This can be toggled dynamically in the UI and stored in localStorage.
  getUseSupabase: (): boolean => {
    const stored = localStorage.getItem('ctspace_use_supabase');
    if (stored !== null) {
      return stored === 'true';
    }
    // Fallback: use true if environment variables are provided
    const url = SUPABASE_CONFIG.url;
    const key = SUPABASE_CONFIG.anonKey;
    return Boolean(url && key);
  },
  setUseSupabase: (value: boolean) => {
    localStorage.setItem('ctspace_use_supabase', value ? 'true' : 'false');
  }
};
