'use server';

export async function checkEnvironment() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  return {
    supabaseUrl: supabaseUrl ? 'Set' : 'Missing',
    supabaseAnonKey: supabaseAnonKey ? 'Set' : 'Missing',
    supabaseServiceKey: supabaseServiceKey ? 'Set' : 'Missing',
    allSet: !!(supabaseUrl && supabaseAnonKey && supabaseServiceKey)
  };
}
