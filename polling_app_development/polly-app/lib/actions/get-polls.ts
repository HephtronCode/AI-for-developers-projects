'use server';

import { createServerSupabaseClient } from '../supabase-server';
import { getCurrentUser } from './auth';

// Types for standardized responses
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

type PollResponse = {
  polls: Poll[];
  error: string | null;
};

type PollDetailResponse = {
  poll: {
    id: string;
    title: string;
    description: string | null;
    created_at: string;
    created_by: string;
    user_email?: string | null;
    options: {
      id: string;
      text: string;
      poll_id: string;
      votes: number;
    }[];
    total_votes: number;
  } | null;
  options: { id: string; text: string; poll_id: string; votes: number; }[];
  error: string | null;
};

// Centralized error handling
const handleError = (error: unknown, context: string) => {
  console.error(`Error in ${context}:`, error);
  return error instanceof Error ? error.message : 'An unexpected error occurred';
};

export async function getPolls(): Promise<PollResponse> {
  try {
    const supabase = createServerSupabaseClient();
    
    // Use SQL count and joins to get polls with pre-counted options and votes
    const { data: pollsWithCounts, error } = await supabase
      .from('polls')
      .select(`
        id,
        title,
        description,
        created_at,
        created_by,
        options_count:poll_options(count),
        votes_count:votes(count)
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      return { polls: [], error: 'Failed to fetch polls' };
    }

    if (!pollsWithCounts || pollsWithCounts.length === 0) {
      return { polls: [], error: null };
    }
    
    // Format the polls with counts already provided by SQL
    const formattedPolls = pollsWithCounts.map(poll => ({
      id: poll.id,
      title: poll.title,
      description: poll.description,
      created_at: poll.created_at,
      created_by: poll.created_by,
      user_email: null,
      options_count: poll.options_count[0]?.count || 0,
      votes_count: poll.votes_count[0]?.count || 0
    }));
    
    return { polls: formattedPolls, error: null };
  } catch (error) {
    const errorMessage = handleError(error, 'getPolls');
    return { polls: [], error: errorMessage };
  }
}

export async function getPollById(id: string): Promise<PollDetailResponse> {
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
      return { poll: null, options: [], error: 'Failed to fetch poll' };
    }
    
    // Fetch poll options with vote counts in a single query
    const { data: optionsWithVotes, error: optionsError } = await supabase
      .rpc('get_options_with_vote_counts', { poll_id_param: id });
      
    if (optionsError) {
      return { poll: null, options: [], error: 'Failed to fetch poll options' };
    }
    
    // Format the options with vote counts
    const formattedOptions = optionsWithVotes.map(option => ({
      id: option.id,
      text: option.option_text,
      poll_id: option.poll_id,
      votes: option.vote_count
    }));
    
    // Format the poll
    const formattedPoll = {
      id: poll.id,
      title: poll.title,
      description: poll.description,
      created_at: poll.created_at,
      created_by: poll.created_by,
      user_email: null,
      options: formattedOptions,
      total_votes: formattedOptions.reduce((sum, opt) => sum + opt.votes, 0)
    };
    
    return { poll: formattedPoll, options: formattedOptions, error: null };
  } catch (error) {
    const errorMessage = handleError(error, 'getPollById');
    return { poll: null, options: [], error: errorMessage };
  }
}