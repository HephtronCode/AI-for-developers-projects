'use server';

/**
 * Voting System Module
 * 
 * This module provides server actions for handling user votes on polls.
 * It ensures that users can only vote once per poll and handles the
 * persistence of vote data.
 */

import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient } from '../supabase-server';
import { getCurrentUser } from './auth';

/**
 * Standard response type for voting operations
 */
type VoteResponse = {
  success: boolean;  // Whether the operation was successful
  error?: string;    // Error message (if unsuccessful)
};

/**
 * Centralized error handler for voting actions
 * 
 * Provides consistent error handling and logging across the module.
 * 
 * @param {unknown} error - The error that occurred
 * @param {string} context - Description of where the error occurred
 * @returns {VoteResponse} Standardized error response
 */
const handleError = (error: unknown, context: string): VoteResponse => {
  console.error(`Error in ${context}:`, error);
  return { 
    success: false, 
    error: error instanceof Error ? error.message : 'An unexpected error occurred' 
  };
};

/**
 * Records a user's vote for a specific poll option
 * 
 * This function:
 * 1. Verifies the user is authenticated
 * 2. Checks if the user has already voted on this poll
 * 3. Records the vote in the database
 * 4. Revalidates relevant paths to update the UI
 *
 * The one-vote-per-user policy is enforced to maintain poll integrity.
 *
 * @param {string} pollId - ID of the poll being voted on
 * @param {string} optionId - ID of the selected poll option
 * @returns {Promise<VoteResponse>} Result of the voting operation
 */

export async function submitVote(pollId: string, optionId: string): Promise<VoteResponse> {
  try {
    // Get the current user to verify authentication
    const { user, error: authError } = await getCurrentUser();
    
    if (authError || !user) {
      return { success: false, error: 'You must be logged in to vote' };
    }
    
    const userId = user.id;
    const supabase = createServerSupabaseClient();
    
    // Check if user has already voted on this poll
    // This prevents users from voting multiple times on the same poll
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
    
    // Create the vote record in the database
    // This links the user, poll, and selected option
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
    
    // Revalidate the poll detail and polls list pages
    // This ensures vote counts are updated immediately in the UI
    revalidatePath(`/polls/${pollId}`);
    revalidatePath('/polls');
    
    return { success: true };
  } catch (error) {
    return handleError(error, 'submitVote');
  }
}