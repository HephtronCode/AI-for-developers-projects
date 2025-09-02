import { deletePoll, updatePoll } from '../poll-actions';
import { createServerSupabaseClient } from '../../supabase-server';
import { revalidatePath } from 'next/cache';

// Mock dependencies
jest.mock('../../supabase-server', () => ({
  createServerSupabaseClient: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

describe('Poll Actions', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('deletePoll', () => {
    it('should return error if user is not logged in', async () => {
      // Mock Supabase client with no session
      const mockSupabase = {
        auth: {
          getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
        },
      };
      (createServerSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

      // Call the function
      const result = await deletePoll('test-poll-id');

      // Assertions
      expect(result).toEqual({
        success: false,
        error: 'You must be logged in to delete a poll',
      });
      expect(mockSupabase.auth.getSession).toHaveBeenCalledTimes(1);
    });

    it('should return error if poll is not found', async () => {
      // Mock Supabase client with session but poll not found
      const mockSupabase = {
        auth: {
          getSession: jest.fn().mockResolvedValue({
            data: { session: { user: { id: 'user-123' } } },
          }),
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                error: { message: 'Poll not found' },
                data: null,
              }),
            }),
          }),
        }),
      };
      (createServerSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

      // Call the function
      const result = await deletePoll('test-poll-id');

      // Assertions
      expect(result).toEqual({
        success: false,
        error: 'Poll not found',
      });
    });

    it('should return error if user does not own the poll', async () => {
      // Mock Supabase client with session and poll found but different owner
      const mockSupabase = {
        auth: {
          getSession: jest.fn().mockResolvedValue({
            data: { session: { user: { id: 'user-123' } } },
          }),
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                error: null,
                data: { created_by: 'different-user-456' },
              }),
            }),
          }),
          delete: jest.fn().mockReturnValue({
            eq: jest.fn(),
          }),
        }),
      };
      (createServerSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

      // Call the function
      const result = await deletePoll('test-poll-id');

      // Assertions
      expect(result).toEqual({
        success: false,
        error: 'You can only delete your own polls',
      });
    });

    it('should successfully delete a poll', async () => {
      // Mock Supabase client with session, poll found, and same owner
      const mockSupabase = {
        auth: {
          getSession: jest.fn().mockResolvedValue({
            data: { session: { user: { id: 'user-123' } } },
          }),
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                error: null,
                data: { created_by: 'user-123' },
              }),
            }),
          }),
          delete: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              error: null,
            }),
          }),
        }),
      };
      (createServerSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

      // Call the function
      const result = await deletePoll('test-poll-id');

      // Assertions
      expect(result).toEqual({ success: true });
      expect(revalidatePath).toHaveBeenCalledWith('/');
      expect(revalidatePath).toHaveBeenCalledWith('/polls');
    });
  });

  describe('updatePoll', () => {
    const mockPollData = {
      title: 'Updated Poll Title',
      description: 'Updated poll description',
      options: [{ text: 'Option 1' }, { text: 'Option 2' }],
    };

    it('should return error if user is not logged in', async () => {
      // Mock Supabase client with no session
      const mockSupabase = {
        auth: {
          getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
        },
      };
      (createServerSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

      // Call the function
      const result = await updatePoll('test-poll-id', mockPollData);

      // Assertions
      expect(result).toEqual({
        success: false,
        error: 'You must be logged in to update a poll',
      });
    });

    it('should return error if poll is not found', async () => {
      // Mock Supabase client with session but poll not found
      const mockSupabase = {
        auth: {
          getSession: jest.fn().mockResolvedValue({
            data: { session: { user: { id: 'user-123' } } },
          }),
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                error: { message: 'Poll not found' },
                data: null,
              }),
            }),
          }),
        }),
      };
      (createServerSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

      // Call the function
      const result = await updatePoll('test-poll-id', mockPollData);

      // Assertions
      expect(result).toEqual({
        success: false,
        error: 'Poll not found',
      });
    });

    it('should return error if user does not own the poll', async () => {
      // Mock Supabase client with session and poll found but different owner
      const mockSupabase = {
        auth: {
          getSession: jest.fn().mockResolvedValue({
            data: { session: { user: { id: 'user-123' } } },
          }),
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                error: null,
                data: { created_by: 'different-user-456' },
              }),
            }),
          }),
        }),
      };
      (createServerSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

      // Call the function
      const result = await updatePoll('test-poll-id', mockPollData);

      // Assertions
      expect(result).toEqual({
        success: false,
        error: 'You can only update your own polls',
      });
    });

    it('should successfully update a poll', async () => {
      // Mock Supabase client with session, poll found, and same owner
      const mockSupabase = {
        auth: {
          getSession: jest.fn().mockResolvedValue({
            data: { session: { user: { id: 'user-123' } } },
          }),
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                error: null,
                data: { created_by: 'user-123' },
              }),
            }),
          }),
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              error: null,
            }),
          }),
          delete: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              error: null,
            }),
          }),
          insert: jest.fn().mockResolvedValue({
            error: null,
          }),
        }),
      };
      (createServerSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

      // Call the function
      const result = await updatePoll('test-poll-id', mockPollData);

      // Assertions
      expect(result).toEqual({ success: true });
      expect(revalidatePath).toHaveBeenCalledWith('/');
      expect(revalidatePath).toHaveBeenCalledWith('/polls');
      expect(revalidatePath).toHaveBeenCalledWith('/polls/test-poll-id');
    });
  });
});