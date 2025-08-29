'use client';

import { useAuth } from '../contexts/auth-context';
import Link from 'next/link';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
          Welcome to Polly
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Create polls, share with friends, and gather opinions easily.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          {user ? (
            <>
              <Link href="/polls">
                <Button size="lg">View Polls</Button>
              </Link>
              <Link href="/polls/create">
                <Button size="lg" variant="outline">Create New Poll</Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth/sign-up">
                <Button size="lg">Get Started</Button>
              </Link>
              <Link href="/auth/sign-in">
                <Button size="lg" variant="outline">Sign In</Button>
              </Link>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <Card>
            <CardHeader>
              <CardTitle>Create</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Create custom polls with multiple options in seconds.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Share</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Share your polls with friends, colleagues, or the public.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Analyze</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Get real-time results and insights from your polls.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
