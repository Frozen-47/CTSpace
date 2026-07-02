// Supabase configuration details
// By default, the application runs in "Mock Database" mode using localStorage.
// To connect to a live Supabase instance:
// 1. Set 'useSupabase' to true (or toggle it in the Admin Panel)
// 2. Provide your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (either here or via environment variables)

export const SUPABASE_CONFIG = {
  url: import.meta.env.VITE_SUPABASE_URL || '',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  // This can be toggled dynamically in the UI and stored in localStorage.
  // We initialize it to false.
  getUseSupabase: (): boolean => {
    const stored = localStorage.getItem('ctspace_use_supabase');
    if (stored !== null) {
      return stored === 'true';
    }
    // Fallback: use true if environment variables are provided
    return Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
  },
  setUseSupabase: (value: boolean) => {
    localStorage.setItem('ctspace_use_supabase', value ? 'true' : 'false');
  }
};
