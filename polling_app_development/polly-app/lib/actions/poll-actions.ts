'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient } from '../supabase-server';
import { UpdatePollData } from '../types';
import { getCurrentUser } from './auth';

// Types for standardized responses
type ActionResponse = {
  success: boolean;
  error?: string;
};

// Centralized error handling
const handleError = (error: unknown, context: string): ActionResponse => {
  console.error(`Error in ${context}:`, error);
  return { 
    success: false, 
    error: error instanceof Error ? error.message : 'An unexpected error occurred' 
  };
};

// Abstract user authentication and ownership check
async function verifyPollOwnership(pollId: string): Promise<{ 
  success: boolean; 
  userId?: string; 
  error?: string 
}> {
  try {
    // Get the current user
    const { user, error: authError } = await getCurrentUser();
    
    if (authError || !user) {
      return { success: false, error: 'You must be logged in to manage polls' };
    }
    
    const userId = user.id;
    const supabase = createServerSupabaseClient();
    
    // Check if the user owns this poll
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

// Input validation for poll data
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

// Revalidate all relevant paths
function revalidatePollPaths(pollId?: string): void {
  revalidatePath('/');
  revalidatePath('/polls');
  if (pollId) {
    revalidatePath(`/polls/${pollId}`);
  }
}

// Modularized poll operations
export async function deletePoll(pollId: string): Promise<ActionResponse> {
  try {
    const { success, error } = await verifyPollOwnership(pollId);
    
    if (!success) {
      return { success: false, error };
    }
    
    const supabase = createServerSupabaseClient();
    
    // Delete the poll (cascade will handle related records)
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

export async function updatePoll(pollId: string, data: UpdatePollData): Promise<ActionResponse> {
  try {
    // Validate input data
    const validation = validatePollData(data);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    
    const { success, error } = await verifyPollOwnership(pollId);
    
    if (!success) {
      return { success: false, error };
    }
    
    const supabase = createServerSupabaseClient();
    
    // Update the poll
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
    
    // Delete existing options and create new ones
    const { error: deleteOptionsError } = await supabase
      .from('poll_options')
      .delete()
      .eq('poll_id', pollId);
    
    if (deleteOptionsError) {
      return { success: false, error: 'Failed to update poll options' };
    }
    
    // Create new options
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
