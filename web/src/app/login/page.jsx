'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import GoogleLogin from '@/components/GoogleLogin';

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome to Prompy</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Please log in!</p>
        </div>
        
        <div className="space-y-6">
          <GoogleLogin />
        </div>
      </div>
    </div>
  );
}