import { testDatabase } from '../test-db';
import { createServerSupabaseClient } from '../../supabase-server';

// Mock dependencies
jest.mock('../../supabase-server', () => ({
  createServerSupabaseClient: jest.fn(),
}));

describe('Test Database Action', () => {
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

  it('should return success when all database tables are accessible', async () => {
    // Mock Supabase client with successful responses
    const mockSupabase = {
      from: jest.fn().mockImplementation((table) => {
        return {
          select: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({
              data: table === 'polls' ? [{ id: 'poll-1' }, { id: 'poll-2' }] :
                     table === 'poll_options' ? [{ id: 'option-1' }, { id: 'option-2' }, { id: 'option-3' }] :
                     [{ id: 'vote-1' }, { id: 'vote-2' }, { id: 'vote-3' }, { id: 'vote-4' }],
              error: null,
            }),
          }),
        };
      }),
    };
    (createServerSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

    // Call the function
    const result = await testDatabase();

    // Assertions
    expect(result).toEqual({
      success: true,
      message: 'All tables accessible',
      pollsCount: 2,
      optionsCount: 3,
      votesCount: 4,
    });
    expect(mockSupabase.from).toHaveBeenCalledWith('polls');
    expect(mockSupabase.from).toHaveBeenCalledWith('poll_options');
    expect(mockSupabase.from).toHaveBeenCalledWith('votes');
  });

  it('should return error when polls table is not accessible', async () => {
    // Mock Supabase client with polls table error
    const mockSupabase = {
      from: jest.fn().mockImplementation((table) => {
        if (table === 'polls') {
          return {
            select: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Polls table not found' },
              }),
            }),
          };
        }
        return {
          select: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        };
      }),
    };
    (createServerSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

    // Call the function
    const result = await testDatabase();

    // Assertions
    expect(result).toEqual({
      success: false,
      error: 'Polls table error: Polls table not found',
      pollsCount: 0,
    });
  });

  it('should return error when poll_options table is not accessible', async () => {
    // Mock Supabase client with poll_options table error
    const mockSupabase = {
      from: jest.fn().mockImplementation((table) => {
        if (table === 'polls') {
          return {
            select: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({
                data: [{ id: 'poll-1' }, { id: 'poll-2' }],
                error: null,
              }),
            }),
          };
        } else if (table === 'poll_options') {
          return {
            select: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Poll options table not found' },
              }),
            }),
          };
        }
        return {
          select: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        };
      }),
    };
    (createServerSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

    // Call the function
    const result = await testDatabase();

    // Assertions
    expect(result).toEqual({
      success: false,
      error: 'Poll options table error: Poll options table not found',
      pollsCount: 2,
    });
  });

  it('should return error when votes table is not accessible', async () => {
    // Mock Supabase client with votes table error
    const mockSupabase = {
      from: jest.fn().mockImplementation((table) => {
        if (table === 'polls') {
          return {
            select: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({
                data: [{ id: 'poll-1' }, { id: 'poll-2' }],
                error: null,
              }),
            }),
          };
        } else if (table === 'poll_options') {
          return {
            select: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({
                data: [{ id: 'option-1' }, { id: 'option-2' }],
                error: null,
              }),
            }),
          };
        } else if (table === 'votes') {
          return {
            select: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Votes table not found' },
              }),
            }),
          };
        }
        return {};
      }),
    };
    (createServerSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

    // Call the function
    const result = await testDatabase();

    // Assertions
    expect(result).toEqual({
      success: false,
      error: 'Votes table error: Votes table not found',
      pollsCount: 2,
    });
  });

  it('should handle unexpected errors', async () => {
    // Mock Supabase client that throws an error
    const mockError = new Error('Unexpected database error');
    const mockSupabase = {
      from: jest.fn().mockImplementation(() => {
        throw mockError;
      }),
    };
    (createServerSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);
    
    // Console.error is already mocked in beforeEach

    // Call the function
    const result = await testDatabase();

    // Assertions
    expect(result).toEqual({
      success: false,
      error: 'Unexpected database error',
    });
    
    // Console.error will be restored in afterEach
  });
});