'use server';

import { z } from 'zod';
import { createServerSupabaseClient } from '../supabase-server';
import { getCurrentUser } from './auth';

const updateUserRoleSchema = z.object({
  userId: z.string().uuid({ message: 'Invalid User ID' }),
  role: z.enum(['admin', 'user'], { message: 'Invalid role specified' }),
});

type UpdateUserRoleResponse = {
  success: boolean;
  error?: string;
  errorDetails?: z.ZodIssue[];
};

export async function updateUserRole(userId: string, role: 'admin' | 'user'): Promise<UpdateUserRoleResponse> {
  try {
    const validationResult = updateUserRoleSchema.safeParse({ userId, role });
    if (!validationResult.success) {
      return {
        success: false,
        error: 'Invalid user role data provided.',
        errorDetails: validationResult.error.issues,
      };
    }

    const { user: currentUser, error: authError } = await getCurrentUser();
    if (authError || !currentUser) {
      return { success: false, error: 'You must be logged in to perform this action' };
    }

    // Check if the current user is an admin
    if (currentUser.user_metadata.role !== 'admin') {
      return { success: false, error: 'Only administrators can update user roles' };
    }

    const supabase = createServerSupabaseClient();

    const { error } = await supabase.auth.admin.updateUserById(
      userId,
      { user_metadata: { role } }
    );

    if (error) {
      console.error('Error updating user role:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error in updateUserRole:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function getUsers(): Promise<{
  users: Array<{ id: string; email: string; role: string }>;
  error?: string;
}> {
  try {
    const { user: currentUser, error: authError } = await getCurrentUser();
    if (authError || !currentUser) {
      return { users: [], error: 'You must be logged in to perform this action' };
    }

    if (currentUser.user_metadata.role !== 'admin') {
      return { users: [], error: 'Only administrators can view users' };
    }

    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase.from('users').select('id, email, raw_user_meta_data');

    if (error) {
      console.error('Error fetching users:', error);
      return { users: [], error: error.message };
    }

    const users = data.map((u) => ({
      id: u.id,
      email: u.email,
      role: u.raw_user_meta_data?.role || 'user',
    }));

    return { users };
  } catch (error) {
    console.error('Unexpected error in getUsers:', error);
    return { users: [], error: (error as Error).message };
  }
}