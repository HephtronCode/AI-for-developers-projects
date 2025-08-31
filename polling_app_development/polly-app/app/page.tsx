import { getPolls } from '../lib/actions/get-polls';
import { getCurrentUser } from '../lib/actions/auth';
import DashboardContent from '../components/dashboard-content';

export default async function Home() {
  const { polls, error } = await getPolls();
  const { user } = await getCurrentUser();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
            Welcome to Polly
          </h1>
          <p className="text-xl text-muted-foreground">
            Create polls, share with friends, and gather opinions easily.
          </p>
        </div>

        <DashboardContent polls={polls} currentUser={user} error={error} />
      </div>
    </div>
  );
}
