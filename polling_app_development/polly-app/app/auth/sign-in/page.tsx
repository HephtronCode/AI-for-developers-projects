"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "../../../components/ui/card";
import { FormControl, FormItem, FormLabel } from "../../../components/ui/form";
import { useAuth } from "../../../contexts/auth-context";

/**
 * SignIn component provides a user interface for authentication.
 * It includes a form with email and password fields, a submit button, and a link to the sign-up page.
 * This component uses the `useAuth` hook to handle the sign-in logic.
 *
 * @returns {JSX.Element} The rendered sign-in form.
 */
export default function SignIn() {
	// useAuth hook to access the signIn function from the authentication context.
	const { signIn } = useAuth();
	// State for managing the email input field.
	const [email, setEmail] = useState("");
	// State for managing the password input field.
	const [password, setPassword] = useState("");
	// State for indicating loading status during form submission.
	const [isLoading, setIsLoading] = useState(false);

	/**
	 * Handles the form submission for signing in.
	 * It prevents the default form submission, sets the loading state,
	 * calls the signIn function, and handles any errors.
	 * @param {React.FormEvent} e - The form submission event.
	 */
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			// Attempt to sign in with the provided email and password.
			await signIn(email, password);
		} catch (error: any) {
			// Display any errors to the user.
			alert(error.message);
		} finally {
			// Reset the loading state after the submission attempt.
			setIsLoading(false);
		}
	};

	return (
		<div className="flex items-center justify-center min-h-screen bg-background p-4 sm:p-6 md:p-8">
			<div className="w-full max-w-md relative">
				{/* Decorative element */}
				<div className="absolute -top-6 -left-6 w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center glow-sm transform -rotate-6">
					<svg
						className="w-6 h-6 text-white"
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
				</div>

				<Card className="glass-card overflow-hidden border-glass-border bg-card/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300">
					<CardHeader className="pb-4">
						<CardTitle className="text-2xl sm:text-3xl gradient-text">
							Sign In
						</CardTitle>
						<CardDescription className="text-foreground/70">
							Enter your credentials to access your account
						</CardDescription>
					</CardHeader>
					<form onSubmit={handleSubmit}>
						<CardContent className="space-y-5">
							{/* Email input field */}
							<FormItem>
								<FormLabel htmlFor="email" className="text-sm font-medium">
									Email
								</FormLabel>
								<FormControl>
									<Input
										id="email"
										type="email"
										placeholder="email@example.com"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										required
										className="border-glass-border bg-background/50 backdrop-blur-sm focus-within:glow-sm transition-all duration-300"
									/>
								</FormControl>
							</FormItem>
							{/* Password input field */}
							<FormItem>
								<FormLabel htmlFor="password" className="text-sm font-medium">
									Password
								</FormLabel>
								<FormControl>
									<Input
										id="password"
										type="password"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										required
										className="border-glass-border bg-background/50 backdrop-blur-sm focus-within:glow-sm transition-all duration-300"
									/>
								</FormControl>
							</FormItem>
						</CardContent>
						<CardFooter className="flex flex-col space-y-4 pt-2 pb-6 px-6">
							{/* Submit button */}
							<Button
								type="submit"
								variant="gradient"
								className="w-full py-5 text-base font-medium shadow-md hover:shadow-lg transition-all duration-300"
								disabled={isLoading}
							>
								{isLoading ? (
									// Loading indicator shown during form submission.
									<div className="flex items-center justify-center">
										<svg
											className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
										>
											<circle
												className="opacity-25"
												cx="12"
												cy="12"
												r="10"
												stroke="currentColor"
												strokeWidth="4"
											></circle>
											<path
												className="opacity-75"
												fill="currentColor"
												d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
											></path>
										</svg>
										Signing in...
									</div>
								) : (
									// Default button content.
									<div className="flex items-center justify-center">
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
												d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
											/>
										</svg>
										Sign In
									</div>
								)}
							</Button>
							{/* Link to sign-up page */}
							<div className="text-sm text-center text-foreground/70">
								Don't have an account?{" "}
								<Link
									href="/auth/sign-up"
									className="text-primary hover:text-primary/80 hover:underline transition-colors duration-300"
								>
									Sign up
								</Link>
							</div>
						</CardFooter>
					</form>
				</Card>
			</div>
		</div>
	);
}
