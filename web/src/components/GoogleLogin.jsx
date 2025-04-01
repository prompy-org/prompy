'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function GoogleLogin({ onLoginSuccess }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setError(null);
    
    // Generate a random state value for security
    const state = Math.random().toString(36).substring(2, 15);
    
    // Store state in localStorage for verification
    localStorage.setItem('oauthState', state);
    
    // Get the current origin for the redirect
    const origin = window.location.origin;
    
    // Open Google OAuth login page
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google/web?state=${state}&redirect_url=${encodeURIComponent(`${origin}/auth/callback`)}`;
  };

  return (
    <div className="flex flex-col items-center">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <button
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="flex items-center justify-center gap-2 w-full max-w-xs bg-white text-gray-700 border border-gray-300 rounded-md px-4 py-2 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-t-2 border-primary border-solid rounded-full animate-spin"></div>
        ) : (
          <span className="google-icon">G</span>
        )}
        <span>Sign in with Google</span>
      </button>
    </div>
  );
}