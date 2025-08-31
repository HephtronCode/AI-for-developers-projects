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
		<div className="flex items-center justify-center min-h-screen bg-background">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Create an Account</CardTitle>
					<CardDescription>
						Enter your information to create an account
					</CardDescription>
				</CardHeader>
				<form onSubmit={handleSubmit}>
					<CardContent className="space-y-4">
						<FormItem>
							<FormLabel htmlFor="name">Name</FormLabel>
							<FormControl>
								<Input
									id="name"
									placeholder="John Doe"
									value={name}
									onChange={(e) => setName(e.target.value)}
									required
								/>
							</FormControl>
						</FormItem>
						<FormItem>
							<FormLabel htmlFor="email">Email</FormLabel>
							<FormControl>
								<Input
									id="email"
									type="email"
									placeholder="email@example.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
								/>
							</FormControl>
						</FormItem>
						<FormItem>
							<FormLabel htmlFor="password">Password</FormLabel>
							<FormControl>
								<Input
									id="password"
									type="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
								/>
							</FormControl>
						</FormItem>
						<FormItem>
							<FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
							<FormControl>
								<Input
									id="confirmPassword"
									type="password"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									required
								/>
							</FormControl>
						</FormItem>
					</CardContent>
					<CardFooter className="flex flex-col space-y-2">
						<Button type="submit" className="w-full" disabled={isLoading}>
							{isLoading ? "Creating account..." : "Sign Up"}
						</Button>
						<div className="text-sm text-center mt-2">
							Already have an account?{" "}
							<Link
								href="/auth/sign-in"
								className="text-primary hover:underline"
							>
								Sign in
							</Link>
						</div>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
}
