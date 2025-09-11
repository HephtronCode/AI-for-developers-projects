'use server';

/**
 * @file Server actions for creating new polls.
 * @module lib/actions/create-poll
 * @description Handles the entire poll creation flow, including validation, 
 * database insertion, and cache revalidation.
 */

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createServerSupabaseClient } from '../supabase-server';
import { CreatePollData } from '../types';
import { getCurrentUser } from './auth';

// Defines the validation schema for creating a poll using Zod.
// This ensures data integrity before any database operations.
const pollSchema = z.object({
  title: z.string().trim().min(1, { message: 'Poll title is required' }),
  description: z.string().optional(),
  options: z.array(z.object({
    text: z.string().trim().min(1, { message: 'Option text cannot be empty' })
  })).min(2, { message: 'At least two options are required' })
});

/**
 * Standardized response structure for the createPoll action.
 */
type CreatePollResponse = {
  success: boolean;        // Indicates if the operation was successful.
  pollId?: string;         // The ID of the created poll on success.
  error?: string;          // A general error message on failure.
  errorDetails?: z.ZodIssue[]; // Detailed validation errors from Zod.
};

/**
 * Centralized error handler for the poll creation process.
 * @param {unknown} error The caught error.
 * @param {string} context A string describing the context where the error occurred.
 * @returns {CreatePollResponse} A standardized error response.
 */
const handleError = (error: unknown, context: string): CreatePollResponse => {
  console.error(`Error in ${context}:`, error);
  return { 
    success: false, 
    error: error instanceof Error ? error.message : 'An unexpected error occurred' 
  };
};

/**
 * Creates a new poll.
 * 
 * This server action validates the incoming poll data, verifies user authentication,
 * inserts the poll and its options into the database, and revalidates the cache.
 * The user's ownership is stored, and database-level RLS policies enforce access control.
 *
 * @param {CreatePollData} data - The poll data (title, description, options).
 * @returns {Promise<CreatePollResponse>} The result of the creation operation.
 */
export async function createPoll(data: CreatePollData): Promise<CreatePollResponse> {
  try {
    // Validate the incoming data against the schema.
    const validationResult = pollSchema.safeParse(data);
    if (!validationResult.success) {
      return { 
        success: false, 
        error: 'Invalid poll data provided.',
        errorDetails: validationResult.error.issues,
      };
    }
    const { title, description, options } = validationResult.data;

    // Ensure a user is authenticated before allowing poll creation.
    const { user, error: authError } = await getCurrentUser();
    if (authError || !user) {
      return { success: false, error: 'You must be logged in to create a poll' };
    }

    const supabase = createServerSupabaseClient();

    // Insert the new poll record, linking it to the current user.
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .insert({
        title,
        description: description || null,
        created_by: user.id,
      })
      .select('id')
      .single();

    if (pollError) {
      return { success: false, error: `Failed to create poll: ${pollError.message}` };
    }

    // Prepare and insert the associated poll options.
    const pollOptions = options.map(option => ({
      poll_id: poll.id,
      option_text: option.text
    }));

    const { error: optionsError } = await supabase
      .from('poll_options')
      .insert(pollOptions);

    if (optionsError) {
      // If options fail, attempt to roll back the poll creation to prevent orphans.
      await supabase.from('polls').delete().eq('id', poll.id);
      return { success: false, error: `Failed to create poll options: ${optionsError.message}` };
    }

    // Invalidate the cache for the polls page to ensure the new poll is displayed.
    revalidatePath('/polls');

    return { success: true, pollId: poll.id };
  } catch (error) {
    return handleError(error, 'createPoll');
  }
}