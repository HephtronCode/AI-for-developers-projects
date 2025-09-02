import { createPoll } from '../create-poll';
import { createServerSupabaseClient } from '../../supabase-server';
import { revalidatePath } from 'next/cache';

// Mock dependencies
jest.mock('../../supabase-server', () => ({
  createServerSupabaseClient: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
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

  it('should throw error if user is not logged in', async () => {
    // Mock Supabase client with no session
    const mockSupabase = {
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      },
    };
    (createServerSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

    // Call the function and expect it to throw
    await expect(createPoll(mockPollData)).rejects.toThrow(
      'You must be logged in to create a poll'
    );
  });

  it('should return error if poll creation fails', async () => {
    // Mock Supabase client with session but poll creation fails
    const mockSupabase = {
      auth: {
        getSession: jest.fn().mockResolvedValue({
          data: { session: { user: { id: 'user-123' } } },
        }),
      },
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
    // Mock Supabase client with session, poll creation succeeds but options fail
    const mockSupabase = {
      auth: {
        getSession: jest.fn().mockResolvedValue({
          data: { session: { user: { id: 'user-123' } } },
        }),
      },
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

    // Mock Supabase client with successful poll and options creation
    const mockSupabase = {
      auth: {
        getSession: jest.fn().mockResolvedValue({
          data: { session: { user: { id: 'user-123' } } },
        }),
      },
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