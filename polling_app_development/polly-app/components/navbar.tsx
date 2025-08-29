'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../contexts/auth-context';
import { Button } from './ui/button';

export default function Navbar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      closeMenu();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="bg-background border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="font-bold text-xl" onClick={closeMenu}>
            Polly
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/polls" className={`px-3 py-2 rounded-md ${isActive('/polls') ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'}`}>
              Polls
            </Link>
            
            {user ? (
              <>
                <Link href="/polls/create" className={`px-3 py-2 rounded-md ${isActive('/polls/create') ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'}`}>
                  Create Poll
                </Link>
                <Button variant="ghost" onClick={handleSignOut}>
                  Sign Out
                </Button>
                <span className="text-sm font-medium">{user.name}</span>
              </>
            ) : (
              <>
                <Link href="/auth/sign-in">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/auth/sign-up">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md hover:bg-accent/50 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {/* Hamburger icon */}
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/polls"
              className={`block px-3 py-2 rounded-md ${isActive('/polls') ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'}`}
              onClick={closeMenu}
            >
              Polls
            </Link>
            
            {user ? (
              <>
                <Link
                  href="/polls/create"
                  className={`block px-3 py-2 rounded-md ${isActive('/polls/create') ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'}`}
                  onClick={closeMenu}
                >
                  Create Poll
                </Link>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-3 py-2 rounded-md hover:bg-accent/50"
                >
                  Sign Out
                </button>
                <div className="px-3 py-2 text-sm font-medium">
                  Signed in as: {user.name}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/auth/sign-in"
                  className="block px-3 py-2 rounded-md hover:bg-accent/50"
                  onClick={closeMenu}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/sign-up"
                  className="block px-3 py-2 rounded-md hover:bg-accent/50"
                  onClick={closeMenu}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}