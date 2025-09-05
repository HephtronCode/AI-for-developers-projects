import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { getPolls } from '../../lib/actions/get-polls';
import { getCurrentUser } from '../../lib/actions/auth';
import PollCard from '../../components/poll-card';

// This component is now a Server Component

export default async function PollsPage() {
  const { polls, error } = await getPolls();
  const { user } = await getCurrentUser();

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold gradient-text">
          <svg className="w-6 h-6 inline-block mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          All Polls
        </h1>
        <Link href="/polls/create" className="w-full sm:w-auto">
          <Button variant="gradient" className="w-full sm:w-auto py-2 px-4">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create New Poll
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {polls.length === 0 ? (
          <div className="col-span-1 sm:col-span-2 lg:col-span-3 glass-card p-8 sm:p-10 text-center rounded-xl">
            <svg className="w-16 h-16 mx-auto text-primary/50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-lg sm:text-xl text-foreground/70 mb-6">No polls found. Create your first poll!</p>
            <Link href="/polls/create" className="inline-block">
              <Button variant="gradient" size="lg" className="px-6 py-3">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create New Poll
              </Button>
            </Link>
          </div>
        ) : (
          polls.map((poll) => (
            <PollCard key={poll.id} poll={poll} currentUser={user} />
          ))
        )}
      </div>
    </div>
  );
}