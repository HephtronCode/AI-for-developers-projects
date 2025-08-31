'use server';

import { createServerSupabaseClient } from '../supabase-server';

export async function getCurrentUser() {
  try {
    const supabase = createServerSupabaseClient();
    
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting session:', error);
      return { user: null, error: error.message };
    }
    
    return { user: session?.user || null, error: null };
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return { user: null, error: (error as Error).message };
  }
}
