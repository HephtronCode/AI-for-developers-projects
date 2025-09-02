import { getCurrentUser } from '../auth';
import { createServerSupabaseClient } from '../../supabase-server';

// Mock dependencies
jest.mock('../../supabase-server', () => ({
  createServerSupabaseClient: jest.fn(),
}));

describe('Auth Actions', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCurrentUser', () => {
    it('should return user when session exists', async () => {
      // Mock Supabase client with session
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const mockSupabase = {
        auth: {
          getSession: jest.fn().mockResolvedValue({
            data: { session: { user: mockUser } },
            error: null,
          }),
        },
      };
      (createServerSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

      // Call the function
      const result = await getCurrentUser();

      // Assertions
      expect(result).toEqual({ user: mockUser, error: null });
      expect(mockSupabase.auth.getSession).toHaveBeenCalledTimes(1);
    });

    it('should return null user when no session exists', async () => {
      // Mock Supabase client with no session
      const mockSupabase = {
        auth: {
          getSession: jest.fn().mockResolvedValue({
            data: { session: null },
            error: null,
          }),
        },
      };
      (createServerSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

      // Call the function
      const result = await getCurrentUser();

      // Assertions
      expect(result).toEqual({ user: null, error: null });
      expect(mockSupabase.auth.getSession).toHaveBeenCalledTimes(1);
    });

    it('should return error when getSession fails', async () => {
      // Mock Supabase client with error
      const mockSupabase = {
        auth: {
          getSession: jest.fn().mockResolvedValue({
            data: { session: null },
            error: { message: 'Authentication error' },
          }),
        },
      };
      (createServerSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

      // Call the function
      const result = await getCurrentUser();

      // Assertions
      expect(result).toEqual({ user: null, error: 'Authentication error' });
      expect(mockSupabase.auth.getSession).toHaveBeenCalledTimes(1);
    });

    it('should handle unexpected errors', async () => {
      // Mock Supabase client that throws an error
      const mockSupabase = {
        auth: {
          getSession: jest.fn().mockRejectedValue(new Error('Unexpected error')),
        },
      };
      (createServerSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

      // Call the function
      const result = await getCurrentUser();

      // Assertions
      expect(result).toEqual({ user: null, error: 'Unexpected error' });
      expect(mockSupabase.auth.getSession).toHaveBeenCalledTimes(1);
    });
  });
});