'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import GoogleLogin from '@/components/GoogleLogin';
import Image from 'next/image';
import Link from 'next/link';

export default function Login() {
  const router = useRouter();
  
  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 bg-secondary rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image 
              src="/extension-preview.png" 
              alt="Prompy Logo" 
              width={128} 
              height={128} 
              className="h-32 w-auto"
            />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Welcome to Prompy</h1>
          <p className="text-muted-foreground mt-2">Your AI Prompt Manager</p>
        </div>
        
        <div className="space-y-6">
          <GoogleLogin onLoginSuccess={() => router.push('/dashboard')} />
          
          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              By signing in, you agree to our{' '}
              <Link href="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
