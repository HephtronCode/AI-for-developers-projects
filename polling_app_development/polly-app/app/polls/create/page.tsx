'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from '../../../components/ui/form';
import { useAuth } from '../../../contexts/auth-context';

type PollOption = {
  id: string;
  text: string;
};

export default function CreatePollPage() {
  const router = useRouter();
  const { session, isLoading } = useAuth();
  const user = session?.user;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState<PollOption[]>([
    { id: '1', text: '' },
    { id: '2', text: '' },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/sign-in');
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  const handleAddOption = () => {
    setOptions([...options, { id: `${options.length + 1}`, text: '' }]);
  };

  const handleRemoveOption = (id: string) => {
    if (options.length <= 2) return; // Minimum 2 options required
    setOptions(options.filter(option => option.id !== id));
  };

  const handleOptionChange = (id: string, value: string) => {
    setOptions(
      options.map(option => 
        option.id === id ? { ...option, text: value } : option
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!title.trim()) {
      alert('Please enter a poll title');
      return;
    }
    
    if (options.some(option => !option.text.trim())) {
      alert('Please fill in all poll options');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // This is a placeholder for actual API call
      // In a real app, you would make an API call to create the poll
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Creating poll:', { title, description, options });
      
      // Redirect to polls page after successful creation
      router.push('/polls');
    } catch (error) {
      console.error('Failed to create poll:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <Link href="/polls" className="mb-4 inline-block">
        <Button variant="outline">← Back to Polls</Button>
      </Link>
      
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Create New Poll</CardTitle>
          <CardDescription>
            Fill in the details below to create a new poll
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <FormItem>
              <FormLabel htmlFor="title">Poll Title</FormLabel>
              <FormControl>
                <Input
                  id="title"
                  placeholder="Enter your question here"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </FormControl>
            </FormItem>
            
            <FormItem>
              <FormLabel htmlFor="description">Description (Optional)</FormLabel>
              <FormControl>
                <Input
                  id="description"
                  placeholder="Add more context to your question"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </FormControl>
            </FormItem>
            
            <div className="space-y-4">
              <FormLabel>Poll Options</FormLabel>
              {options.map((option, index) => (
                <div key={option.id} className="flex items-center gap-2">
                  <Input
                    placeholder={`Option ${index + 1}`}
                    value={option.text}
                    onChange={(e) => handleOptionChange(option.id, e.target.value)}
                    required
                  />
                  {options.length > 2 && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon"
                      onClick={() => handleRemoveOption(option.id)}
                    >
                      ×
                    </Button>
                  )}
                </div>
              ))}
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleAddOption}
                className="w-full mt-2"
              >
                + Add Option
              </Button>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Poll...' : 'Create Poll'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}