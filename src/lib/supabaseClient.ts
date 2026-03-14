import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase env variables are missing!');
}

// 이 객체를 통해 우리는 DB에 데이터를 넣고 뺄 거예요.
export const supabase = createClient(
  supabaseUrl || '', 
  supabaseAnonKey || ''
);