'use server';

/**
 * @file Server actions for managing existing polls.
 * @module lib/actions/poll-actions
 * @description Provides functions for updating and deleting polls, enforcing validation and authorization.
 */

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createServerSupabaseClient } from '../supabase-server';
import { UpdatePollData } from '../types';
import { getCurrentUser } from './auth';

// Validation schema for updating a poll.
const updatePollSchema = z.object({
  title: z.string().trim().min(1, { message: 'Poll title is required' }),
  description: z.string().optional(),
  options: z.array(z.object({
    text: z.string().trim().min(1, { message: 'Option text cannot be empty' })
  })).min(2, { message: 'At least two options are required' })
});

// Validation schema for a poll ID (ensures it's a valid UUID).
const pollIdSchema = z.object({ pollId: z.string().uuid({ message: 'Invalid Poll ID' }) });

/**
 * Standardized response structure for poll management actions.
 */
type ActionResponse = {
  success: boolean;  // Indicates if the operation was successful.
  error?: string;    // A general error message on failure.
  errorDetails?: z.ZodIssue[]; // Detailed validation errors from Zod.
};

/**
 * Centralized error handler for poll management actions.
 */
const handleError = (error: unknown, context: string): ActionResponse => {
  console.error(`Error in ${context}:`, error);
  return { 
    success: false, 
    error: error instanceof Error ? error.message : 'An unexpected error occurred' 
  };
};

/**
 * Revalidates all cached paths where poll data is displayed.
 * This ensures the UI is up-to-date after a mutation.
 * @param {string} [pollId] - The ID of the poll that was changed.
 */
function revalidatePollPaths(pollId?: string): void {
  revalidatePath('/');
  revalidatePath('/polls');
  if (pollId) {
    revalidatePath(`/polls/${pollId}`);
    revalidatePath(`/polls/${pollId}/edit`);
  }
}

/**
 * Deletes a poll and its associated data.
 * 
 * Authorization is handled by Supabase RLS policies, which ensure
 * that only the poll's creator can perform this action.
 *
 * @param {string} pollId - The ID of the poll to delete.
 * @returns {Promise<ActionResponse>} The result of the deletion operation.
 */
export async function deletePoll(pollId: string): Promise<ActionResponse> {
  try {
    // 1. Validate the poll ID format.
    const validationResult = pollIdSchema.safeParse({ pollId });
    if (!validationResult.success) {
      return { 
        success: false, 
        error: 'Invalid poll ID provided.',
        errorDetails: validationResult.error.issues,
      };
    }

    // 2. Ensure a user is authenticated. RLS policies will handle authorization.
    const { user, error: authError } = await getCurrentUser();
    if (authError || !user) {
      return { success: false, error: 'You must be logged in to delete a poll' };
    }
    
    const supabase = createServerSupabaseClient();
    
    // 3. Attempt to delete the poll. RLS enforces that only the owner can succeed.
    const { error: deleteError } = await supabase
      .from('polls')
      .delete()
      .eq('id', pollId);
    
    if (deleteError) {
      return { success: false, error: `Failed to delete poll: ${deleteError.message}` };
    }
    
    revalidatePollPaths();
    
    return { success: true };
  } catch (error) {
    return handleError(error, 'deletePoll');
  }
}

/**
 * Updates an existing poll with new data.
 * 
 * Authorization is handled by Supabase RLS policies, ensuring that only the
 * poll's creator can perform this action.
 *
 * @param {string} pollId - The ID of the poll to update.
 * @param {UpdatePollData} data - The new data for the poll.
 * @returns {Promise<ActionResponse>} The result of the update operation.
 */
export async function updatePoll(pollId: string, data: UpdatePollData): Promise<ActionResponse> {
  try {
    // 1. Validate both the poll ID and the incoming data.
    const idValidation = pollIdSchema.safeParse({ pollId });
    const dataValidation = updatePollSchema.safeParse(data);

    if (!idValidation.success || !dataValidation.success) {
      const issues = [...(idValidation.success ? [] : idValidation.error.issues), ...(dataValidation.success ? [] : dataValidation.error.issues)];
      return { success: false, error: 'Invalid data provided.', errorDetails: issues };
    }

    // 2. Ensure a user is authenticated. RLS policies will handle authorization.
    const { user, error: authError } = await getCurrentUser();
    if (authError || !user) {
      return { success: false, error: 'You must be logged in to update a poll' };
    }
    
    const supabase = createServerSupabaseClient();
    
    // 3. Update the poll details. RLS enforces ownership.
    const { error: updateError } = await supabase
      .from('polls')
      .update({
        title: dataValidation.data.title,
        description: dataValidation.data.description || null
      })
      .eq('id', pollId);
    
    if (updateError) {
      return { success: false, error: `Failed to update poll: ${updateError.message}` };
    }
    
    // 4. Replace the existing poll options with the new set.
    // This is simpler than calculating a diff of which to add, update, or remove.
    const { error: deleteOptionsError } = await supabase
      .from('poll_options')
      .delete()
      .eq('poll_id', pollId);
    
    if (deleteOptionsError) {
      return { success: false, error: `Failed to delete existing options: ${deleteOptionsError.message}` };
    }
    
    const pollOptions = dataValidation.data.options.map(option => ({
      poll_id: pollId,
      option_text: option.text
    }));
    
    const { error: createOptionsError } = await supabase
      .from('poll_options')
      .insert(pollOptions);
    
    if (createOptionsError) {
      return { success: false, error: `Failed to create new poll options: ${createOptionsError.message}` };
    }
    
    revalidatePollPaths(pollId);
    
    return { success: true };
  } catch (error) {
    return handleError(error, 'updatePoll');
  }
}
