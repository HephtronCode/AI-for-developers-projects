"use client";

/**
 * Dashboard Content Component
 *
 * This component serves as the main dashboard UI for the Polly application.
 * It displays different content based on authentication status and provides
 * interfaces for poll management.
 */

import { useState } from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "./ui/card";
import { useAuth } from "../contexts/auth-context";
import { toast } from "./ui/use-toast";
import { deletePoll } from "../lib/actions/poll-actions";
import { Poll } from "../lib/actions/get-polls";
import { User } from "@supabase/supabase-js";

/**
 * Props for the DashboardContent component
 */
interface DashboardContentProps {
	polls: Poll[]; // List of polls to display
	currentUser: User | null; // Current user from server-side auth check
	error: string | null; // Error message if poll fetching failed
}

/**
 * Dashboard Content Component
 *
 * Renders different views based on authentication status:
 * - For authenticated users: Displays their polls and management options
 * - For unauthenticated users: Shows welcome content and sign-up/sign-in buttons
 *
 * The component also handles poll deletion and provides navigation to create and view polls.
 *
 * @param {DashboardContentProps} props - Component props
 * @returns {JSX.Element} Rendered dashboard interface
 */

export default function DashboardContent({
	polls,
	currentUser,
	error,
}: DashboardContentProps) {
	const { session } = useAuth();
	const user = session?.user || currentUser;
	const [deletingPolls, setDeletingPolls] = useState<Set<string>>(new Set());

	/**
	 * Handles the deletion of a poll
	 *
	 * This function:
	 * 1. Prompts the user for confirmation
	 * 2. Sets the poll as "deleting" to show loading state
	 * 3. Calls the server action to delete the poll
	 * 4. Shows success/error toast notifications
	 * 5. Refreshes the page on success to update the poll list
	 *
	 * @param {string} pollId - ID of the poll to delete
	 */
	const handleDeletePoll = async (pollId: string) => {
		if (
			!confirm(
				"Are you sure you want to delete this poll? This action cannot be undone."
			)
		) {
			return;
		}

		// Set the poll as "deleting" to show loading state in the UI
		setDeletingPolls((prev) => new Set(prev).add(pollId));

		try {
			const result = await deletePoll(pollId);

			if (result.success) {
				toast({
					title: "🗑️ Poll Deleted",
					description: "Your poll has been successfully deleted.",
					duration: 3000,
				});
				// Refresh the page to update the polls list
				window.location.reload();
			} else {
				throw new Error(result.error || "Failed to delete poll");
			}
		} catch (error) {
			console.error("Failed to delete poll:", error);
			toast({
				title: "❌ Error Deleting Poll",
				description:
					error instanceof Error
						? error.message
						: "Failed to delete poll. Please try again.",
				variant: "destructive",
				duration: 5000,
			});
		} finally {
			// Remove the poll from the "deleting" set regardless of outcome
			setDeletingPolls((prev) => {
				const newSet = new Set(prev);
				newSet.delete(pollId);
				return newSet;
			});
		}
	};

	/**
	 * Checks if the current user is the owner of a poll
	 *
	 * Used to determine whether to show management options for a poll.
	 *
	 * @param {Poll} poll - The poll to check ownership for
	 * @returns {boolean} True if the current user created the poll
	 */
	const isPollOwner = (poll: Poll) => {
		return user && poll.created_by === user.id;
	};

	if (error) {
		return (
			<div className="text-center py-8 sm:py-10 glass-card rounded-xl p-6">
				<div className="text-red-500 mb-6">
					<svg
						className="w-12 h-12 mx-auto mb-4 text-red-500/70"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
						/>
					</svg>
					<h3 className="text-xl font-semibold">Error Loading Polls</h3>
					<p className="mt-2">{error}</p>
				</div>
				<Button
					variant="gradient"
					onClick={() => window.location.reload()}
					className="px-6 py-2"
				>
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
							d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
						/>
					</svg>
					Try Again
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-8 sm:space-y-12">
			{/* Hero Section */}
			<div className="text-center space-y-6">
				<div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full mb-4 sm:mb-6 backdrop-blur-sm border border-glass-border">
					<svg
						className="w-8 h-8 sm:w-10 sm:h-10 text-primary"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
						/>
					</svg>
				</div>

				<div className="space-y-4">
					<h2 className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text">
						{user ? "Your Polling Dashboard" : "Welcome to Polly"}
					</h2>
					<p className="text-base sm:text-lg text-foreground/70 max-w-2xl mx-auto">
						{user
							? "Create, manage, and analyze your polls with ease. Get insights from your audience in real-time."
							: "Create engaging polls, gather opinions, and make data-driven decisions with our intuitive polling platform."}
					</p>
				</div>

				{/* Action Buttons */}
				<div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 sm:pt-6">
					{user ? (
						<>
							<Link href="/polls/create" className="w-full sm:w-auto">
								<Button
									variant="gradient"
									size="lg"
									className="w-full sm:w-auto px-6 py-2 sm:px-8 sm:py-3"
								>
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
											d="M12 6v6m0 0v6m0-6h6m-6 0H6"
										/>
									</svg>
									Create New Poll
								</Button>
							</Link>
							<Link href="/polls" className="w-full sm:w-auto">
								<Button
									size="lg"
									variant="outline"
									className="w-full sm:w-auto border-glass-border bg-background/50 hover:bg-accent/30 px-6 py-2 sm:px-8 sm:py-3 transition-all duration-300"
								>
									<svg
										className="w-5 h-5 mr-2 text-primary"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
										/>
									</svg>
									View All Polls
								</Button>
							</Link>
						</>
					) : (
						<>
							<Link href="/auth/sign-up" className="w-full sm:w-auto">
								<Button
									variant="gradient"
									size="lg"
									className="w-full sm:w-auto px-6 py-2 sm:px-8 sm:py-3"
								>
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
											d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
										/>
									</svg>
									Get Started Free
								</Button>
							</Link>
							<Link href="/auth/sign-in" className="w-full sm:w-auto">
								<Button
									size="lg"
									variant="outline"
									className="w-full sm:w-auto border-glass-border bg-background/50 hover:bg-accent/30 px-6 py-2 sm:px-8 sm:py-3 transition-all duration-300"
								>
									<svg
										className="w-5 h-5 mr-2 text-primary"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
										/>
									</svg>
									Sign In
								</Button>
							</Link>
						</>
					)}
				</div>
			</div>

			{/* Polls Display */}
			{user && (
				<div className="space-y-6 sm:space-y-8">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
						<div>
							<h2 className="text-xl sm:text-2xl font-bold gradient-text">
								{polls.length > 0 ? "Your Recent Polls" : "No Polls Yet"}
							</h2>
							<p className="text-foreground/70 mt-1">
								{polls.length > 0
									? `You have ${polls.length} poll${
											polls.length === 1 ? "" : "s"
									  }`
									: "Start by creating your first poll"}
							</p>
						</div>
						{polls.length > 0 && (
							<Link href="/polls">
								<Button
									variant="outline"
									className="border-glass-border bg-background/50 hover:bg-accent/30 transition-all duration-300"
								>
									<svg
										className="w-4 h-4 mr-2 text-primary"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
										/>
									</svg>
									View All
								</Button>
							</Link>
						)}
					</div>

					{polls.length === 0 ? (
						<div className="text-center py-12 sm:py-16 glass-card rounded-xl border border-glass-border">
							<div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full mb-4 sm:mb-6 backdrop-blur-sm border border-glass-border">
								<svg
									className="w-8 h-8 sm:w-10 sm:h-10 text-primary/70"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
									/>
								</svg>
							</div>
							<h3 className="text-lg sm:text-xl font-semibold gradient-text mb-2 sm:mb-3">
								No polls yet
							</h3>
							<p className="text-foreground/70 mb-6 sm:mb-8 max-w-md mx-auto">
								Create your first poll to start gathering insights from your
								audience
							</p>
							<Link href="/polls/create">
								<Button
									variant="gradient"
									className="px-6 py-2 sm:px-8 sm:py-3"
								>
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
											d="M12 6v6m0 0v6m0-6h6m-6 0H6"
										/>
									</svg>
									Create Your First Poll
								</Button>
							</Link>
						</div>
					) : (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
							{polls.map((poll) => (
								<Card
									key={poll.id}
									className="h-full glass-card overflow-hidden hover:shadow-lg transition-all duration-300"
								>
									<CardHeader>
										<div className="flex justify-between items-start">
											<div className="flex-1">
												<CardTitle className="line-clamp-2 hover:gradient-text transition-all duration-300">
													{poll.title}
												</CardTitle>
												<CardDescription className="text-foreground/60">
													Created on{" "}
													{new Date(poll.created_at).toLocaleDateString(
														"en-US",
														{
															year: "numeric",
															month: "short",
															day: "numeric",
														}
													)}
												</CardDescription>
											</div>
											{isPollOwner(poll) && (
												<div className="flex gap-2 ml-2">
													<Link href={`/polls/${poll.id}/edit`}>
														<Button
															size="sm"
															variant="outline"
															className="h-8 w-8 p-0 border-glass-border bg-background/50 hover:bg-accent/30 transition-all duration-300"
														>
															<svg
																className="w-4 h-4 text-primary"
																fill="none"
																stroke="currentColor"
																viewBox="0 0 24 24"
															>
																<path
																	strokeLinecap="round"
																	strokeLinejoin="round"
																	strokeWidth={2}
																	d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
																/>
															</svg>
														</Button>
													</Link>
													<Button
														size="sm"
														variant="outline"
														className="h-8 w-8 p-0 border-glass-border bg-background/50 hover:bg-red-500/20 text-red-500 hover:text-red-600 transition-all duration-300"
														onClick={() => handleDeletePoll(poll.id)}
														disabled={deletingPolls.has(poll.id)}
													>
														{deletingPolls.has(poll.id) ? (
															<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
														) : (
															<svg
																className="w-4 h-4"
																fill="none"
																stroke="currentColor"
																viewBox="0 0 24 24"
															>
																<path
																	strokeLinecap="round"
																	strokeLinejoin="round"
																	strokeWidth={2}
																	d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
																/>
															</svg>
														)}
													</Button>
												</div>
											)}
										</div>
									</CardHeader>

									<CardContent>
										<p className="text-sm text-foreground/70 line-clamp-3">
											{poll.description || "No description"}
										</p>
									</CardContent>

									<CardFooter className="flex justify-between items-center">
										<div className="flex gap-4 text-sm text-foreground/60">
											<span className="flex items-center">
												<svg
													className="w-4 h-4 mr-1 text-primary/70"
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
												{poll.votes_count} votes
											</span>
											<span className="flex items-center">
												<svg
													className="w-4 h-4 mr-1 text-primary/70"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M4 6h16M4 12h16M4 18h7"
													/>
												</svg>
												{poll.options_count} options
											</span>
										</div>
										<Link href={`/polls/${poll.id}`}>
											<Button
												size="sm"
												variant="outline"
												className="border-glass-border bg-background/50 hover:bg-accent/30 transition-all duration-300"
											>
												<svg
													className="w-4 h-4 mr-1 text-primary"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
													/>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
													/>
												</svg>
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
				<div className="space-y-8 sm:space-y-12">
					<div className="text-center">
						<h2 className="text-2xl sm:text-3xl font-bold gradient-text mb-4 sm:mb-6">
							Why Choose Polly?
						</h2>
						<p className="text-foreground/70 text-base sm:text-lg max-w-2xl mx-auto">
							Our platform makes it easy to create engaging polls and gather
							valuable insights from your audience
						</p>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
						<div className="glass-card p-6 sm:p-8 rounded-xl hover:shadow-lg transition-all duration-300 border border-glass-border">
							<div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 rounded-lg mb-4 backdrop-blur-sm border border-glass-border">
								<svg
									className="w-6 h-6 sm:w-7 sm:h-7 text-primary"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 6v6m0 0v6m0-6h6m-6 0H6"
									/>
								</svg>
							</div>
							<h3 className="text-lg sm:text-xl font-semibold gradient-text mb-3">
								Easy Creation
							</h3>
							<p className="text-foreground/70">
								Create custom polls with multiple options in seconds. No
								technical skills required.
							</p>
						</div>

						<div className="glass-card p-6 sm:p-8 rounded-xl hover:shadow-lg transition-all duration-300 border border-glass-border">
							<div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 rounded-lg mb-4 backdrop-blur-sm border border-glass-border">
								<svg
									className="w-6 h-6 sm:w-7 sm:h-7 text-primary"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
									/>
								</svg>
							</div>
							<h3 className="text-lg sm:text-xl font-semibold gradient-text mb-3">
								Simple Sharing
							</h3>
							<p className="text-foreground/70">
								Share your polls with friends, colleagues, or the public with
								just one click.
							</p>
						</div>

						<div className="glass-card p-6 sm:p-8 rounded-xl hover:shadow-lg transition-all duration-300 border border-glass-border sm:col-span-2 lg:col-span-1">
							<div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 rounded-lg mb-4 backdrop-blur-sm border border-glass-border">
								<svg
									className="w-6 h-6 sm:w-7 sm:h-7 text-primary"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
									/>
								</svg>
							</div>
							<h3 className="text-lg sm:text-xl font-semibold gradient-text mb-3">
								Real-time Analytics
							</h3>
							<p className="text-foreground/70">
								Get real-time results and insights from your polls with
								beautiful visualizations.
							</p>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
