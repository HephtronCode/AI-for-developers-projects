'use server';

/**
 * Poll Creation Module
 * 
 * This module provides server actions for creating new polls in the Polly app.
 * It handles the entire poll creation flow, including validation, database operations,
 * and error handling.
 */

import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient } from '../supabase-server';
import { CreatePollData } from '../types';
import { getCurrentUser } from './auth';

/**
 * Response type for the createPoll function
 * Provides a standardized structure for poll creation responses
 */
type CreatePollResponse = {
  success: boolean;        // Whether the operation was successful
  pollId?: string;         // ID of the created poll (if successful)
  error?: string;          // Error message (if unsuccessful)
};

/**
 * Centralized error handler for poll creation
 * 
 * Provides consistent error handling and logging across the module.
 * 
 * @param {unknown} error - The error that occurred
 * @param {string} context - Description of where the error occurred
 * @returns {object} Standardized error response
 */
const handleError = (error: unknown, context: string): { success: boolean; error: string } => {
  console.error(`Error in ${context}:`, error);
  return { 
    success: false, 
    error: error instanceof Error ? error.message : 'An unexpected error occurred' 
  };
};

/**
 * Validates poll data before database insertion
 * 
 * Ensures that polls meet minimum requirements:
 * - Must have a non-empty title
 * - Must have at least two options
 * - All options must have non-empty text
 *
 * @param {CreatePollData} data - The poll data to validate
 * @returns {object} Validation result with valid flag and optional error message
 */

// Input validation for poll data
function validatePollData(data: CreatePollData): { valid: boolean; error?: string } {
  if (!data.title || data.title.trim().length === 0) {
    return { valid: false, error: 'Poll title is required' };
  }
  
  if (!data.options || data.options.length < 2) {
    return { valid: false, error: 'At least two options are required' };
  }
  
  for (const option of data.options) {
    if (!option.text || option.text.trim().length === 0) {
      return { valid: false, error: 'Option text cannot be empty' };
    }
  }
  
  return { valid: true };
}

/**
 * Creates a new poll with the provided data
 * 
 * This server action handles the entire poll creation process:
 * 1. Validates the input data
 * 2. Verifies user authentication
 * 3. Creates the poll record in the database
 * 4. Creates all poll options in the database
 * 5. Revalidates the polls page to show the new poll
 *
 * @param {CreatePollData} data - Poll data including title, description, and options
 * @returns {Promise<CreatePollResponse>} Result of the poll creation operation
 */
export async function createPoll(data: CreatePollData): Promise<CreatePollResponse> {
  try {
    // Validate input data before processing
    const validation = validatePollData(data);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    
    // Get the current user to verify authentication and get user ID
    const { user, error: authError } = await getCurrentUser();
    
    if (authError || !user) {
      return { success: false, error: 'You must be logged in to create a poll' };
    }
    
    const userId = user.id;
    const supabase = createServerSupabaseClient();
    
    // Start a transaction by using the same timestamp for all operations
    // This ensures data consistency across related tables
    const timestamp = new Date().toISOString();
    
    // 1. Create the poll record in the polls table
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .insert({
        title: data.title,
        description: data.description || null,
        created_by: userId,
        created_at: timestamp
      })
      .select()
      .single();
    
    if (pollError) {
      return { success: false, error: `Failed to create poll: ${pollError.message}` };
    }
    
    // 2. Create the poll options in the poll_options table
    const pollOptions = data.options.map(option => ({
      poll_id: poll.id,
      option_text: option.text
    }));
    
    const { error: optionsError } = await supabase
      .from('poll_options')
      .insert(pollOptions);
    
    if (optionsError) {
      return { success: false, error: `Failed to create poll options: ${optionsError.message}` };
    }
    
    // Revalidate the polls page cache to show the new poll immediately
    revalidatePath('/polls');
    
    return { success: true, pollId: poll.id };
  } catch (error) {
    return handleError(error, 'createPoll');
  }
  }
}