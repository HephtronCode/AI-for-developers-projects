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
    <Card>
      <CardHeader>
        <CardTitle>Edit Poll</CardTitle>
        <CardDescription>Update your poll details below</CardDescription>
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
        <CardFooter className="flex justify-between gap-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button 
            type="submit" 
            className={onCancel ? "flex-1" : "w-full"} 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Updating Poll...
              </>
            ) : (
              "Update Poll"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}