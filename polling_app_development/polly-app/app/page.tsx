import { getPolls } from '../lib/actions/get-polls';
import { getCurrentUser } from '../lib/actions/auth';
import DashboardContent from '../components/dashboard-content';

export default async function Home() {
  const { polls, error } = await getPolls();
  const { user } = await getCurrentUser();

  return (
    <div className="container mx-auto px-4 py-6 sm:py-10 md:py-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full mb-4 sm:mb-6 backdrop-blur-sm border border-glass-border">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 gradient-text">
            Welcome to Polly
          </h1>
          <p className="text-lg sm:text-xl text-foreground/70 max-w-2xl mx-auto">
            Create polls, share with friends, and gather opinions easily.
          </p>
        </div>

        <DashboardContent polls={polls} currentUser={user} error={error} />
      </div>
    </div>
  );
}
