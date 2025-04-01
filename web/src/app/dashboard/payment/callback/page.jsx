'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getToken } from '@/services/auth';

export default function PaymentCallback() {
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Verifying payment...');
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!orderId) {
        setStatus('error');
        setMessage('Invalid order information');
        return;
      }

      try {
        // Get auth token
        const token = getToken();
        
        if (!token) {
          setStatus('error');
          setMessage('Authentication required');
          return;
        }

        // Verify payment with backend
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscription/verify/${orderId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setStatus('success');
          setMessage('Payment successful! Your subscription is now active.');
        } else {
          setStatus('pending');
          setMessage('Payment is being processed. We will notify you once it is confirmed.');
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        setStatus('error');
        setMessage('Failed to verify payment. Please contact support.');
      }
    };

    verifyPayment();
  }, [orderId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        {status === 'loading' && (
          <div className="animate-pulse">
            <div className="h-12 w-12 mx-auto rounded-full bg-blue-200 dark:bg-blue-700 mb-4"></div>
            <h2 className="text-xl font-bold mb-4">Processing Payment</h2>
            <p className="text-gray-600 dark:text-gray-300">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div className="h-12 w-12 mx-auto rounded-full bg-green-500 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-4">Payment Successful!</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
            <Link 
              href="/dashboard" 
              className="inline-block bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90"
            >
              Go to Dashboard
            </Link>
          </div>
        )}

        {status === 'pending' && (
          <div>
            <div className="h-12 w-12 mx-auto rounded-full bg-yellow-500 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-4">Payment Processing</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
            <Link 
              href="/dashboard" 
              className="inline-block bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90"
            >
              Return to Dashboard
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div className="h-12 w-12 mx-auto rounded-full bg-red-500 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-4">Payment Error</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/dashboard/pricing" 
                className="inline-block bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90"
              >
                Try Again
              </Link>
              <Link 
                href="/dashboard/support" 
                className="inline-block border border-gray-300 dark:border-gray-600 px-6 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Contact Support
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}