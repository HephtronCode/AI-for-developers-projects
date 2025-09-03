import { createPoll } from '../create-poll';
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

describe('Create Poll Action', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockPollData = {
    title: 'Test Poll',
    description: 'Test poll description',
    options: [{ text: 'Option 1' }, { text: 'Option 2' }],
  };

  it('should return error if user is not logged in', async () => {
    // Mock getCurrentUser with no user
    (getCurrentUser as jest.Mock).mockResolvedValue({ user: null, error: 'Not authenticated' });

    // Call the function
    const result = await createPoll(mockPollData);

    // Assertions
    expect(result).toEqual({
      success: false,
      error: 'You must be logged in to create a poll',
    });
  });

  it('should return error if poll creation fails', async () => {
    // Mock getCurrentUser with a user
    (getCurrentUser as jest.Mock).mockResolvedValue({ user: { id: 'user-123' }, error: null });
    
    // Mock Supabase client with poll creation fails
    const mockSupabase = {
      from: jest.fn().mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              error: { message: 'Database error' },
              data: null,
            }),
          }),
        }),
      }),
    };
    (createServerSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

    // Call the function
    const result = await createPoll(mockPollData);

    // Assertions
    expect(result).toEqual({
      success: false,
      error: expect.stringContaining('Failed to create poll'),
    });
  });

  it('should return error if options creation fails', async () => {
    // Mock getCurrentUser with a user
    (getCurrentUser as jest.Mock).mockResolvedValue({ user: { id: 'user-123' }, error: null });
    
    // Mock Supabase client with poll creation succeeds but options fail
    const mockSupabase = {
      from: jest.fn().mockImplementation((table) => {
        if (table === 'polls') {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  error: null,
                  data: { id: 'poll-123' },
                }),
              }),
            }),
          };
        } else if (table === 'poll_options') {
          return {
            insert: jest.fn().mockResolvedValue({
              error: { message: 'Options error' },
            }),
          };
        }
        return {};
      }),
    };
    (createServerSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

    // Call the function
    const result = await createPoll(mockPollData);

    // Assertions
    expect(result).toEqual({
      success: false,
      error: expect.stringContaining('Failed to create poll options'),
    });
  });

  it('should successfully create a poll with options', async () => {
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

    // Mock getCurrentUser with a user
    (getCurrentUser as jest.Mock).mockResolvedValue({ user: { id: 'user-123' }, error: null });
    
    // Mock Supabase client with successful poll and options creation
    const mockSupabase = {
      from: jest.fn().mockImplementation((table) => {
        if (table === 'polls') {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  error: null,
                  data: { id: 'poll-123' },
                }),
              }),
            }),
          };
        } else if (table === 'poll_options') {
          return {
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
    const result = await createPoll(mockPollData);

    // Assertions
    expect(result).toEqual({
      success: true,
      pollId: 'poll-123',
    });
    expect(revalidatePath).toHaveBeenCalledWith('/polls');

    // Verify the poll was created with the correct data
    const fromCall = mockSupabase.from.mock.calls[0][0];
    expect(fromCall).toBe('polls');

    // Reset Date
    global.Date = originalDate;
  });
});