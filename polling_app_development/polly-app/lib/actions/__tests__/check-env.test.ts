import { checkEnvironment } from '../check-env';

describe('Check Environment Action', () => {
  // Store original environment variables
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment variables before each test
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    // Restore original environment variables
    process.env = originalEnv;
  });

  it('should return all environment variables as set when they exist', async () => {
    // Set environment variables
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-key';

    // Call the function
    const result = await checkEnvironment();

    // Assertions
    expect(result).toEqual({
      supabaseUrl: 'Set',
      supabaseAnonKey: 'Set',
      supabaseServiceKey: 'Set',
      allSet: true
    });
  });

  it('should return missing for environment variables that do not exist', async () => {
    // Clear environment variables
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Call the function
    const result = await checkEnvironment();

    // Assertions
    expect(result).toEqual({
      supabaseUrl: 'Missing',
      supabaseAnonKey: 'Missing',
      supabaseServiceKey: 'Missing',
      allSet: false
    });
  });

  it('should return partial environment variables as set when only some exist', async () => {
    // Set only some environment variables
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Call the function
    const result = await checkEnvironment();

    // Assertions
    expect(result).toEqual({
      supabaseUrl: 'Set',
      supabaseAnonKey: 'Missing',
      supabaseServiceKey: 'Missing',
      allSet: false
    });
  });
});