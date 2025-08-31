'use server';

import { createServerSupabaseClient } from '../supabase-server';

export async function testDatabase() {
  try {
    const supabase = createServerSupabaseClient();
    
    // Test 1: Check if polls table exists and can be queried
    const { data: polls, error: pollsError } = await supabase
      .from('polls')
      .select('*')
      .limit(5);
    
    if (pollsError) {
      console.error('Polls table error:', pollsError);
      return { 
        success: false, 
        error: `Polls table error: ${pollsError.message}`,
        pollsCount: 0
      };
    }
    
    // Test 2: Check if poll_options table exists
    const { data: options, error: optionsError } = await supabase
      .from('poll_options')
      .select('*')
      .limit(5);
    
    if (optionsError) {
      console.error('Poll options table error:', optionsError);
      return { 
        success: false, 
        error: `Poll options table error: ${optionsError.message}`,
        pollsCount: polls?.length || 0
      };
    }
    
    // Test 3: Check if votes table exists
    const { data: votes, error: votesError } = await supabase
      .from('votes')
      .select('*')
      .limit(5);
    
    if (votesError) {
      console.error('Votes table error:', votesError);
      return { 
        success: false, 
        error: `Votes table error: ${votesError.message}`,
        pollsCount: polls?.length || 0
      };
    }
    
    return { 
      success: true, 
      message: 'All tables accessible',
      pollsCount: polls?.length || 0,
      optionsCount: options?.length || 0,
      votesCount: votes?.length || 0
    };
    
  } catch (error) {
    console.error('Database test error:', error);
    return { 
      success: false, 
      error: (error as Error).message 
    };
  }
}
