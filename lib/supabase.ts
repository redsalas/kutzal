import { createClient } from '@supabase/supabase-js';

// Support both NEXT_PUBLIC_ prefixed and non-prefixed environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are not set. Please add SUPABASE_URL and SUPABASE_ANON_KEY to your .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
