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
    <div className="glass-card group cursor-pointer hover:scale-[1.02] hover:shadow-lg transition-all duration-300 overflow-hidden">
      <Link href={`/polls/${poll.id}`}>
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold line-clamp-2 mb-2 group-hover:gradient-text transition-all duration-300">
                {poll.title}
              </h3>
              <div className="flex items-center text-sm text-foreground/70">
                <svg className="w-4 h-4 mr-1 text-primary/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {new Date(poll.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
            </div>
            {isPollOwner && (
              <div className="flex gap-2 ml-4 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all duration-300">
                <Link href={`/polls/${poll.id}/edit`} onClick={(e) => e.stopPropagation()}>
                  <button className="p-2 text-foreground/60 hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-300">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </Link>
                <button 
                  className="p-2 text-foreground/60 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all duration-300"
                  onClick={handleDeletePoll}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-destructive"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>
              </div>
            )}
          </div>
          
          <p className="text-foreground/80 line-clamp-3 mb-4">
            {poll.description || 'No description provided'}
          </p>
          
          <div className="flex items-center justify-between pt-4 border-t border-glass-border">
            <div className="flex items-center space-x-4 text-sm text-foreground/70">
              <div className="flex items-center bg-primary/5 px-2 py-1 rounded-full">
                <svg className="w-4 h-4 mr-1 text-primary/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">{poll.votes_count}</span> votes
              </div>
              <div className="flex items-center bg-accent/10 px-2 py-1 rounded-full">
                <svg className="w-4 h-4 mr-1 text-accent/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span className="font-medium">{poll.options_count}</span> options
              </div>
            </div>
            <div className="flex items-center text-primary font-medium text-sm group-hover:text-primary/90 transition-all duration-300">
              <span className="relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-300 group-hover:after:w-full">View Poll</span>
              <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
