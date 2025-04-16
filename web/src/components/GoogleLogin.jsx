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
    console.log('origin', origin);
    
    
    // Open Google OAuth login page
    window.location.href = `${process.env.NODE_ENV === 'PROD' ? process.env.NEXT_PUBLIC_PROD_API_URL : process.env.NEXT_PUBLIC_DEV_API_URL}/api/auth/google/web?state=${state}&redirect_url=${encodeURIComponent(`${origin}/auth/callback`)}`;
  };

  return (
    <div className="flex flex-col items-center">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4 w-full text-sm">
          <p className="font-medium">Authentication Error</p>
          <p>{error}</p>
        </div>
      )}
      
      <button
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="flex items-center cursor-pointer justify-center gap-3 w-full bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-md px-4 py-3 shadow-sm border border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        aria-label="Sign in with Google"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-t-2 border-primary border-solid rounded-full animate-spin"></div>
        ) : (
          <div className="flex items-center justify-center">
            <Image 
              src="/google-logo.svg" 
              alt="Google" 
              width={20} 
              height={20} 
              className="mr-2"
            />
          </div>
        )}
        <span>Sign in with Google</span>
      </button>
      
      {/* <div className="relative w-full my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-secondary px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>
      
      <button
        onClick={() => {
          // This is a placeholder for demo purposes
          // In a real app, you might want to implement a demo account login
          setIsLoading(true);
          setTimeout(() => {
            localStorage.setItem('authToken', 'demo-token');
            if (onLoginSuccess) onLoginSuccess();
            router.push('/dashboard');
          }, 1000);
        }}
        disabled={isLoading}
        className="flex items-center justify-center w-full bg-secondary hover:bg-accent text-foreground font-medium rounded-md px-4 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-t-2 border-primary border-solid rounded-full animate-spin"></div>
        ) : (
          "Try Demo Account"
        )}
      </button> */}
    </div>
  );
}
