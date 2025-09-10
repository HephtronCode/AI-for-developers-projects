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
			router.push("/auth/sign-in");
		}
	}, [isAuthLoading, user, router]);

	useEffect(() => {
		// This is a placeholder for actual API call
		const fetchPoll = async () => {
			try {
				// Simulate API call
				await new Promise((resolve) => setTimeout(resolve, 1000));

				// Mock data
				const mockPoll: Poll = {
					id: params.id,
					title:
						params.id === "1" ? "Favorite Programming Language" : "Sample Poll",
					description: "Please select your favorite option",
					createdBy: "John Doe",
					createdAt: "2023-06-15",
					options: [
						{ id: "1", text: "JavaScript", votes: 15 },
						{ id: "2", text: "Python", votes: 12 },
						{ id: "3", text: "TypeScript", votes: 8 },
						{ id: "4", text: "Java", votes: 7 },
					],
					totalVotes: 42,
				};

				setPoll(mockPoll);
			} catch (error) {
				console.error("Failed to fetch poll:", error);
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
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// Update local state to reflect the vote
			setPoll((prevPoll) => {
				if (!prevPoll) return null;

				return {
					...prevPoll,
					options: prevPoll.options.map((option) => {
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
			console.error("Failed to submit vote:", error);
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

					<div className="space-y-4">
						{poll.options.map((option, index) => {
							const percentage =
								poll.totalVotes > 0
									? Math.round((option.votes / poll.totalVotes) * 100)
									: 0;
							return (
								<div
									key={option.id}
									className={`border border-glass-border bg-background/50 backdrop-blur-sm rounded-lg p-4 transition-all duration-300 ${
										selectedOption === option.id && !hasVoted
											? "glow border-primary/50"
											: ""
									} ${
										hasVoted
											? "hover:border-glass-border"
											: "hover:border-primary/30 cursor-pointer"
									}`}
									onClick={() => !hasVoted && setSelectedOption(option.id)}
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
													disabled={hasVoted}
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
												className="text-md font-medium"
											>
												<span className="text-xs text-primary/70 mr-2">
													{index + 1}.
												</span>
												{option.text}
											</label>
										</div>
										{hasVoted && (
											<span className="text-sm font-medium bg-primary/10 px-2 py-1 rounded-full">
												{percentage}% ({option.votes} votes)
											</span>
										)}
									</div>
									{hasVoted && (
										<div className="w-full bg-background/50 rounded-full h-3 mt-3 overflow-hidden">
											<div
												className="bg-gradient-to-r from-primary/80 to-purple-500/80 h-3 rounded-full transition-all duration-1000 ease-out"
												style={{ width: `${percentage}%` }}
											></div>
										</div>
									)}
								</div>
							);
						})}
					</div>
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
							className="w-full py-5 text-lg"
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
		</div>
	);
}
