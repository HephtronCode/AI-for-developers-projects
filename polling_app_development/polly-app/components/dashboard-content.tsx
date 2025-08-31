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
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-gray-900">
            {user ? 'Your Polling Dashboard' : 'Welcome to Polly'}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {user 
              ? 'Create, manage, and analyze your polls with ease. Get insights from your audience in real-time.'
              : 'Create engaging polls, gather opinions, and make data-driven decisions with our intuitive polling platform.'
            }
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          {user ? (
            <>
              <Link href="/polls/create">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create New Poll
                </Button>
              </Link>
              <Link href="/polls">
                <Button size="lg" variant="outline" className="border-2 border-gray-300 hover:border-blue-500 hover:text-blue-600 px-8 py-3 rounded-lg transition-all duration-200">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  View All Polls
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth/sign-up">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/auth/sign-in">
                <Button size="lg" variant="outline" className="border-2 border-gray-300 hover:border-blue-500 hover:text-blue-600 px-8 py-3 rounded-lg transition-all duration-200">
                  Sign In
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Polls Display */}
      {user && (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {polls.length > 0 ? 'Your Recent Polls' : 'No Polls Yet'}
              </h2>
              <p className="text-gray-600 mt-1">
                {polls.length > 0 
                  ? `You have ${polls.length} poll${polls.length === 1 ? '' : 's'}`
                  : 'Start by creating your first poll'
                }
              </p>
            </div>
            {polls.length > 0 && (
              <Link href="/polls">
                <Button variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                  View All
                </Button>
              </Link>
            )}
          </div>
          
          {polls.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-300">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No polls yet</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Create your first poll to start gathering insights from your audience
              </p>
              <Link href="/polls/create">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create Your First Poll
                </Button>
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
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Choose Polly?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our platform makes it easy to create engaging polls and gather valuable insights from your audience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Easy Creation</h3>
              <p className="text-gray-600">Create custom polls with multiple options in seconds. No technical skills required.</p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Simple Sharing</h3>
              <p className="text-gray-600">Share your polls with friends, colleagues, or the public with just one click.</p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Real-time Analytics</h3>
              <p className="text-gray-600">Get real-time results and insights from your polls with beautiful visualizations.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
