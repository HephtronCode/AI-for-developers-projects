'use server';

/**
 * Poll Management Actions Module
 * 
 * This module provides server actions for managing existing polls in the Polly app.
 * It includes functions for updating and deleting polls, with proper validation,
 * authentication, and authorization checks.
 */

import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient } from '../supabase-server';
import { UpdatePollData } from '../types';
import { getCurrentUser } from './auth';

/**
 * Standard response type for poll management actions
 */
type ActionResponse = {
  success: boolean;  // Whether the operation was successful
  error?: string;    // Error message (if unsuccessful)
};

/**
 * Centralized error handler for poll management actions
 * 
 * Provides consistent error handling and logging across the module.
 * 
 * @param {unknown} error - The error that occurred
 * @param {string} context - Description of where the error occurred
 * @returns {ActionResponse} Standardized error response
 */
const handleError = (error: unknown, context: string): ActionResponse => {
  console.error(`Error in ${context}:`, error);
  return { 
    success: false, 
    error: error instanceof Error ? error.message : 'An unexpected error occurred' 
  };
};

/**
 * Verifies if the current user owns a specific poll
 * 
 * This function provides a reusable authentication and authorization check
 * before allowing poll management operations. It:
 * 1. Checks if the user is authenticated
 * 2. Verifies the poll exists
 * 3. Confirms the authenticated user is the poll creator
 *
 * @param {string} pollId - ID of the poll to check ownership for
 * @returns {Promise<Object>} Result of ownership verification with user ID if successful
 */

// Abstract user authentication and ownership check
async function verifyPollOwnership(pollId: string): Promise<{ 
  success: boolean; 
  userId?: string; 
  error?: string 
}> {
  try {
    // Get the current user from the session
    const { user, error: authError } = await getCurrentUser();
    
    if (authError || !user) {
      return { success: false, error: 'You must be logged in to manage polls' };
    }
    
    const userId = user.id;
    const supabase = createServerSupabaseClient();
    
    // Check if the user owns this poll by comparing created_by with current user ID
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .select('created_by')
      .eq('id', pollId)
      .single();
    
    if (pollError) {
      return { success: false, error: 'Poll not found' };
    }
    
    if (poll.created_by !== userId) {
      return { success: false, error: 'You can only manage your own polls' };
    }
    
    return { success: true, userId };
  } catch (error) {
    return handleError(error, 'verifyPollOwnership');
  }
}

/**
 * Validates poll data before database operations
 * 
 * Ensures that polls meet minimum requirements:
 * - Must have a non-empty title
 * - Must have at least two options
 * - All options must have non-empty text
 *
 * @param {UpdatePollData} data - The poll data to validate
 * @returns {object} Validation result with valid flag and optional error message
 */
function validatePollData(data: UpdatePollData): { valid: boolean; error?: string } {
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
 * Helper function to revalidate all paths that display poll data
 * 
 * This ensures that after a poll is updated or deleted, all views
 * showing poll data are refreshed with the latest information.
 *
 * @param {string} [pollId] - Optional ID of the specific poll that was changed
 */

function revalidatePollPaths(pollId?: string): void {
  revalidatePath('/');
  revalidatePath('/polls');
  if (pollId) {
    revalidatePath(`/polls/${pollId}`);
  }
}

/**
 * Deletes a poll and all associated data
 * 
 * This function:
 * 1. Verifies the user is authenticated and owns the poll
 * 2. Deletes the poll from the database (cascading to related records)
 * 3. Revalidates relevant paths to update the UI
 *
 * @param {string} pollId - ID of the poll to delete
 * @returns {Promise<ActionResponse>} Result of the deletion operation
 */
export async function deletePoll(pollId: string): Promise<ActionResponse> {
  try {
    // Verify the user is authenticated and owns this poll
    const { success, error } = await verifyPollOwnership(pollId);
    
    if (!success) {
      return { success: false, error };
    }
    
    const supabase = createServerSupabaseClient();
    
    // Delete the poll (cascade will handle related options and votes)
    const { error: deleteError } = await supabase
      .from('polls')
      .delete()
      .eq('id', pollId);
    
    if (deleteError) {
      return { success: false, error: 'Failed to delete poll' };
    }
    
    // Revalidate the pages to show updated data
    revalidatePollPaths();
    
    return { success: true };
  } catch (error) {
    return handleError(error, 'deletePoll');
  }
}

/**
 * Updates an existing poll with new data
 * 
 * This function:
 * 1. Validates the updated poll data
 * 2. Verifies the user is authenticated and owns the poll
 * 3. Updates the poll title and description
 * 4. Replaces all poll options with the new options
 * 5. Revalidates relevant paths to update the UI
 *
 * @param {string} pollId - ID of the poll to update
 * @param {UpdatePollData} data - New poll data
 * @returns {Promise<ActionResponse>} Result of the update operation
 */
export async function updatePoll(pollId: string, data: UpdatePollData): Promise<ActionResponse> {
  try {
    // Validate input data before proceeding
    const validation = validatePollData(data);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    
    // Verify the user is authenticated and owns this poll
    const { success, error } = await verifyPollOwnership(pollId);
    
    if (!success) {
      return { success: false, error };
    }
    
    const supabase = createServerSupabaseClient();
    
    // Update the poll title and description
    const { error: updateError } = await supabase
      .from('polls')
      .update({
        title: data.title,
        description: data.description || null
      })
      .eq('id', pollId);
    
    if (updateError) {
      return { success: false, error: 'Failed to update poll' };
    }
    
    // Replace all options with new ones by first deleting existing options
    // This approach is simpler than trying to update, add, and remove options individually
    const { error: deleteOptionsError } = await supabase
      .from('poll_options')
      .delete()
      .eq('poll_id', pollId);
    
    if (deleteOptionsError) {
      return { success: false, error: 'Failed to update poll options' };
    }
    
    // Create new options with the updated data
    const pollOptions = data.options.map(option => ({
      poll_id: pollId,
      option_text: option.text
    }));
    
    const { error: createOptionsError } = await supabase
      .from('poll_options')
      .insert(pollOptions);
    
    if (createOptionsError) {
      return { success: false, error: 'Failed to create poll options' };
    }
    
    // Revalidate the pages to show updated data
    revalidatePollPaths(pollId);
    
    return { success: true };
  } catch (error) {
    return handleError(error, 'updatePoll');
  }
}
