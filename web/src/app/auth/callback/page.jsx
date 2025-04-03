'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function AuthCallback() {
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Verifying authentication...');
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const token = searchParams.get('token');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const [timer, setTimer] = useState(3);
  useEffect(() => {
    if (status === 'success') {
      const interval = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [status]);

  useEffect(() => {
    const verifyAndStoreToken = async () => {
      // Check for error parameter
      if (error) {
        setStatus('error');
        setMessage(`Authentication failed: ${error}`);
        return;
      }
      
      // Verify we have a token
      if (!token) {
        setStatus('error');
        setMessage('No authentication token received');
        return;
      }
      
      // Verify state parameter matches what we stored
      const storedState = localStorage.getItem('oauthState');
      if (state !== storedState) {
        setStatus('error');
        setMessage('Invalid authentication state');
        return;
      }
      
      try {
        // Store the token in localStorage
        localStorage.setItem('authToken', token);
        
        // Clear the state as it's no longer needed
        localStorage.removeItem('oauthState');
        
        setStatus('success');
        setMessage('Authentication successful!');
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      } catch (err) {
        setStatus('error');
        setMessage(`Failed to store authentication: ${err.message}`);
      }
    };
    
    verifyAndStoreToken();
  }, [token, state, error, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 bg-secondary rounded-lg shadow-md border border-border">
        {status === 'loading' && (
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">{message}</p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="text-center">
            <div className="h-12 w-12 mx-auto rounded-full bg-green-500 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2 text-foreground">Authentication Successful!</h2>
            <p className="text-muted-foreground mb-4">Redirecting to dashboard in... {timer} </p>
          </div>
        )}
        
        {status === 'error' && (
          <div className="text-center">
            <div className="h-12 w-12 mx-auto rounded-full bg-red-500 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2 text-foreground">Authentication Failed</h2>
            <p className="text-muted-foreground mb-6">{message}</p>
            <Link 
              href="/login" 
              className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Try Again
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return <Suspense><AuthCallback /></Suspense>
}
