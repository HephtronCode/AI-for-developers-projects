'use server';

import { createServerSupabaseClient } from '../supabase-server';

export type Poll = {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  created_by: string;
  user_email?: string;
  options_count: number;
  votes_count: number;
};

export async function getPolls() {
  try {
    const supabase = createServerSupabaseClient();
    
    // Get the current user session
    const { data: { session } } = await supabase.auth.getSession();
    
    // Fetch polls
    const { data: polls, error } = await supabase
      .from('polls')
      .select(`
        id,
        title,
        description,
        created_at,
        created_by
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching polls:', error);
      return { polls: [], error: 'Failed to fetch polls' };
    }

    if (!polls || polls.length === 0) {
      return { polls: [], error: null };
    }

    // Get option counts for each poll
    const pollIds = polls.map(poll => poll.id);
    
    // Get option counts
    const { data: optionCounts, error: optionsError } = await supabase
      .from('poll_options')
      .select('poll_id')
      .in('poll_id', pollIds);
      
    if (optionsError) {
      console.error('Error fetching option counts:', optionsError);
    }
    
    // Get vote counts
    const { data: voteCounts, error: votesError } = await supabase
      .from('votes')
      .select('poll_id')
      .in('poll_id', pollIds);
      
    if (votesError) {
      console.error('Error fetching vote counts:', votesError);
    }
    
    // Count options and votes per poll
    const optionCountMap = new Map();
    optionCounts?.forEach(item => {
      optionCountMap.set(item.poll_id, (optionCountMap.get(item.poll_id) || 0) + 1);
    });
    
    const voteCountMap = new Map();
    voteCounts?.forEach(item => {
      voteCountMap.set(item.poll_id, (voteCountMap.get(item.poll_id) || 0) + 1);
    });
    
    // Format the polls with counts
    const formattedPolls = polls.map(poll => ({
      id: poll.id,
      title: poll.title,
      description: poll.description,
      created_at: poll.created_at,
      created_by: poll.created_by,
      user_email: null, // We'll handle user email separately if needed
      options_count: optionCountMap.get(poll.id) || 0,
      votes_count: voteCountMap.get(poll.id) || 0
    }));
    
    return { polls: formattedPolls, error: null };
  } catch (error) {
    console.error('Error in getPolls:', error);
    return { polls: [], error: 'An unexpected error occurred' };
  }
}

export async function getPollById(id: string) {
  try {
    const supabase = createServerSupabaseClient();
    
    // Fetch the poll
    const { data: poll, error } = await supabase
      .from('polls')
      .select(`
        id,
        title,
        description,
        created_at,
        created_by
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching poll:', error);
      return { poll: null, error: 'Failed to fetch poll' };
    }
    
    // Fetch poll options
    const { data: options, error: optionsError } = await supabase
      .from('poll_options')
      .select('id, option_text, poll_id')
      .eq('poll_id', id);
      
    if (optionsError) {
      console.error('Error fetching poll options:', optionsError);
      return { poll: null, options: [], error: 'Failed to fetch poll options' };
    }
    
    // Fetch vote counts for each option
    const { data: voteCounts, error: votesError } = await supabase
      .from('votes')
      .select('poll_option_id')
      .in('poll_option_id', options.map(opt => opt.id));
      
    if (votesError) {
      console.error('Error fetching vote counts:', votesError);
    }
    
    // Count votes per option
    const voteCountMap = new Map();
    voteCounts?.forEach(item => {
      voteCountMap.set(item.poll_option_id, (voteCountMap.get(item.poll_option_id) || 0) + 1);
    });
    
    // Format the options with vote counts
    const formattedOptions = options.map(option => ({
      id: option.id,
      text: option.option_text,
      poll_id: option.poll_id,
      votes: voteCountMap.get(option.id) || 0
    }));
    
    // Format the poll
    const formattedPoll = {
      id: poll.id,
      title: poll.title,
      description: poll.description,
      created_at: poll.created_at,
      created_by: poll.created_by,
      user_email: null, // We'll handle user email separately if needed
      options: formattedOptions,
      total_votes: formattedOptions.reduce((sum, opt) => sum + opt.votes, 0)
    };
    
    return { poll: formattedPoll, error: null };
  } catch (error) {
    console.error('Error in getPollById:', error);
    return { poll: null, error: 'An unexpected error occurred' };
  }
}