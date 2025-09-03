import { createPoll } from '../create-poll';
import { getPolls, getPollById } from '../get-polls';
import { updatePoll, deletePoll } from '../poll-actions';
import { submitVote } from '../vote-actions';
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

describe('Integration Tests', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console.error to prevent it from appearing in test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterEach(() => {
    // Restore console.error
    jest.restoreAllMocks();
  });

  describe('Poll Lifecycle', () => {
    // Test data
    const userId = 'user-123';
    const pollId = 'poll-123';
    const pollTitle = 'Test Poll';
    const pollDescription = 'Test Description';
    const pollOptions = [{ text: 'Option 1' }, { text: 'Option 2' }];
    const optionId = 'option-123';

    it('should handle the complete poll lifecycle', async () => {
      // Mock date for consistent testing
      const mockDate = '2023-01-01T00:00:00.000Z';
      const originalDate = global.Date;
      global.Date = class extends originalDate {
        constructor() {
          super();
        }
        toISOString() {
          return mockDate;
        }
      } as any;

      // Mock getCurrentUser
      (getCurrentUser as jest.Mock).mockResolvedValue({ user: { id: userId }, error: null });

      // Setup mock Supabase client
      const mockSupabase = {
        from: jest.fn().mockImplementation((table) => {
          // Create Poll
          if (table === 'polls') {
            return {
              insert: jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    error: null,
                    data: { id: pollId, title: pollTitle, description: pollDescription },
                  }),
                }),
              }),
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    error: null,
                    data: { 
                      id: pollId, 
                      title: pollTitle, 
                      description: pollDescription, 
                      created_by: userId, 
                      created_at: '2023-01-01T00:00:00.000Z' 
                    },
                  }),
                }),
                order: jest.fn().mockReturnValue({
                  limit: jest.fn().mockResolvedValue({
                    data: [{ id: pollId, title: pollTitle, description: pollDescription, created_by: userId }],
                    error: null,
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
            };
          }
          // Poll Options
          else if (table === 'poll_options') {
            return {
              insert: jest.fn().mockResolvedValue({
                error: null,
              }),
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({
                  data: [
                    { id: optionId, option_text: 'Option 1', poll_id: pollId },
                    { id: 'option-456', option_text: 'Option 2', poll_id: pollId },
                  ],
                  error: null,
                }),
              }),
              delete: jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({
                  error: null,
                }),
              }),
            };
          }
          // Votes
          else if (table === 'votes') {
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
                in: jest.fn().mockResolvedValue({
                  data: [{ poll_option_id: optionId }],
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

      // 1. Create a poll
      const createResult = await createPoll({
        title: pollTitle,
        description: pollDescription,
        options: pollOptions,
      });

      expect(createResult).toEqual({
        success: true,
        pollId,
      });
      expect(revalidatePath).toHaveBeenCalledWith('/polls');

      // Reset revalidatePath mock
      jest.clearAllMocks();

      // 2. Get polls list
      const getResult = await getPolls();

      expect(getResult.polls).toBeDefined();
      expect(Array.isArray(getResult.polls)).toBe(true);
      expect(getResult.error).toBeNull();

      // 3. Get poll by ID
      const getPollResult = await getPollById(pollId);

      expect(getPollResult.poll).not.toBeNull();
      expect(getPollResult.poll?.id).toBe(pollId);
      expect(getPollResult.error).toBeNull();

      // 4. Update the poll
      const updateResult = await updatePoll(pollId, {
        title: 'Updated Title',
        description: 'Updated Description',
        options: [{ text: 'New Option 1' }, { text: 'New Option 2' }],
      });

      expect(updateResult).toEqual({ success: true });
      expect(revalidatePath).toHaveBeenCalledTimes(3); // Called for '/', '/polls', and `/polls/${pollId}`

      // Reset revalidatePath mock
      jest.clearAllMocks();

      // 5. Submit a vote
      const voteResult = await submitVote(pollId, optionId);

      expect(voteResult).toEqual({ success: true });
      expect(revalidatePath).toHaveBeenCalledWith(`/polls/${pollId}`);
      expect(revalidatePath).toHaveBeenCalledWith('/polls');

      // Reset revalidatePath mock
      jest.clearAllMocks();

      // 6. Delete the poll
      const deleteResult = await deletePoll(pollId);

      expect(deleteResult).toEqual({ success: true });
      expect(revalidatePath).toHaveBeenCalledTimes(2); // Called for '/' and '/polls'

      // Reset Date
      global.Date = originalDate;
    });
  });
});