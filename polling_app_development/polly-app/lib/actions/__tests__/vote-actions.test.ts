import { submitVote } from '../vote-actions';
import { createServerSupabaseClient } from '../../supabase-server';
import { revalidatePath } from 'next/cache';

// Mock dependencies
jest.mock('../../supabase-server', () => ({
  createServerSupabaseClient: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

describe('Vote Actions', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('submitVote', () => {
    const pollId = 'test-poll-id';
    const optionId = 'test-option-id';

    it('should return error if user is not logged in', async () => {
      // Mock Supabase client with no session
      const mockSupabase = {
        auth: {
          getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
        },
      };
      (createServerSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

      // Call the function
      const result = await submitVote(pollId, optionId);

      // Assertions
      expect(result).toEqual({
        success: false,
        error: 'You must be logged in to vote',
      });
      expect(mockSupabase.auth.getSession).toHaveBeenCalledTimes(1);
    });

    it('should return error if checking for existing vote fails', async () => {
      // Mock Supabase client with session but check error
      const mockSupabase = {
        auth: {
          getSession: jest.fn().mockResolvedValue({
            data: { session: { user: { id: 'user-123' } } },
          }),
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                maybeSingle: jest.fn().mockResolvedValue({
                  error: { message: 'Database error' },
                  data: null,
                }),
              }),
            }),
          }),
        }),
      };
      (createServerSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

      // Call the function
      const result = await submitVote(pollId, optionId);

      // Assertions
      expect(result).toEqual({
        success: false,
        error: 'Failed to check voting status',
      });
    });

    it('should return error if user has already voted', async () => {
      // Mock Supabase client with existing vote
      const mockSupabase = {
        auth: {
          getSession: jest.fn().mockResolvedValue({
            data: { session: { user: { id: 'user-123' } } },
          }),
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                maybeSingle: jest.fn().mockResolvedValue({
                  error: null,
                  data: { id: 'existing-vote-id' },
                }),
              }),
            }),
          }),
        }),
      };
      (createServerSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

      // Call the function
      const result = await submitVote(pollId, optionId);

      // Assertions
      expect(result).toEqual({
        success: false,
        error: 'You have already voted on this poll',
      });
    });

    it('should return error if vote submission fails', async () => {
      // Mock Supabase client with insert error
      const mockSupabase = {
        auth: {
          getSession: jest.fn().mockResolvedValue({
            data: { session: { user: { id: 'user-123' } } },
          }),
        },
        from: jest.fn().mockImplementation((table) => {
          if (table === 'votes' && mockSupabase.from.mock.calls.length === 1) {
            // First call to check existing vote
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  eq: jest.fn().mockReturnValue({
                    maybeSingle: jest.fn().mockResolvedValue({
                      error: null,
                      data: null, // No existing vote
                    }),
                  }),
                }),
              }),
            };
          } else {
            // Second call to insert vote
            return {
              insert: jest.fn().mockResolvedValue({
                error: { message: 'Insert error' },
              }),
            };
          }
        }),
      };
      (createServerSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

      // Call the function
      const result = await submitVote(pollId, optionId);

      // Assertions
      expect(result).toEqual({
        success: false,
        error: 'Failed to submit vote',
      });
    });

    it('should successfully submit a vote', async () => {
      // Mock Supabase client with successful responses
      const mockSupabase = {
        auth: {
          getSession: jest.fn().mockResolvedValue({
            data: { session: { user: { id: 'user-123' } } },
          }),
        },
        from: jest.fn().mockImplementation((table) => {
          if (table === 'votes' && mockSupabase.from.mock.calls.length === 1) {
            // First call to check existing vote
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  eq: jest.fn().mockReturnValue({
                    maybeSingle: jest.fn().mockResolvedValue({
                      error: null,
                      data: null, // No existing vote
                    }),
                  }),
                }),
              }),
            };
          } else {
            // Second call to insert vote
            return {
              insert: jest.fn().mockResolvedValue({
                error: null,
              }),
            };
          }
        }),
      };
      (createServerSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

      // Call the function
      const result = await submitVote(pollId, optionId);

      // Assertions
      expect(result).toEqual({ success: true });
      expect(revalidatePath).toHaveBeenCalledWith(`/polls/${pollId}`);
      expect(revalidatePath).toHaveBeenCalledWith('/polls');
    });
  });
});