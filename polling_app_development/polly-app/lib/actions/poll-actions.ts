'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient } from '../supabase-server';

export async function deletePoll(pollId: string) {
  try {
    const supabase = createServerSupabaseClient();
    
    // Get the current user
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return { success: false, error: 'You must be logged in to delete a poll' };
    }
    
    const userId = session.user.id;
    
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
      return { success: false, error: 'You can only delete your own polls' };
    }
    
    // Delete the poll (cascade will handle related records)
    const { error: deleteError } = await supabase
      .from('polls')
      .delete()
      .eq('id', pollId);
    
    if (deleteError) {
      console.error('Error deleting poll:', deleteError);
      return { success: false, error: 'Failed to delete poll' };
    }
    
    // Revalidate the pages to show updated data
    revalidatePath('/');
    revalidatePath('/polls');
    
    return { success: true };
  } catch (error) {
    console.error('Error in deletePoll:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function updatePoll(pollId: string, data: {
  title: string;
  description?: string;
  options: { text: string }[];
}) {
  try {
    const supabase = createServerSupabaseClient();
    
    // Get the current user
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return { success: false, error: 'You must be logged in to update a poll' };
    }
    
    const userId = session.user.id;
    
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
      return { success: false, error: 'You can only update your own polls' };
    }
    
    // Update the poll
    const { error: updateError } = await supabase
      .from('polls')
      .update({
        title: data.title,
        description: data.description || null
      })
      .eq('id', pollId);
    
    if (updateError) {
      console.error('Error updating poll:', updateError);
      return { success: false, error: 'Failed to update poll' };
    }
    
    // Delete existing options and create new ones
    const { error: deleteOptionsError } = await supabase
      .from('poll_options')
      .delete()
      .eq('poll_id', pollId);
    
    if (deleteOptionsError) {
      console.error('Error deleting poll options:', deleteOptionsError);
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
      console.error('Error creating poll options:', createOptionsError);
      return { success: false, error: 'Failed to create poll options' };
    }
    
    // Revalidate the pages to show updated data
    revalidatePath('/');
    revalidatePath('/polls');
    revalidatePath(`/polls/${pollId}`);
    
    return { success: true };
  } catch (error) {
    console.error('Error in updatePoll:', error);
    return { success: false, error: (error as Error).message };
  }
}
