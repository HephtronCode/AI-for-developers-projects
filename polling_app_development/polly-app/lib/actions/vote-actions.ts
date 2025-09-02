'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient } from '../supabase-server';

export async function submitVote(pollId: string, optionId: string) {
  try {
    const supabase = createServerSupabaseClient();
    
    // Get the current user
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return { success: false, error: 'You must be logged in to vote' };
    }
    
    const userId = session.user.id;
    
    // Check if user has already voted on this poll
    const { data: existingVote, error: checkError } = await supabase
      .from('votes')
      .select('id')
      .eq('poll_id', pollId)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking existing vote:', checkError);
      return { success: false, error: 'Failed to check voting status' };
    }
    
    if (existingVote) {
      return { success: false, error: 'You have already voted on this poll' };
    }
    
    // Create the vote
    const { error: voteError } = await supabase
      .from('votes')
      .insert({
        poll_id: pollId,
        poll_option_id: optionId,
        user_id: userId
      });
    
    if (voteError) {
      console.error('Error submitting vote:', voteError);
      return { success: false, error: 'Failed to submit vote' };
    }
    
    // Revalidate the pages to show updated data
    revalidatePath(`/polls/${pollId}`);
    revalidatePath('/polls');
    
    return { success: true };
  } catch (error) {
    console.error('Error in submitVote:', error);
    return { success: false, error: (error as Error).message };
  }
}