import { getPolls, getPollById } from '../get-polls';
import { createServerSupabaseClient } from '../../supabase-server';
import { getCurrentUser } from '../auth';

// Mock dependencies
jest.mock('../../supabase-server', () => ({
  createServerSupabaseClient: jest.fn(),
}));

jest.mock('../auth', () => ({
  getCurrentUser: jest.fn(),
}));

describe('Get Polls Actions', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPolls', () => {
    it('should return empty array if no polls are found', async () => {
      // Mock getCurrentUser
      (getCurrentUser as jest.Mock).mockResolvedValue({ user: { id: 'user-123' }, error: null });
      
      // Mock Supabase client with no polls
      const mockSupabase = {
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          }),
        }),
      };
      (createServerSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

      // Call the function
      const result = await getPolls();

      // Assertions
      expect(result).toEqual({ polls: [], error: null });
    });

    it('should return error if polls fetch fails', async () => {
      // Mock getCurrentUser
      (getCurrentUser as jest.Mock).mockResolvedValue({ user: { id: 'user-123' }, error: null });
      
      // Mock Supabase client with error
      const mockSupabase = {
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' },
            }),
          }),
        }),
      };
      (createServerSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

      // Call the function
      const result = await getPolls();

      // Assertions
      expect(result).toEqual({ polls: [], error: 'Failed to fetch polls' });
    });

    it('should return polls with option and vote counts', async () => {
      // Mock getCurrentUser
      (getCurrentUser as jest.Mock).mockResolvedValue({ user: { id: 'user-123' }, error: null });
      
      // Mock poll data
      const mockPolls = [
        {
          id: 'poll-1',
          title: 'Poll 1',
          description: 'Description 1',
          created_at: '2023-01-01',
          created_by: 'user-123',
        },
        {
          id: 'poll-2',
          title: 'Poll 2',
          description: 'Description 2',
          created_at: '2023-01-02',
          created_by: 'user-123',
        },
      ];

      // Mock option counts
      const mockOptionCounts = [
        { poll_id: 'poll-1' },
        { poll_id: 'poll-1' },
        { poll_id: 'poll-2' },
      ];

      // Mock vote counts
      const mockVoteCounts = [
        { poll_id: 'poll-1' },
        { poll_id: 'poll-2' },
        { poll_id: 'poll-2' },
      ];

      // Mock Supabase client with successful responses
      const mockSupabase = {
        from: jest.fn().mockImplementation((table) => {
          if (table === 'polls') {
            return {
              select: jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue({
                  data: mockPolls,
                  error: null,
                }),
              }),
            };
          } else if (table === 'poll_options') {
            return {
              select: jest.fn().mockReturnValue({
                in: jest.fn().mockResolvedValue({
                  data: mockOptionCounts,
                  error: null,
                }),
              }),
            };
          } else if (table === 'votes') {
            return {
              select: jest.fn().mockReturnValue({
                in: jest.fn().mockResolvedValue({
                  data: mockVoteCounts,
                  error: null,
                }),
              }),
            };
          }
          return {};
        }),
      };
      (createServerSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

      // Call the function
      const result = await getPolls();

      // Assertions
      expect(result.polls).toHaveLength(2);
      expect(result.polls[0].options_count).toBe(2); // poll-1 has 2 options
      expect(result.polls[0].votes_count).toBe(1);   // poll-1 has 1 vote
      expect(result.polls[1].options_count).toBe(1); // poll-2 has 1 option
      expect(result.polls[1].votes_count).toBe(2);   // poll-2 has 2 votes
    });
  });

  describe('getPollById', () => {
    it('should return error if poll is not found', async () => {
      // Mock Supabase client with poll not found
      const mockSupabase = {
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Poll not found' },
              }),
            }),
          }),
        }),
      };
      (createServerSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

      // Call the function
      const result = await getPollById('non-existent-id');

      // Assertions
      expect(result).toEqual({
        poll: null,
        options: [],
        error: 'Failed to fetch poll',
      });
    });

    it('should return error if options fetch fails', async () => {
      // Mock Supabase client with poll found but options fetch fails
      const mockSupabase = {
        from: jest.fn().mockImplementation((table) => {
          if (table === 'polls') {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: { id: 'poll-123', title: 'Test Poll' },
                    error: null,
                  }),
                }),
              }),
            };
          } else if (table === 'poll_options') {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({
                  data: null,
                  error: { message: 'Options error' },
                }),
              }),
            };
          }
          return {};
        }),
      };
      (createServerSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

      // Call the function
      const result = await getPollById('poll-123');

      // Assertions
      expect(result).toEqual({
        poll: null,
        options: [],
        error: 'Failed to fetch poll options',
      });
    });

    it('should return poll with options and vote counts', async () => {
      // Mock poll data
      const mockPoll = {
        id: 'poll-123',
        title: 'Test Poll',
        description: 'Test Description',
        created_at: '2023-01-01',
        created_by: 'user-123',
        user_email: null,
        options: [
          { id: 'option-1', text: 'Option 1', poll_id: 'poll-123', votes: 2 },
          { id: 'option-2', text: 'Option 2', poll_id: 'poll-123', votes: 1 }
        ],
        total_votes: 3
      };

      // Mock options
      const mockOptions = [
        { id: 'option-1', option_text: 'Option 1', poll_id: 'poll-123' },
        { id: 'option-2', option_text: 'Option 2', poll_id: 'poll-123' },
      ];

      // Mock votes
      const mockVotes = [
        { poll_option_id: 'option-1' },
        { poll_option_id: 'option-1' },
        { poll_option_id: 'option-2' },
      ];

      // Mock Supabase client with successful responses
      const mockSupabase = {
        from: jest.fn().mockImplementation((table) => {
          if (table === 'polls') {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: mockPoll,
                    error: null,
                  }),
                }),
              }),
            };
          } else if (table === 'poll_options') {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({
                  data: mockOptions,
                  error: null,
                }),
              }),
            };
          } else if (table === 'votes') {
            return {
              select: jest.fn().mockReturnValue({
                in: jest.fn().mockResolvedValue({
                  data: mockVotes,
                  error: null,
                }),
              }),
            };
          }
          return {};
        }),
      };
      (createServerSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

      // Call the function
      const result = await getPollById('poll-123');

      // Assertions
      expect(result.poll).toEqual(mockPoll);
      expect(result.poll.options).toHaveLength(2);
      expect(result.poll.options[0].votes).toBe(2); // option-1 has 2 votes
      expect(result.poll.options[1].votes).toBe(1); // option-2 has 1 vote
      expect(result.error).toBeNull();
    });
  });
});