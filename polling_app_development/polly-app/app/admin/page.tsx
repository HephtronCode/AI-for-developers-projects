"use client";

import React, { useEffect } from "react";
import { useAuth } from "../../contexts/auth-context";
import { useRouter } from "next/navigation";
import { getUsers, updateUserRole } from "../../lib/actions/user-actions";
import { User } from "@supabase/supabase-js";

// Example admin dashboard page for poll and user management
export default function AdminDashboard() {
	const { user, isLoading, isAdmin } = useAuth();
	const router = useRouter();
	const [users, setUsers] = React.useState<Array<{ id: string; email: string; role: string }>>([]);
	const [loadingUsers, setLoadingUsers] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);

	useEffect(() => {
		if (!isLoading && (!user || !isAdmin)) {
			router.push("/"); // Redirect to home or a 403 page if not admin
		}
	}, [user, isLoading, isAdmin, router]);

	useEffect(() => {
		const fetchUsers = async () => {
			setLoadingUsers(true);
			const { users: fetchedUsers, error: fetchError } = await getUsers();
			if (fetchError) {
				setError(fetchError);
			} else {
				setUsers(fetchedUsers);
			}
			setLoadingUsers(false);
		};

		if (isAdmin) {
			fetchUsers();
		}
	}, [isAdmin]);

	const handleRoleChange = async (userId: string, newRole: 'admin' | 'user') => {
		const originalUsers = [...users];
		// Optimistically update UI
		setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));

		const { success, error: updateError } = await updateUserRole(userId, newRole);
		
		if (!success) {
			setError(updateError || 'Failed to update user role.');
			setUsers(originalUsers); // Revert on error
		} else {
			setError(null);
		}
	};


	if (isLoading || !user || !isAdmin) {
		return <p>Loading or Access Denied...</p>; // Or a more sophisticated loading/denial component
	}
	// TODO: Replace with real data fetching and admin logic
	return (
		<main className="max-w-4xl mx-auto py-8">
			<h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
			<section className="mb-8">
				<h2 className="text-xl font-semibold mb-2">Poll Management</h2>
				<p>View, edit, or delete any poll. Moderate inappropriate content.</p>
				{/* Poll list and moderation actions go here */}
			</section>
			<section className="mb-8">
				<h2 className="text-xl font-semibold mb-2">User Management</h2>
				{loadingUsers ? (
					<p>Loading users...</p>
				) : error ? (
					<p className="text-red-500">Error: {error}</p>
				) : (
					<div className="overflow-x-auto">
						<table className="min-w-full bg-white">
							<thead>
								<tr>
									<th className="py-2 px-4 border-b">Email</th>
									<th className="py-2 px-4 border-b">Role</th>
									<th className="py-2 px-4 border-b">Actions</th>
								</tr>
							</thead>
							<tbody>
								{users.map((u) => (
									<tr key={u.id}>
										<td className="py-2 px-4 border-b">{u.email}</td>
										<td className="py-2 px-4 border-b">{u.role}</td>
										<td className="py-2 px-4 border-b">
											{u.role === 'user' ? (
												<button
													onClick={() => handleRoleChange(u.id, 'admin')}
													className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded text-xs"
												>
													Make Admin
												</button>
											) : (
												<button
													onClick={() => handleRoleChange(u.id, 'user')}
													className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs"
												>
													Revoke Admin
												</button>
											)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</section>
			<section>
				<h2 className="text-xl font-semibold mb-2">Moderation Tools</h2>
				<p>Review flagged polls, comments, and take action as needed.</p>
				{/* Moderation tools go here */}
			</section>
		</main>
	);
}