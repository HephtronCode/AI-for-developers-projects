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
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Polls</h1>
        <Link href="/polls/create">
          <Button>Create New Poll</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {polls.length === 0 ? (
          <div className="col-span-3 text-center py-10">
            <p className="text-muted-foreground">No polls found. Create your first poll!</p>
          </div>
        ) : (
          polls.map((poll) => (
            <PollCard key={poll.id} poll={poll} currentUser={user} />
          ))
        )}
      </div>

      {polls.length === 0 && (
        <div className="text-center p-8">
          <p className="text-lg text-muted-foreground">No polls found. Create your first poll!</p>
          <Link href="/polls/create" className="mt-4 inline-block">
            <Button>Create New Poll</Button>
          </Link>
        </div>
      )}
    </div>
  );
}