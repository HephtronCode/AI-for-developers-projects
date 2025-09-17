"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { useAuth } from "../../../contexts/auth-context";
import { PollResultsChart } from "../../../components/ui/poll-results-chart";
import { getPollById, getOptionsWithVoteCounts } from "../../../lib/actions/get-polls";
import { vote } from "../../../lib/actions/vote-actions";
import { toast } from "../../../components/ui/use-toast";
import { createComment, getComments, deleteComment } from "../../../lib/actions/comment-actions";
import { Textarea } from "../../../components/ui/textarea";

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

type Comment = {
	id: string;
	content: string;
	created_at: string;
	user_id: string;
	profiles: { email: string | null };
};

export default function PollPage({ params }: { params: { id: string } }) {
	const router = useRouter();
	const { user, isLoading: isAuthLoading } = useAuth();
	const [poll, setPoll] = useState<Poll | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [selectedOption, setSelectedOption] = useState<string | null>(null);
	const [hasVoted, setHasVoted] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [comments, setComments] = useState<Comment[]>([]);
	const [newComment, setNewComment] = useState("");
	const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);

	useEffect(() => {
		if (!isAuthLoading && !user) {
			router.push("/auth/sign-in");
		}
	}, [isAuthLoading, user, router]);

	useEffect(() => {
		const fetchPollData = async () => {
			setIsLoading(true);
			setError(null);
			try {
				const { poll: fetchedPoll, error: pollError } = await getPollById(params.id);
				if (pollError || !fetchedPoll) {
					setError(pollError || "Poll not found");
					setPoll(null);
					return;
				}

				const { options: fetchedOptions, error: optionsError } = await getOptionsWithVoteCounts(params.id);
				if (optionsError || !fetchedOptions) {
					setError(optionsError || "Could not fetch poll options");
					setPoll(null);
					return;
				}

				const totalVotes = fetchedOptions.reduce((sum, option) => sum + option.vote_count, 0);

				setPoll({
					id: fetchedPoll.id,
					title: fetchedPoll.title,
					description: fetchedPoll.description || "",
					createdBy: fetchedPoll.created_by,
					createdAt: new Date(fetchedPoll.created_at).toLocaleDateString(),
					options: fetchedOptions.map(opt => ({ id: opt.id, text: opt.option_text, votes: opt.vote_count })),
					totalVotes,
				});

				// Check if user has already voted
				const userVote = fetchedOptions.find(option => option.has_voted);
				if (userVote) {
					setHasVoted(true);
					setSelectedOption(userVote.id);
				}

				// Fetch comments
				const { comments: fetchedComments, error: commentsError } = await getComments(params.id);
				if (commentsError) {
					console.error("Failed to fetch comments:", commentsError);
					// Optionally set an error state for comments specifically
				} else if (fetchedComments) {
					setComments(fetchedComments);
				}

			} catch (err) {
				console.error("Failed to fetch poll:", err);
				setError("Failed to load poll data.");
			} finally {
				setIsLoading(false);
			}
		};

		fetchPollData();
	}, [params.id, user]);

	const handleVote = async () => {
		if (!selectedOption || hasVoted || !poll || !user) return;

		setIsSubmitting(true);
		setError(null);

		try {
			const { success, error: voteError } = await vote(poll.id, selectedOption, user.id);
			if (!success) {
				setError(voteError || "Failed to submit vote.");
				toast({
					title: "Vote Failed",
					description: voteError || "There was an error submitting your vote.",
					variant: "destructive",
				});
				return;
			}

			// Update local state to reflect the vote
			setPoll((prevPoll) => {
				if (!prevPoll) return null;

				const updatedOptions = prevPoll.options.map((option) => {
					if (option.id === selectedOption) {
						return { ...option, votes: option.votes + 1 };
					}
					return option;
				});

				return {
					...prevPoll,
					options: updatedOptions,
					totalVotes: prevPoll.totalVotes + 1,
				};
			});

			setHasVoted(true);
			toast({
				title: "Vote Submitted!",
				description: "Your vote has been successfully recorded.",
			});
		} catch (err) {
			console.error("Failed to submit vote:", err);
			setError("An unexpected error occurred.");
			toast({
				title: "Error",
				description: "An unexpected error occurred while submitting your vote.",
				variant: "destructive",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleAddComment = async () => {
		if (!newComment.trim() || !poll || !user) return;

		setIsCommentSubmitting(true);
		try {
			const { success, error: commentError } = await createComment(poll.id, newComment);
			if (!success) {
				toast({
					title: "Failed to add comment",
					description: commentError || "An error occurred while adding your comment.",
					variant: "destructive",
				});
				return;
			}
			setNewComment("");
			// Re-fetch comments to include the new one
			const { comments: updatedComments, error: fetchError } = await getComments(poll.id);
			if (fetchError) {
				console.error("Failed to re-fetch comments after adding:", fetchError);
			} else if (updatedComments) {
				setComments(updatedComments);
			}
			toast({
				title: "Comment Added!",
				description: "Your comment has been successfully added.",
			});
		} catch (err) {
			console.error("Error adding comment:", err);
			toast({
				title: "Error",
				description: "An unexpected error occurred while adding comment.",
				variant: "destructive",
			});
		} finally {
			setIsCommentSubmitting(false);
		}
	};

	const handleDeleteComment = async (commentId: string) => {
		if (!user || !poll) return;

		try {
			const { success, error: deleteError } = await deleteComment(commentId);
			if (!success) {
				toast({
					title: "Failed to delete comment",
					description: deleteError || "An error occurred while deleting your comment.",
					variant: "destructive",
				});
				return;
			}
			// Remove the deleted comment from the local state
			setComments(comments.filter(comment => comment.id !== commentId));
			toast({
				title: "Comment Deleted!",
				description: "Your comment has been successfully deleted.",
			});
		} catch (err) {
			console.error("Error deleting comment:", err);
			toast({
				title: "Error",
				description: "An unexpected error occurred while deleting comment.",
				variant: "destructive",
			});
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

	if (error) {
		return (
			<div className="container mx-auto p-4">
				<h1 className="text-2xl font-bold mb-6 text-red-500">Error: {error}</h1>
				<Link href="/polls">
					<Button>Back to Polls</Button>
				</Link>
			</div>
		);
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
		<div className="container mx-auto p-4 max-w-3xl sm:p-6 md:p-8">
			<Link href="/polls" className="mb-4 inline-block">
				<Button
					variant="outline"
					className="border-glass-border bg-background/50 hover:bg-accent/30 transition-all duration-300"
				>
					<svg
						className="w-4 h-4 mr-2"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M10 19l-7-7m0 0l7-7m-7 7h18"
						/>
					</svg>
					Back to Polls
				</Button>
			</Link>

			<Card className="mt-4 glass-card overflow-hidden">
				<CardHeader>
					<CardTitle className="text-2xl gradient-text">{poll.title}</CardTitle>
					<CardDescription className="flex items-center gap-2">
						<svg
							className="w-4 h-4 text-primary/70"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
							/>
						</svg>
						Created by {poll.createdBy}
						<span className="text-foreground/30 mx-1">•</span>
						<svg
							className="w-4 h-4 text-primary/70"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
							/>
						</svg>
						{poll.createdAt}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="mb-8 text-foreground/80">{poll.description}</p>

					{!hasVoted && (
						<div className="space-y-4">
							{poll.options.map((option, index) => {
								return (
									<div
										key={option.id}
										className={`border border-glass-border bg-background/50 backdrop-blur-sm rounded-lg p-4 transition-all duration-300 ${
											selectedOption === option.id
												? "glow border-primary/50"
												: "hover:border-primary/30 cursor-pointer"
										}`}
										onClick={() => setSelectedOption(option.id)}
									>
										<div className="flex items-center justify-between mb-2">
											<div className="flex items-center">
												<div className="relative mr-3">
													<input
														type="radio"
														id={option.id}
														name="poll-option"
														value={option.id}
														checked={selectedOption === option.id}
														onChange={() => setSelectedOption(option.id)}
														className="appearance-none w-5 h-5 rounded-full border-2 border-primary/50 checked:border-primary checked:bg-primary/20 transition-all duration-300"
													/>
													{selectedOption === option.id && (
														<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
															<div className="w-2 h-2 rounded-full bg-primary glow-sm"></div>
														</div>
													)}
												</div>
												<label
													htmlFor={option.id}
													className="text-md font-medium text-base sm:text-lg"
												>
													<span className="text-xs text-primary/70 mr-2 sm:text-sm">
														{index + 1}.
													</span>
													{option.text}
												</label>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					)}
					{/* Chart visualization after voting */}
					{hasVoted && (
						<div className="mt-8">
							<PollResultsChart
								data={poll.options.map((option) => ({
									option: option.text,
									votes: option.votes,
								}))}
								type="bar"
							/>
							<div className="mt-4">
								<PollResultsChart
									data={poll.options.map((option) => ({
										option: option.text,
										votes: option.votes,
									}))}
									type="pie"
								/>
							</div>
						</div>
					)}
				</CardContent>
				<CardFooter>
					{!hasVoted ? (
						<Button
							onClick={handleVote}
							disabled={!selectedOption || isSubmitting}
							variant="gradient"
							className="w-full py-5 text-lg sm:py-6 sm:text-xl"
						>
							{isSubmitting ? (
								<>
									<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
									Submitting Vote...
								</>
							) : (
								<>
									<svg
										className="w-5 h-5 mr-2"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M5 13l4 4L19 7"
										/>
									</svg>
									Submit Vote
								</>
							)}
						</Button>
					) : (
						<div className="w-full text-center space-y-4">
							<div className="bg-primary/10 border border-primary/20 rounded-lg p-4 glow-sm">
								<svg
									className="w-8 h-8 mx-auto text-primary mb-2"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
								<p className="text-md font-medium mb-1 gradient-text">
									Thank you for voting!
								</p>
								<p className="text-sm text-foreground/70">
									Total votes:{" "}
									<span className="font-medium">{poll.totalVotes}</span>
								</p>
							</div>
							<Link href="/polls" className="inline-block">
								<Button
									variant="outline"
									className="border-glass-border bg-background/50 hover:bg-accent/30 transition-all duration-300"
								>
									<svg
										className="w-4 h-4 mr-2"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M4 6h16M4 10h16M4 14h16M4 18h16"
										/>
									</svg>
									View Other Polls
								</Button>
							</Link>
						</div>
					)}
				</CardFooter>
			</Card>

			{/* Comments Section */}
			<Card className="mt-8 glass-card overflow-hidden">
				<CardHeader>
					<CardTitle className="text-xl gradient-text sm:text-2xl">Comments ({comments.length})</CardTitle>
				</CardHeader>
				<CardContent>
					{user ? (
						<div className="mb-6">
							<Textarea
								placeholder="Add a comment..."
								value={newComment}
								onChange={(e) => setNewComment(e.target.value)}
								rows={3}
								className="mb-2 bg-background/50 border-glass-border focus-visible:ring-primary text-base sm:text-lg"
							/>
							<Button
								onClick={handleAddComment}
								disabled={!newComment.trim() || isCommentSubmitting}
								variant="gradient"
								className="w-full py-2 sm:py-3"
							>
								{isCommentSubmitting ? "Adding Comment..." : "Add Comment"}
							</Button>
						</div>
					) : (
						<p className="text-center text-foreground/70 mb-6 text-base sm:text-lg">
							<Link href="/auth/sign-in" className="text-primary hover:underline">
								Sign in
							</Link>{" "}
							to add a comment.
						</p>
					)}

					{comments.length === 0 ? (
						<p className="text-center text-foreground/70 text-base sm:text-lg">No comments yet. Be the first to comment!</p>
					) : (
						<div className="space-y-4">
							{comments.map((comment) => (
								<div key={comment.id} className="glass-card p-4 rounded-lg border border-glass-border">
									<div className="flex items-center justify-between mb-2">
										<div className="flex items-center">
											<span className="font-semibold text-primary mr-2 text-sm sm:text-base">
												{comment.profiles?.email?.split('@')[0] || "Anonymous"}
											</span>
											<span className="text-sm text-foreground/60">
												{new Date(comment.created_at).toLocaleDateString()}
											</span>
										</div>
										{user?.id === comment.user_id && (
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleDeleteComment(comment.id)}
												className="text-red-500 hover:bg-red-500/10"
											>
												Delete
											</Button>
										)}
									</div>
									<p className="text-foreground/80 text-base sm:text-lg">{comment.content}</p>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
