'use server';

/**
 * @file Server actions for managing comments on polls.
 * @module lib/actions/comment-actions
 * @description Provides functions for creating, reading, and deleting comments on polls.
 */

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createServerSupabaseClient } from '../supabase-server';
import { getCurrentUser } from './auth';

// Validation schema for creating a comment
const createCommentSchema = z.object({
  pollId: z.string().uuid({ message: 'Invalid Poll ID' }),
  content: z.string().min(1, { message: 'Comment cannot be empty' }).max(1000, { message: 'Comment too long' })
});

// Standardized response structure for comment actions
type CommentActionResponse = {
  success: boolean;
  error?: string;
  errorDetails?: z.ZodIssue[];
};

/**
 * Creates a new comment on a poll
 * @param {string} pollId - ID of the poll to comment on
 * @param {string} content - Text content of the comment
 * @returns {Promise<CommentActionResponse>} Success/error response
 */
export async function createComment(pollId: string, content: string): Promise<CommentActionResponse> {
  try {
    // Validate input
    const validation = createCommentSchema.safeParse({ pollId, content });
    if (!validation.success) {
      return {
        success: false,
        error: 'Validation failed',
        errorDetails: validation.error.errors
      };
    }

    // Get current user
    const { user, error: authError } = await getCurrentUser();
    if (authError || !user) {
      return { success: false, error: authError || 'User not authenticated' };
    }

    // Create comment in database
    const supabase = createServerSupabaseClient();
    const { error } = await supabase
      .from('comments')
      .insert({
        poll_id: pollId,
        user_id: user.id,
        content
      });

    if (error) {
      return { success: false, error: error.message };
    }

    // Revalidate the poll page to show new comment
    revalidatePath(`/polls/${pollId}`);
    return { success: true };
  } catch (err) {
    console.error('Failed to create comment:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Deletes a comment
 * @param {string} commentId - ID of the comment to delete
 * @returns {Promise<CommentActionResponse>} Success/error response
 */
export async function deleteComment(commentId: string): Promise<CommentActionResponse> {
  try {
    // Get current user
    const { user, error: authError } = await getCurrentUser();
    if (authError || !user) {
      return { success: false, error: authError || 'User not authenticated' };
    }

    // Delete comment if user is the owner
    const supabase = createServerSupabaseClient();
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Failed to delete comment:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Gets all comments for a poll
 * @param {string} pollId - ID of the poll to get comments for
 * @returns {Promise<{comments: Array<any> | null, error: string | null}>} Comments or error
 */
export async function getComments(pollId: string): Promise<{ comments: Array<any> | null, error: string | null }> {
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('comments')
      .select(`
        id,
        content,
        created_at,
        user_id,
        profiles:user_id(email)
      `)
      .eq('poll_id', pollId)
      .order('created_at', { ascending: false });

    if (error) {
      return { comments: null, error: error.message };
    }

    return { comments: data, error: null };
  } catch (err) {
    console.error('Failed to fetch comments:', err);
    return { comments: null, error: 'Failed to fetch comments' };
  }
}