'use server';

/**
 * Poll Retrieval Module
 * 
 * This module provides server actions for retrieving polls and poll details from the database.
 * It handles fetching polls with their associated metadata like vote counts and options.
 */

import { createServerSupabaseClient } from '../supabase-server';
import { getCurrentUser } from './auth';

/**
 * Represents a poll with summary information
 * Used for displaying polls in lists and grids
 */
export type Poll = {
  id: string;               // Unique identifier for the poll
  title: string;            // Title of the poll
  description: string | null; // Optional description of the poll
  created_at: string;       // Creation timestamp
  created_by: string;       // User ID of the creator
  user_email?: string;      // Email of the creator (optional, for display)
  options_count: number;    // Number of options in the poll
  votes_count: number;      // Total number of votes across all options
};

/**
 * Response type for poll listing operations
 */
type PollResponse = {
  polls: Poll[];            // Array of polls
  error: string | null;     // Error message if retrieval failed
};

/**
 * Response type for detailed poll information
 * Contains the poll with its options and vote counts
 */

type PollDetailResponse = {
  poll: {
    id: string;             // Unique identifier for the poll
    title: string;          // Title of the poll
    description: string | null; // Optional description of the poll
    created_at: string;     // Creation timestamp
    created_by: string;     // User ID of the creator
    user_email?: string | null; // Email of the creator (optional, for display)
    options: {              // Array of poll options with vote counts
      id: string;           // Unique identifier for the option
      text: string;         // Text of the option
      poll_id: string;      // ID of the parent poll
      votes: number;        // Number of votes for this option
    }[];
    total_votes: number;    // Sum of votes across all options
  } | null;
  options: { id: string; text: string; poll_id: string; votes: number; }[]; // Options array duplicated for easy access
  error: string | null;     // Error message if retrieval failed
};

/**
 * Centralized error handling for poll retrieval operations
 * 
 * @param {unknown} error - The error that occurred
 * @param {string} context - Description of where the error occurred
 * @returns {string} Formatted error message
 */
const handleError = (error: unknown, context: string) => {
  console.error(`Error in ${context}:`, error);
  return error instanceof Error ? error.message : 'An unexpected error occurred';
};

/**
 * Retrieves all polls with summary information
 * 
 * This function:
 * 1. Fetches all polls from the database
 * 2. Includes counts of options and votes for each poll
 * 3. Sorts polls by creation date (newest first)
 *
 * @returns {Promise<PollResponse>} Polls with their summary information
 */

export async function getPolls(): Promise<PollResponse> {
  try {
    const supabase = createServerSupabaseClient();
    
    // Use SQL count and joins to efficiently get polls with pre-counted options and votes
    // This is more efficient than fetching polls and then counting related records separately
    const { data: pollsWithCounts, error } = await supabase
      .from('polls')
      .select(`
        id,
        title,
        description,
        created_at,
        created_by,
        options_count:poll_options(count),  // Count of options for each poll
        votes_count:votes(count)            // Count of votes for each poll
      `)
      .order('created_at', { ascending: false });  // Newest polls first
    
    if (error) {
      return { polls: [], error: 'Failed to fetch polls' };
    }

    if (!pollsWithCounts || pollsWithCounts.length === 0) {
      return { polls: [], error: null };
    }
    
    // Format the polls with counts already provided by SQL
    // The Supabase query returns counts as nested arrays, so we extract the count values
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

/**
 * Retrieves detailed information for a specific poll
 * 
 * This function:
 * 1. Fetches a specific poll by ID
 * 2. Retrieves all options for the poll with their vote counts
 * 3. Calculates the total vote count across all options
 *
 * @param {string} id - ID of the poll to retrieve
 * @returns {Promise<PollDetailResponse>} Detailed poll information with options and vote counts
 */

export async function getPollById(id: string): Promise<PollDetailResponse> {
  try {
    const supabase = createServerSupabaseClient();
    
    // Fetch the basic poll information
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
    
    // Fetch poll options with vote counts using a stored procedure
    // This is more efficient than making separate queries and joining in JavaScript
    const { data: optionsWithVotes, error: optionsError } = await supabase
      .rpc('get_options_with_vote_counts', { poll_id_param: id });
      
    if (optionsError) {
      return { poll: null, options: [], error: 'Failed to fetch poll options' };
    }
    
    // Format the options with vote counts into a more usable structure
    const formattedOptions = optionsWithVotes.map(option => ({
      id: option.id,
      text: option.option_text,
      poll_id: option.poll_id,
      votes: option.vote_count
    }));
    
    // Combine poll data with options and calculate total vote count
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