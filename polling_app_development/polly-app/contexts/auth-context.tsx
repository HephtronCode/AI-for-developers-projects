"use client";

/**
 * Authentication Context for Polly App
 *
 * This file provides a React Context for managing authentication state throughout the application.
 * It handles user authentication flows (sign in, sign up, sign out) and maintains the current
 * authentication state in the React component tree.
 */

import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import supabase from "../lib/supabase-client";
import { useRouter } from "next/navigation";

/**
 * Interface defining the shape of the authentication context
 * This type provides type safety for consumers of the auth context
 */
interface AuthContextType {
	session: Session | null; // The current Supabase session
	user: User | null; // The current authenticated user
	isLoading: boolean; // Loading state while checking authentication
	signIn: (email: string, password: string) => Promise<void>; // Function to sign in a user
	signUp: (name: string, email: string, password: string) => Promise<void>; // Function to register a new user
	signOut: () => Promise<void>; // Function to sign out the current user
}

/**
 * Default context value with empty functions
 * This provides a safe default when the context is accessed outside of a provider
 */
const AuthContext = createContext<AuthContextType>({
	session: null,
	user: null,
	isLoading: true,
	signIn: async () => {},
	signUp: async () => {},
	signOut: async () => {},
});

/**
 * Authentication Provider Component
 *
 * This component wraps the application to provide authentication context to all children.
 * It manages authentication state and provides methods for authentication operations.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components that will have access to auth context
 * @returns {JSX.Element} Provider component with authentication state and methods
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const [session, setSession] = useState<Session | null>(null);
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();

	useEffect(() => {
		// Function to get the initial session when the component mounts
		const getSession = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			setSession(session);
			setUser(session?.user ?? null);
			setIsLoading(false);
		};

		getSession();

		// Set up listener for auth state changes (login, logout, etc.)
		const { data: authListener } = supabase.auth.onAuthStateChange(
			(_event, session) => {
				setSession(session);
				setUser(session?.user ?? null);
			}
		);

		// Clean up subscription when component unmounts
		return () => {
			authListener.subscription.unsubscribe();
		};
	}, []);

	/**
	 * Sign in a user with email and password
	 *
	 * Authenticates a user using Supabase Auth and redirects to the polls page on success.
	 * Throws an error if authentication fails.
	 *
	 * @param {string} email - User's email address
	 * @param {string} password - User's password
	 * @throws {Error} If authentication fails
	 */
	const signIn = async (email: string, password: string) => {
		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) {
			throw error;
		}

		// Redirect to polls page after successful sign in
		router.push("/polls");
	};

	/**
	 * Register a new user with name, email and password
	 *
	 * Creates a new user account in Supabase Auth with the provided details.
	 * The name is stored as user metadata.
	 *
	 * @param {string} name - User's full name
	 * @param {string} email - User's email address
	 * @param {string} password - User's chosen password
	 * @throws {Error} If registration fails
	 */
	const signUp = async (name: string, email: string, password: string) => {
		const { error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: {
					full_name: name,
				},
			},
		});

		if (error) {
			throw error;
		}
	};

	/**
	 * Sign out the current user
	 *
	 * Ends the user's session and redirects to the home page.
	 */
	const signOut = async () => {
		await supabase.auth.signOut();
		router.push("/");
	};

	return (
		<AuthContext.Provider
			value={{ session, user, isLoading, signIn, signUp, signOut }}
		>
			{children}
		</AuthContext.Provider>
	);
};

/**
 * Custom hook to access the authentication context
 *
 * This hook provides a convenient way to access the authentication state and methods
 * from any component within the AuthProvider tree.
 *
 * @returns {AuthContextType} The authentication context value
 * @throws {Error} If used outside of an AuthProvider
 * @example
 * const { user, signIn, signOut } = useAuth();
 *
 * // Check if user is authenticated
 * if (user) {
 *   // User is logged in
 * }
 *
 * // Sign in a user
 * await signIn('user@example.com', 'password');
 */
export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
