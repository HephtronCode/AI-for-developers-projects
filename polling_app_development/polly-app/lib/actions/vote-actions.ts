'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient } from '../supabase-server';
import { getCurrentUser } from './auth';

// Types for standardized responses
type VoteResponse = {
  success: boolean;
  error?: string;
};

// Centralized error handling
const handleError = (error: unknown, context: string): VoteResponse => {
  console.error(`Error in ${context}:`, error);
  return { 
    success: false, 
    error: error instanceof Error ? error.message : 'An unexpected error occurred' 
  };
};

export async function submitVote(pollId: string, optionId: string): Promise<VoteResponse> {
  try {
    // Get the current user
    const { user, error: authError } = await getCurrentUser();
    
    if (authError || !user) {
      return { success: false, error: 'You must be logged in to vote' };
    }
    
    const userId = user.id;
    const supabase = createServerSupabaseClient();
    
    // Check if user has already voted on this poll
    const { data: existingVote, error: checkError } = await supabase
      .from('votes')
      .select('id')
      .eq('poll_id', pollId)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (checkError) {
      return { success: false, error: 'Failed to check voting status' };
    }
    
    if (existingVote) {
      return { success: false, error: 'You have already voted on this poll' };
    }
    
    // Create the vote
    const { error: voteError } = await supabase
      .from('votes')
      .insert({
        poll_id: pollId,
        poll_option_id: optionId,
        user_id: userId
      });
    
    if (voteError) {
      return { success: false, error: 'Failed to submit vote' };
    }
    
    // Revalidate the pages to show updated data
    revalidatePath(`/polls/${pollId}`);
    revalidatePath('/polls');
    
    return { success: true };
  } catch (error) {
    return handleError(error, 'submitVote');
  }
}