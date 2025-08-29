'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { useAuth } from '../../../contexts/auth-context';

type Option = {
  id: string;
  text: string;
  votes: number;
};

type Poll = {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  createdAt: string;
  options: Option[];
  totalVotes: number;
};

export default function PollPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/auth/sign-in');
    }
  }, [isAuthLoading, user, router]);

  useEffect(() => {
    // This is a placeholder for actual API call
    const fetchPoll = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockPoll: Poll = {
          id: params.id,
          title: params.id === '1' ? 'Favorite Programming Language' : 'Sample Poll',
          description: 'Please select your favorite option',
          createdBy: 'John Doe',
          createdAt: '2023-06-15',
          options: [
            { id: '1', text: 'JavaScript', votes: 15 },
            { id: '2', text: 'Python', votes: 12 },
            { id: '3', text: 'TypeScript', votes: 8 },
            { id: '4', text: 'Java', votes: 7 },
          ],
          totalVotes: 42,
        };
        
        setPoll(mockPoll);
      } catch (error) {
        console.error('Failed to fetch poll:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPoll();
  }, [params.id]);

  const handleVote = async () => {
    if (!selectedOption || hasVoted || !poll) return;
    
    setIsSubmitting(true);
    
    try {
      // This is a placeholder for actual API call
      // In a real app, you would make an API call to submit the vote
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state to reflect the vote
      setPoll(prevPoll => {
        if (!prevPoll) return null;
        
        return {
          ...prevPoll,
          options: prevPoll.options.map(option => {
            if (option.id === selectedOption) {
              return { ...option, votes: option.votes + 1 };
            }
            return option;
          }),
          totalVotes: prevPoll.totalVotes + 1,
        };
      });
      
      setHasVoted(true);
    } catch (error) {
      console.error('Failed to submit vote:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading || isLoading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Loading poll...</h1>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!poll) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Poll not found</h1>
        <Link href="/polls">
          <Button>Back to Polls</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <Link href="/polls" className="mb-4 inline-block">
        <Button variant="outline">← Back to Polls</Button>
      </Link>
      
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-2xl">{poll.title}</CardTitle>
          <CardDescription>Created by {poll.createdBy} on {poll.createdAt}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6">{poll.description}</p>
          
          <div className="space-y-4">
            {poll.options.map((option) => {
              const percentage = poll.totalVotes > 0 
                ? Math.round((option.votes / poll.totalVotes) * 100) 
                : 0;
              
              return (
                <div key={option.id} className="border rounded-md p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id={option.id}
                        name="poll-option"
                        value={option.id}
                        checked={selectedOption === option.id}
                        onChange={() => setSelectedOption(option.id)}
                        disabled={hasVoted}
                        className="mr-3"
                      />
                      <label htmlFor={option.id} className="text-md">
                        {option.text}
                      </label>
                    </div>
                    <span className="text-sm font-medium">
                      {hasVoted ? `${percentage}% (${option.votes} votes)` : ''}
                    </span>
                  </div>
                  
                  {hasVoted && (
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
        <CardFooter>
          {!hasVoted ? (
            <Button 
              onClick={handleVote} 
              disabled={!selectedOption || isSubmitting}
              className="w-full"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Vote'}
            </Button>
          ) : (
            <div className="w-full text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Thank you for voting! Total votes: {poll.totalVotes}
              </p>
              <Link href="/polls">
                <Button variant="outline">View Other Polls</Button>
              </Link>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}