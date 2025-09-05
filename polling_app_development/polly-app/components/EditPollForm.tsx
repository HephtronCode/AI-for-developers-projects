'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import { Textarea } from './ui/textarea';
import { toast } from './ui/use-toast';
import { updatePoll } from '../lib/actions/poll-actions';
// Using types from lib/types.ts
import { Poll, PollOption, UpdatePollData } from '../lib/types';

interface EditPollFormProps {
  poll: Poll;
  pollId: string;
  onSuccess?: (pollId: string) => void;
  onCancel?: () => void;
}

export function EditPollForm({ poll, pollId, onSuccess, onCancel }: EditPollFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(poll.title);
  const [description, setDescription] = useState(poll.description || '');
  const [options, setOptions] = useState<PollOption[]>(
    poll.options.map((opt) => ({
      id: opt.id,
      text: opt.text,
    }))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddOption = () => {
    setOptions([...options, { id: `${Date.now()}`, text: '' }]);
  };

  const handleRemoveOption = (id: string) => {
    if (options.length <= 2) return; // Minimum 2 options required
    setOptions(options.filter((option) => option.id !== id));
  };

  const handleOptionChange = (id: string, value: string) => {
    setOptions(
      options.map((option) =>
        option.id === id ? { ...option, text: value } : option
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!title.trim()) {
      toast({
        title: '⚠️ Missing Title',
        description: 'Please enter a title for your poll',
        variant: 'destructive',
        duration: 3000,
      });
      return;
    }

    if (options.some((option) => !option.text.trim())) {
      toast({
        title: '⚠️ Incomplete Options',
        description: 'Please fill in all poll options',
        variant: 'destructive',
        duration: 3000,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Format options for the server action
      const formattedOptions = options.map((option) => ({
        text: option.text.trim(),
      }));

      // Create the update data using the UpdatePollData type
      const updateData: UpdatePollData = {
        title: title.trim(),
        description: description.trim() || undefined,
        options: formattedOptions,
      };

      // Call the server action to update the poll
      const result = await updatePoll(pollId, updateData);

      if (result.success) {
        toast({
          title: '✅ Poll Updated Successfully!',
          description:
            'Your poll has been updated and is now available for voting.',
          duration: 3000,
        });

        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess(pollId);
        } else {
          // Small delay to ensure the toast is visible before redirecting
          setTimeout(() => {
            router.push(`/polls/${pollId}`);
          }, 1500);
        }
      } else {
        throw new Error(result.error || 'Failed to update poll');
      }
    } catch (error) {
      console.error('Failed to update poll:', error);
      toast({
        title: '❌ Error Updating Poll',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to update poll. Please try again.',
        variant: 'destructive',
        duration: 5000,
      });
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="glass-card overflow-hidden">
      <CardHeader>
        <CardTitle className="gradient-text">Edit Poll</CardTitle>
        <CardDescription>Update your poll details below</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <FormItem>
            <FormLabel htmlFor="title" required>Poll Title</FormLabel>
            <FormControl>
              <Input
                id="title"
                placeholder="Enter your question here"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="focus-within:glow"
              />
            </FormControl>
            <FormDescription>A clear, concise question for your audience</FormDescription>
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
                className="focus-within:glow"
              />
            </FormControl>
            <FormDescription>Additional details to help voters understand your poll</FormDescription>
          </FormItem>

          <div className="space-y-4">
            <FormLabel required>Poll Options</FormLabel>
            <FormDescription>Add at least two options for people to vote on</FormDescription>
            
            <div className="space-y-3">
              {options.map((option, index) => (
                <div key={option.id} className="flex items-center gap-2 group/option">
                  <div className="relative flex-1">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-primary/70 opacity-70">{index + 1}.</div>
                    <Input
                      placeholder={`Option ${index + 1}`}
                      value={option.text}
                      onChange={(e) => handleOptionChange(option.id, e.target.value)}
                      required
                      className="pl-8 focus-within:glow group-hover/option:border-primary/30 transition-all duration-300"
                    />
                  </div>
                  {options.length > 2 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemoveOption(option.id)}
                      className="opacity-70 hover:opacity-100 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all duration-300"
                    >
                      ×
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleAddOption}
              className="w-full mt-4 border-dashed border-glass-border hover:border-primary/50 hover:bg-accent/20 transition-all duration-300"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Option
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between gap-4">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              className="border-glass-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
            >
              Cancel
            </Button>
          )}
          <Button 
            type="submit" 
            variant="gradient"
            className={onCancel ? "flex-1 py-5" : "w-full py-5"} 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Updating Poll...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Update Poll
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}