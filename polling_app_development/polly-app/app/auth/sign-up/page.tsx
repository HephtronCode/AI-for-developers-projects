"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import {
	FormControl,
	FormDescription,
	FormItem,
	FormLabel,
	FormMessage,
} from "../../../components/ui/form";
import { useAuth } from "../../../contexts/auth-context";

export default function SignUp() {
	const router = useRouter();
	const { signUp } = useAuth();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (password !== confirmPassword) {
			alert("Passwords do not match.");
			return;
		}

		setIsLoading(true);

		try {
			await signUp(name, email, password);
			alert(
				"Registration successful! Please check your email to confirm your account."
			);
			router.push("/auth/sign-in");
		} catch (error: any) {
			alert(error.message);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex items-center justify-center min-h-screen bg-background p-4 sm:p-6 md:p-8">
			<div className="w-full max-w-md relative">
				<div className="absolute -top-6 -right-6 w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center glow-sm transform rotate-6">
					<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
					</svg>
				</div>
				
				<Card className="glass-card overflow-hidden border-glass-border bg-card/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300">
					<CardHeader className="pb-4">
						<CardTitle className="text-2xl sm:text-3xl gradient-text">Create an Account</CardTitle>
						<CardDescription className="text-foreground/70">
							Enter your information to create an account
						</CardDescription>
					</CardHeader>
					<form onSubmit={handleSubmit}>
						<CardContent className="space-y-5">
							<FormItem>
								<FormLabel htmlFor="name" className="text-sm font-medium">Name</FormLabel>
								<FormControl>
									<Input
										id="name"
										placeholder="John Doe"
										value={name}
										onChange={(e) => setName(e.target.value)}
										required
										className="border-glass-border bg-background/50 backdrop-blur-sm focus-within:glow-sm transition-all duration-300"
									/>
								</FormControl>
							</FormItem>
							<FormItem>
								<FormLabel htmlFor="email" className="text-sm font-medium">Email</FormLabel>
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
							<FormItem>
								<FormLabel htmlFor="password" className="text-sm font-medium">Password</FormLabel>
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
							<FormItem>
								<FormLabel htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</FormLabel>
								<FormControl>
									<Input
										id="confirmPassword"
										type="password"
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
										required
										className="border-glass-border bg-background/50 backdrop-blur-sm focus-within:glow-sm transition-all duration-300"
									/>
								</FormControl>
							</FormItem>
						</CardContent>
						<CardFooter className="flex flex-col space-y-4 pt-2 pb-6 px-6">
							<Button 
								type="submit" 
								variant="gradient" 
								className="w-full py-5 text-base font-medium shadow-md hover:shadow-lg transition-all duration-300" 
								disabled={isLoading}
							>
								{isLoading ? (
									<div className="flex items-center justify-center">
										<svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
											<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
											<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
										</svg>
										Creating account...
									</div>
								) : (
									<div className="flex items-center justify-center">
										<svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
										</svg>
										Sign Up
									</div>
								)}
							</Button>
							<div className="text-sm text-center text-foreground/70">
								Already have an account?{" "}
								<Link
									href="/auth/sign-in"
									className="text-primary hover:text-primary/80 hover:underline transition-colors duration-300"
								>
									Sign in
								</Link>
							</div>
						</CardFooter>
					</form>
				</Card>
			</div>
		</div>
	);
}
