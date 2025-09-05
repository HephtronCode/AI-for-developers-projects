'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../contexts/auth-context';
import { Button } from './ui/button';

export default function Navbar() {
  const pathname = usePathname();
  const { session, signOut } = useAuth();
  const user = session?.user;
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
    <nav className="glass sticky top-0 z-50 backdrop-blur-md border-b border-glass-border">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 font-bold text-xl" onClick={closeMenu}>
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center glow">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="gradient-text">Polly</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              href="/polls" 
              className={`px-3 py-2 rounded-lg font-medium transition-all duration-300 ${
                isActive('/polls') 
                  ? 'bg-primary/10 text-primary glow-text' 
                  : 'text-foreground/80 hover:text-foreground hover:bg-accent/30'
              }`}
            >
              Polls
            </Link>
            
            {user ? (
              <>
                <Link 
                  href="/polls/create" 
                  className={`px-3 py-2 rounded-lg font-medium transition-all duration-300 ${
                    isActive('/polls/create') 
                      ? 'bg-primary/10 text-primary glow-text' 
                      : 'text-foreground/80 hover:text-foreground hover:bg-accent/30'
                  }`}
                >
                  Create Poll
                </Link>
                <div className="flex items-center space-x-4">
                  <span className="text-sm">Welcome, <span className="font-medium">{user.email?.split('@')[0]}</span></span>
                  <Button 
                    variant="outline" 
                    onClick={handleSignOut}
                    className="border-glass-border bg-background/50 hover:bg-accent/30 transition-all duration-300"
                  >
                    Sign Out
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/sign-in">
                  <Button variant="ghost" className="text-foreground/80 hover:text-foreground hover:bg-accent/30 transition-all duration-300">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/sign-up">
                  <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md bg-background/50 border border-glass-border hover:bg-accent/30 focus:outline-none transition-all duration-300"
            >
              <span className="sr-only">Open main menu</span>
              {/* Hamburger icon */}
              <svg
                className={`h-6 w-6 text-primary transition-all duration-300 ${isMenuOpen ? 'rotate-90' : ''}`}
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
      <div className={`md:hidden glass border-t border-glass-border overflow-hidden transition-all duration-300 ${isMenuOpen ? 'max-h-96' : 'max-h-0'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link
            href="/polls"
            className={`block px-3 py-2 rounded-lg font-medium transition-all duration-300 ${
              isActive('/polls') 
                ? 'bg-primary/10 text-primary glow-text' 
                : 'text-foreground/80 hover:text-foreground hover:bg-accent/30'
            }`}
            onClick={closeMenu}
          >
            Polls
          </Link>
          
          {user ? (
            <>
              <Link
                href="/polls/create"
                className={`block px-3 py-2 rounded-lg font-medium transition-all duration-300 ${
                  isActive('/polls/create') 
                    ? 'bg-primary/10 text-primary glow-text' 
                    : 'text-foreground/80 hover:text-foreground hover:bg-accent/30'
                }`}
                onClick={closeMenu}
              >
                Create Poll
              </Link>
              <div className="px-3 py-2 text-sm border-t border-glass-border mt-2 pt-2">
                Welcome, <span className="font-medium">{user.email?.split('@')[0]}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="block w-full text-left px-3 py-2 rounded-lg text-foreground/80 hover:text-foreground hover:bg-accent/30 transition-all duration-300"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/sign-in"
                className="block px-3 py-2 rounded-lg text-foreground/80 hover:text-foreground hover:bg-accent/30 transition-all duration-300"
                onClick={closeMenu}
              >
                Sign In
              </Link>
              <Link
                href="/auth/sign-up"
                className="block px-3 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 transition-all duration-300"
                onClick={closeMenu}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}