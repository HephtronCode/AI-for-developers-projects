'use server';

/**
 * Authentication server actions for the Polly App
 * This file contains server-side functions for handling user authentication.
 */

import { createServerSupabaseClient } from '../supabase-server';

/**
 * Retrieves the current authenticated user from the Supabase session
 * 
 * This function is used to check if a user is authenticated on the server side.
 * It's particularly useful for server components and server actions that need
 * to verify the user's authentication status before performing operations.
 *
 * @returns {Promise<{ user: User | null; error: string | null }>} Object containing the user if authenticated
 *          or null if not authenticated, along with any error message
 */
export async function getCurrentUser() {
  try {
    // Create a server-side Supabase client
    const supabase = createServerSupabaseClient();
    
    // Fetch the current session from Supabase auth
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      // Log authentication errors for debugging
      console.error('Error getting session:', error);
      return { user: null, error: error.message };
    }
    
    // Return the user from session if it exists, or null if no session
    return { user: session?.user || null, error: null };
  } catch (error) {
    // Handle any unexpected errors that may occur
    console.error('Error in getCurrentUser:', error);
    return { user: null, error: (error as Error).message };
  }
}
