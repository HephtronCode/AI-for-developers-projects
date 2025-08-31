'use server';

import { createServerSupabaseClient } from '../supabase-server';

export async function testConnection() {
  try {
    const supabase = createServerSupabaseClient();
    
    // Test basic connection
    const { data, error } = await supabase
      .from('polls')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Database connection error:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, message: 'Database connection successful' };
  } catch (error) {
    console.error('Test connection error:', error);
    return { success: false, error: (error as Error).message };
  }
}
