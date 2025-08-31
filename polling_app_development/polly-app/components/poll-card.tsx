'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { toast } from './ui/use-toast';
import { deletePoll } from '../lib/actions/poll-actions';
import { Poll } from '../lib/actions/get-polls';
import { User } from '@supabase/supabase-js';

interface PollCardProps {
  poll: Poll;
  currentUser: User | null;
}

export default function PollCard({ poll, currentUser }: PollCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeletePoll = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this poll? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);

    try {
      const result = await deletePoll(poll.id);
      
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
      setIsDeleting(false);
    }
  };

  const isPollOwner = currentUser && poll.created_by === currentUser.id;

  return (
    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
      <Link href={`/polls/${poll.id}`}>
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
            {isPollOwner && (
              <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link href={`/polls/${poll.id}/edit`} onClick={(e) => e.stopPropagation()}>
                  <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                    ✏️
                  </Button>
                </Link>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                  onClick={handleDeletePoll}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
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
          <Button size="sm" variant="outline">
            View Poll
          </Button>
        </CardFooter>
      </Link>
    </Card>
  );
}
