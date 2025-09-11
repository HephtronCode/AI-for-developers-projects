'use server';

/**
 * @file Server action for handling user votes.
 * @module lib/actions/vote-actions
 * @description Provides a function for casting a vote, including validation and authorization.
 */

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createServerSupabaseClient } from '../supabase-server';
import { getCurrentUser } from './auth';

// Validation schema for a vote submission, ensuring both IDs are valid UUIDs.
const voteSchema = z.object({
  pollId: z.string().uuid({ message: 'Invalid Poll ID' }),
  optionId: z.string().uuid({ message: 'Invalid Option ID' }),
});

/**
 * Standardized response structure for the submitVote action.
 */
type VoteResponse = {
  success: boolean;  // Indicates if the operation was successful.
  error?: string;    // A general error message on failure.
  errorDetails?: z.ZodIssue[]; // Detailed validation errors from Zod.
};

/**
 * Centralized error handler for voting actions.
 */
const handleError = (error: unknown, context: string): VoteResponse => {
  console.error(`Error in ${context}:`, error);
  return { 
    success: false, 
    error: error instanceof Error ? error.message : 'An unexpected error occurred' 
  };
};

/**
 * Records a user's vote for a specific poll option.
 *
 * This action validates the input, ensures the user is authenticated, and inserts
 * the vote. A unique constraint in the database (`unique_vote_per_poll`) prevents
 * a user from voting more than once on the same poll.
 *
 * @param {string} pollId - The ID of the poll being voted on.
 * @param {string} optionId - The ID of the selected poll option.
 * @returns {Promise<VoteResponse>} The result of the voting operation.
 */
export async function submitVote(pollId: string, optionId: string): Promise<VoteResponse> {
  try {
    // 1. Validate the poll and option IDs.
    const validationResult = voteSchema.safeParse({ pollId, optionId });
    if (!validationResult.success) {
      return {
        success: false,
        error: 'Invalid vote data provided.',
        errorDetails: validationResult.error.issues,
      };
    }

    // 2. Ensure a user is authenticated before allowing a vote.
    const { user, error: authError } = await getCurrentUser();
    if (authError || !user) {
      return { success: false, error: 'You must be logged in to vote' };
    }
    
    const supabase = createServerSupabaseClient();
    
    // 3. Attempt to insert the vote. The database schema has a unique constraint
    // to prevent a user from voting on the same poll twice.
    const { error: voteError } = await supabase
      .from('votes')
      .insert({
        poll_id: pollId,
        poll_option_id: optionId,
        user_id: user.id
      });
    
    if (voteError) {
      // If the error is a unique constraint violation, provide a user-friendly message.
      if (voteError.code === '23505') {
        return { success: false, error: 'You have already voted on this poll.' };
      }
      return { success: false, error: `Failed to submit vote: ${voteError.message}` };
    }
    
    // 4. Revalidate caches to ensure the UI reflects the new vote count.
    revalidatePath(`/polls/${pollId}`);
    revalidatePath('/polls');
    
    return { success: true };
  } catch (error) {
    return handleError(error, 'submitVote');
  }
}