import { deletePoll, updatePoll } from '../poll-actions';
import { createServerSupabaseClient } from '../../supabase-server';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '../auth';

// Mock dependencies
jest.mock('../../supabase-server', () => ({
  createServerSupabaseClient: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

jest.mock('../auth', () => ({
  getCurrentUser: jest.fn(),
}));

describe('Poll Actions', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('deletePoll', () => {
    it('should return error if user is not logged in', async () => {
      // Mock getCurrentUser with no user
      (getCurrentUser as jest.Mock).mockResolvedValue({ user: null, error: 'Not authenticated' });

      // Call the function
      const result = await deletePoll('test-poll-id');

      // Assertions
      expect(result).toEqual({
        success: false,
        error: 'You must be logged in to manage polls',
      });
      expect(getCurrentUser).toHaveBeenCalledTimes(1);
    });

    it('should return error if poll is not found', async () => {
      // Mock getCurrentUser with a user
      (getCurrentUser as jest.Mock).mockResolvedValue({ user: { id: 'user-123' }, error: null });
      
      // Mock Supabase client with poll not found
      const mockSupabase = {
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
      // Mock getCurrentUser with a user
      (getCurrentUser as jest.Mock).mockResolvedValue({ user: { id: 'user-123' }, error: null });
      
      // Mock Supabase client with poll found but different owner
      const mockSupabase = {
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
        error: 'You can only manage your own polls',
      });
    });

    it('should successfully delete a poll', async () => {
      // Mock getCurrentUser with a user
      (getCurrentUser as jest.Mock).mockResolvedValue({ user: { id: 'user-123' }, error: null });
      
      // Mock Supabase client with poll found and same owner
      const mockSupabase = {
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
      expect(revalidatePath).toHaveBeenCalledTimes(2); // Called for '/' and '/polls'
    });
  });

  describe('updatePoll', () => {
    const mockPollData = {
      title: 'Updated Poll Title',
      description: 'Updated poll description',
      options: [{ text: 'Option 1' }, { text: 'Option 2' }],
    };

    it('should return error if user is not logged in', async () => {
      // Mock getCurrentUser with no user
      (getCurrentUser as jest.Mock).mockResolvedValue({ user: null, error: 'Not authenticated' });

      // Call the function
      const result = await updatePoll('test-poll-id', mockPollData);

      // Assertions
      expect(result).toEqual({
        success: false,
        error: 'You must be logged in to manage polls',
      });
    });

    it('should return error if poll is not found', async () => {
      // Mock getCurrentUser with a user
      (getCurrentUser as jest.Mock).mockResolvedValue({ user: { id: 'user-123' }, error: null });
      
      // Mock Supabase client with poll not found
      const mockSupabase = {
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
      // Mock getCurrentUser with a user
      (getCurrentUser as jest.Mock).mockResolvedValue({ user: { id: 'user-123' }, error: null });
      
      // Mock Supabase client with poll found but different owner
      const mockSupabase = {
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
        error: 'You can only manage your own polls',
      });
    });

    it('should successfully update a poll', async () => {
      // Mock getCurrentUser with a user
      (getCurrentUser as jest.Mock).mockResolvedValue({ user: { id: 'user-123' }, error: null });
      
      // Mock Supabase client with poll found and same owner
      const mockSupabase = {
        from: jest.fn().mockImplementation((table) => {
          if (table === 'polls') {
            return {
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
            };
          } else if (table === 'poll_options') {
            return {
              delete: jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({
                  error: null,
                }),
              }),
              insert: jest.fn().mockResolvedValue({
                error: null,
              }),
            };
          }
          return {};
        }),
      };
      (createServerSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

      // Call the function
      const result = await updatePoll('test-poll-id', mockPollData);

      // Assertions
      expect(result).toEqual({ success: true });
      expect(revalidatePath).toHaveBeenCalledTimes(3); // Called for '/', '/polls', and '/polls/test-poll-id'
    });
  });
});