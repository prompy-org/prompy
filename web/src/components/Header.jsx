'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isAuthenticated, logout } from "@/services/auth";
import { Menu, X, ChevronDown, User, LogOut } from "lucide-react";
import ThemeToggle from './ThemeToggle';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, [pathname]);

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    setIsUserMenuOpen(false);
    window.location.href = "/";
  };

  const closeMenus = () => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  return (
    <header className="py-4 px-6 border-b border-border sticky top-0 bg-background z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/" className="font-bold text-xl text-primary">
          Prompy
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:block">
          <ul className="flex items-center gap-6">
            <li>
              <ThemeToggle />
            </li>
            <li>
              <Link 
                href="/#features" 
                className="hover:text-primary transition-colors"
                onClick={closeMenus}
              >
                Features
              </Link>
            </li>
            <li>
              <Link 
                href="/pricing" 
                className="hover:text-primary transition-colors"
                onClick={closeMenus}
              >
                Pricing
              </Link>
            </li>
            {isLoggedIn ? (
              <>
                <li>
                  <Link 
                    href="/dashboard" 
                    className="hover:text-primary transition-colors"
                    onClick={closeMenus}
                  >
                    Dashboard
                  </Link>
                </li>
                <li className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-1 hover:text-primary transition-colors"
                  >
                    <User size={18} />
                    <span>Account</span>
                    <ChevronDown size={16} />
                  </button>
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-md shadow-lg py-1 z-10">
                      <Link 
                        href="/dashboard/settings" 
                        className="block px-4 py-2 hover:bg-accent hover:text-accent-foreground transition-colors"
                        onClick={closeMenus}
                      >
                        Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut size={16} />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link 
                    href="/login" 
                    className="hover:text-primary transition-colors"
                    onClick={closeMenus}
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link 
                    href={`https://chrome.google.com/webstore/detail/prompy/${process.env.ENV === 'PROD' ? process.env.NEXT_PUBLIC_PROD_EXTENSION_ID : process.env.NEXT_PUBLIC_DEV_EXTENSION_ID}`}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={closeMenus}
                  >
                    Get Started
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>

        <div className="flex items-center gap-4 md:hidden">
          {/* Mobile Theme Toggle */}
          <div>
            <ThemeToggle />
          </div>
          {/* Mobile Menu Button */}
          <button 
            className="text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden absolute left-0 right-0 top-[73px] bg-background border-b border-border z-50">
          <nav className="max-w-6xl mx-auto py-4 px-6">
            <ul className="flex flex-col gap-4">
              <li>
                <Link 
                  href="/#features" 
                  className="block py-2 hover:text-primary transition-colors"
                  onClick={closeMenus}
                >
                  Features
                </Link>
              </li>
              <li>
                <Link 
                  href="/pricing" 
                  className="block py-2 hover:text-primary transition-colors"
                  onClick={closeMenus}
                >
                  Pricing
                </Link>
              </li>
              {isLoggedIn ? (
                <>
                  <li>
                    <Link 
                      href="/dashboard" 
                      className="block py-2 hover:text-primary transition-colors"
                      onClick={closeMenus}
                    >
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/dashboard/settings" 
                      className="block py-2 hover:text-primary transition-colors"
                      onClick={closeMenus}
                    >
                      Settings
                    </Link>
                  </li>
                  <li className="border-t border-border mt-2 pt-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 py-2 text-red-500"
                    >
                      <LogOut size={18} />
                      <span>Logout</span>
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link 
                      href="/login" 
                      className="block py-2 hover:text-primary transition-colors"
                      onClick={closeMenus}
                    >
                      Login
                    </Link>
                  </li>
                  <li className="mt-2">
                    <Link 
                      href={`https://chrome.google.com/webstore/detail/prompy/${process.env.ENV === 'PROD' ? process.env.NEXT_PUBLIC_PROD_EXTENSION_ID : process.env.NEXT_PUBLIC_DEV_EXTENSION_ID}`}
                      className="block bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors text-center"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={closeMenus}
                    >
                      Get Started
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
