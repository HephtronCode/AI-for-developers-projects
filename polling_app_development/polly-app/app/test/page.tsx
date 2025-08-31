import { testDatabase } from '../../lib/actions/test-db';
import { checkEnvironment } from '../../lib/actions/check-env';

export default async function TestPage() {
  const dbResult = await testDatabase();
  const envResult = await checkEnvironment();
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">System Test</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Environment Variables</h2>
          <p><strong>Supabase URL:</strong> {envResult.supabaseUrl}</p>
          <p><strong>Supabase Anon Key:</strong> {envResult.supabaseAnonKey}</p>
          <p><strong>Supabase Service Key:</strong> {envResult.supabaseServiceKey}</p>
          <p><strong>All Environment Variables Set:</strong> {envResult.allSet ? 'Yes' : 'No'}</p>
        </div>
        
        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Database Connection</h2>
          <p><strong>Status:</strong> {dbResult.success ? 'Success' : 'Failed'}</p>
          <p><strong>Message:</strong> {dbResult.message || dbResult.error}</p>
          {dbResult.success && (
            <>
              <p><strong>Polls in database:</strong> {dbResult.pollsCount}</p>
              <p><strong>Poll options in database:</strong> {dbResult.optionsCount}</p>
              <p><strong>Votes in database:</strong> {dbResult.votesCount}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
