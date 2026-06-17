import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials are not set in environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Custom no-op lock to completely bypass navigator.locks.
    // This prevents authentication processes from hanging indefinitely in development (due to HMR/Fast Refresh)
    // or when Chrome/browser suspends background locks.
    lock: async (_name, _acquireTimeout, fn) => {
      return await fn();
    },
  }
});
