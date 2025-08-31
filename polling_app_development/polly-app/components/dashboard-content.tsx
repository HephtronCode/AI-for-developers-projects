'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { useAuth } from '../contexts/auth-context';
import { toast } from './ui/use-toast';
import { deletePoll } from '../lib/actions/poll-actions';
import { Poll } from '../lib/actions/get-polls';
import { User } from '@supabase/supabase-js';

interface DashboardContentProps {
  polls: Poll[];
  currentUser: User | null;
  error: string | null;
}

export default function DashboardContent({ polls, currentUser, error }: DashboardContentProps) {
  const { session } = useAuth();
  const user = session?.user || currentUser;
  const [deletingPolls, setDeletingPolls] = useState<Set<string>>(new Set());

  const handleDeletePoll = async (pollId: string) => {
    if (!confirm('Are you sure you want to delete this poll? This action cannot be undone.')) {
      return;
    }

    setDeletingPolls(prev => new Set(prev).add(pollId));

    try {
      const result = await deletePoll(pollId);
      
      if (result.success) {
        toast({
          title: "🗑️ Poll Deleted",
          description: "Your poll has been successfully deleted.",
          duration: 3000
        });
        // Refresh the page to update the polls list
        window.location.reload();
      } else {
        throw new Error(result.error || "Failed to delete poll");
      }
    } catch (error) {
      console.error('Failed to delete poll:', error);
      toast({
        title: "❌ Error Deleting Poll",
        description: error instanceof Error ? error.message : "Failed to delete poll. Please try again.",
        variant: "destructive",
        duration: 5000
      });
    } finally {
      setDeletingPolls(prev => {
        const newSet = new Set(prev);
        newSet.delete(pollId);
        return newSet;
      });
    }
  };

  const isPollOwner = (poll: Poll) => {
    return user && poll.created_by === user.id;
  };

  if (error) {
    return (
      <div className="text-center py-10">
        <div className="text-red-500 mb-4">
          <h3 className="text-lg font-semibold">Error Loading Polls</h3>
          <p>{error}</p>
        </div>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {user ? (
          <>
            <Link href="/polls">
              <Button size="lg">View All Polls</Button>
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

      {/* Polls Display */}
      {user && (
        <div>
          <h2 className="text-2xl font-bold mb-6">
            {polls.length > 0 ? 'Recent Polls' : 'No Polls Yet'}
          </h2>
          
          {polls.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground mb-4">
                No polls found. Create your first poll to get started!
              </p>
              <Link href="/polls/create">
                <Button>Create Your First Poll</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {polls.map((poll) => (
                <Card key={poll.id} className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="line-clamp-2">{poll.title}</CardTitle>
                        <CardDescription>
                          Created on {new Date(poll.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </CardDescription>
                      </div>
                      {isPollOwner(poll) && (
                        <div className="flex gap-1 ml-2">
                          <Link href={`/polls/${poll.id}/edit`}>
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                              ✏️
                            </Button>
                          </Link>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            onClick={() => handleDeletePoll(poll.id)}
                            disabled={deletingPolls.has(poll.id)}
                          >
                            {deletingPolls.has(poll.id) ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                            ) : (
                              '🗑️'
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {poll.description || 'No description'}
                    </p>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between">
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>{poll.votes_count} votes</span>
                      <span>{poll.options_count} options</span>
                    </div>
                    <Link href={`/polls/${poll.id}`}>
                      <Button size="sm" variant="outline">
                        View Poll
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Features Section for non-authenticated users */}
      {!user && (
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
      )}
    </div>
  );
}
