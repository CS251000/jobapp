// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv';
config({ path: '.env.local' });
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)
