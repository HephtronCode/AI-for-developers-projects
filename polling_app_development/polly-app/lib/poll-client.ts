import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from './types';

const supabase = createClientComponentClient<Database>();

/**
 * Cast a vote for a poll option (client-side)
 * @param pollId - The poll's ID
 * @param optionId - The selected option's ID
 * @param userId - The voter's user ID
 * @returns Success or error object
 */
export async function castVote(pollId: string, optionId: string, userId: string) {
  const { error } = await supabase.from('votes').insert({
    poll_id: pollId,
    option_id: optionId,
    user_id: userId,
  });
  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

/**
 * Retrieve poll results (client-side)
 * @param pollId - The poll's ID
 * @returns Array of options with vote counts
 */
export async function getPollResults(pollId: string) {
  const { data, error } = await supabase
    .from('poll_options')
    .select('id, option_text, votes:votes(count)')
    .eq('poll_id', pollId);

  if (error) {
    return { success: false, error: error.message, results: [] };
  }

  // Format results: [{ id, option_text, votes: number }]
  const results = (data || []).map(opt => ({
    id: opt.id,
    text: opt.option_text,
    votes: Array.isArray(opt.votes) ? opt.votes.length : 0,
  }));

  return { success: true, results };
}
