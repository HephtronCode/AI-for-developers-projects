'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

type Poll = {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  createdAt: string;
  votesCount: number;
};

export default function PollsPage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This is a placeholder for actual API call
    const fetchPolls = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockPolls: Poll[] = [
          {
            id: '1',
            title: 'Favorite Programming Language',
            description: 'What is your favorite programming language?',
            createdBy: 'John Doe',
            createdAt: '2023-06-15',
            votesCount: 42,
          },
          {
            id: '2',
            title: 'Best Frontend Framework',
            description: 'Which frontend framework do you prefer?',
            createdBy: 'Jane Smith',
            createdAt: '2023-06-10',
            votesCount: 38,
          },
          {
            id: '3',
            title: 'Database Preferences',
            description: 'Which database system do you use most often?',
            createdBy: 'Alex Johnson',
            createdAt: '2023-06-05',
            votesCount: 27,
          },
        ];
        
        setPolls(mockPolls);
      } catch (error) {
        console.error('Failed to fetch polls:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPolls();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Loading polls...</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Polls</h1>
        <Link href="/polls/create">
          <Button>Create New Poll</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {polls.map((poll) => (
          <Link href={`/polls/${poll.id}`} key={poll.id}>
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle>{poll.title}</CardTitle>
                <CardDescription>Created by {poll.createdBy} on {poll.createdAt}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{poll.description}</p>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">{poll.votesCount} votes</p>
              </CardFooter>
            </Card>
          </Link>
        ))}
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