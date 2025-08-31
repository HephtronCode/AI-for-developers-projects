'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../../components/ui/card';
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from '../../../../components/ui/form';
import { useAuth } from '../../../../contexts/auth-context';
import { getPollById } from '../../../../lib/actions/get-polls';
import { updatePoll } from '../../../../lib/actions/poll-actions';
import { toast } from '../../../../components/ui/use-toast';
import { Textarea } from '../../../../components/ui/textarea';

type PollOption = {
  id: string;
  text: string;
};

export default function EditPollPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { session, isLoading } = useAuth();
  const user = session?.user;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState<PollOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/sign-in');
      return;
    }

    if (user) {
      loadPoll();
    }
  }, [isLoading, user, router, params.id]);

  const loadPoll = async () => {
    try {
      const { poll, error: pollError } = await getPollById(params.id);
      
      if (pollError || !poll) {
        setError(pollError || 'Poll not found');
        return;
      }

      // Check if user owns this poll
      if (poll.created_by !== user?.id) {
        setError('You can only edit your own polls');
        return;
      }

      setTitle(poll.title);
      setDescription(poll.description || '');
      setOptions(poll.options.map(opt => ({
        id: opt.id,
        text: opt.text
      })));
    } catch (error) {
      console.error('Error loading poll:', error);
      setError('Failed to load poll');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p className="text-red-500 mb-4">{error}</p>
          <Link href="/polls">
            <Button>Back to Polls</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleAddOption = () => {
    setOptions([...options, { id: `${Date.now()}`, text: '' }]);
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
      toast({
        title: "⚠️ Missing Title",
        description: "Please enter a title for your poll",
        variant: "destructive",
        duration: 3000
      });
      return;
    }
    
    if (options.some(option => !option.text.trim())) {
      toast({
        title: "⚠️ Incomplete Options",
        description: "Please fill in all poll options",
        variant: "destructive",
        duration: 3000
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Format options for the server action
      const formattedOptions = options.map(option => ({ text: option.text.trim() }));
      
      // Call the server action to update the poll
      const result = await updatePoll(params.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        options: formattedOptions
      });
      
      if (result.success) {
        toast({
          title: "✅ Poll Updated Successfully!",
          description: "Your poll has been updated and is now available for voting.",
          duration: 3000
        });
        
        // Small delay to ensure the toast is visible before redirecting
        setTimeout(() => {
          router.push(`/polls/${params.id}`);
        }, 1500);
      } else {
        throw new Error(result.error || "Failed to update poll");
      }
    } catch (error) {
      console.error('Failed to update poll:', error);
      toast({
        title: "❌ Error Updating Poll",
        description: error instanceof Error ? error.message : "Failed to update poll. Please try again.",
        variant: "destructive",
        duration: 5000
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <Link href={`/polls/${params.id}`} className="mb-4 inline-block">
        <Button variant="outline">← Back to Poll</Button>
      </Link>
      
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Edit Poll</CardTitle>
          <CardDescription>
            Update your poll details below
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
                <Textarea
                  id="description"
                  placeholder="Add more context to your question"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
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
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating Poll...
                </>
              ) : (
                'Update Poll'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
