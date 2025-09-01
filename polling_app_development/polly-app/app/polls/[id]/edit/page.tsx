"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "../../../../components/ui/button";
import { useAuth } from "../../../../contexts/auth-context";
import { getPollById } from "../../../../lib/actions/get-polls";
import { toast } from "../../../../components/ui/use-toast";
import { EditPollForm } from "../../../../components/EditPollForm";
import { Poll } from "../../../../lib/types";

// Using Poll and PollOption types from lib/types.ts

export default function EditPollPage({ params }: { params: { id: string } }) {
	const router = useRouter();
	const { session, isLoading } = useAuth();
	const user = session?.user;
	const [poll, setPoll] = useState<Poll | null>(null);
	const [isPollLoading, setIsPollLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!isLoading && !user) {
			router.push("/auth/sign-in");
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
				setError(pollError || "Poll not found");
				return;
			}

			// Check if user owns this poll
			if (poll.created_by !== user?.id) {
				setError("You can only edit your own polls");
				return;
			}

			// Set the poll state
			setPoll(poll);
		} catch (error) {
			console.error("Error loading poll:", error);
			setError("Failed to load poll");
		} finally {
			setIsPollLoading(false);
		}
	};

	if (isPollLoading) {
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

	if (!poll) {
		return <div className="container mx-auto p-4">Poll not found</div>;
	}

	const handleSuccess = (pollId: string) => {
		// Small delay to ensure the toast is visible before redirecting
		setTimeout(() => {
			router.push(`/polls/${pollId}`);
		}, 1500);
	};

	return (
		<div className="container mx-auto p-4 max-w-3xl">
			<Link href={`/polls/${params.id}`} className="mb-4 inline-block">
				<Button variant="outline">← Back to Poll</Button>
			</Link>

			<div className="mt-4">
				<h1 className="text-2xl font-bold mb-4">Edit Poll</h1>
				<EditPollForm 
					poll={poll} 
					pollId={params.id} 
					onSuccess={handleSuccess} 
					onCancel={() => router.back()} 
				/>
			</div>
		</div>
	);
}
