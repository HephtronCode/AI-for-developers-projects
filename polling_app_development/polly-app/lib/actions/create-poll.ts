'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient } from '../supabase-server';
import { CreatePollData } from '../types';
import { getCurrentUser } from './auth';

// Types for standardized responses
type CreatePollResponse = {
  success: boolean;
  pollId?: string;
  error?: string;
};

// Centralized error handling
const handleError = (error: unknown, context: string): { success: boolean; error: string } => {
  console.error(`Error in ${context}:`, error);
  return { 
    success: false, 
    error: error instanceof Error ? error.message : 'An unexpected error occurred' 
  };
};

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

export async function createPoll(data: CreatePollData): Promise<CreatePollResponse> {
  try {
    // Validate input data
    const validation = validatePollData(data);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    
    // Get the current user
    const { user, error: authError } = await getCurrentUser();
    
    if (authError || !user) {
      return { success: false, error: 'You must be logged in to create a poll' };
    }
    
    const userId = user.id;
    const supabase = createServerSupabaseClient();
    
    // Start a transaction by using the same timestamp for all operations
    const timestamp = new Date().toISOString();
    
    // 1. Create the poll
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
    
    // 2. Create the poll options
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
    
    // Revalidate the polls page to show the new poll
    revalidatePath('/polls');
    
    return { success: true, pollId: poll.id };
  } catch (error) {
    return handleError(error, 'createPoll');
  }
}