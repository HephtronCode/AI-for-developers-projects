'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '../supabase-server';

type PollOption = {
  text: string;
};

type CreatePollData = {
  title: string;
  description?: string;
  options: PollOption[];
};

export async function createPoll(data: CreatePollData) {
  const supabase = createServerSupabaseClient();
  
  // Get the current user
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('You must be logged in to create a poll');
  }
  
  const userId = session.user.id;
  
  try {
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
      throw new Error(`Failed to create poll: ${pollError.message}`);
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
      throw new Error(`Failed to create poll options: ${optionsError.message}`);
    }
    
    // Revalidate the polls page to show the new poll
    revalidatePath('/polls');
    
    return { success: true, pollId: poll.id };
  } catch (error) {
    console.error('Error creating poll:', error);
    return { success: false, error: (error as Error).message };
  }
}