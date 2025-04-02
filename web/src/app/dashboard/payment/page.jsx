'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { load } from '@cashfreepayments/cashfree-js';

export default function Payment() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      setError('Invalid payment session');
      setIsLoading(false);
      return;
    }

    const initializePayment = async () => {
      try {
        // Load Cashfree SDK
        const cashfree = await load({
          mode: "sandbox" // Change to "production" for production environment
        });
        
        // Configure checkout options
        const checkoutOptions = {
          paymentSessionId: sessionId,
          redirectTarget: "_self",
          onSuccess: (data) => {
            // Payment successful, redirect to callback page
            const orderId = localStorage.getItem('pendingOrderId');
            router.push(`/dashboard/payment/callback?order_id=${orderId}`);
          },
          onFailure: (data) => {
            console.error('Payment failed:', data);
            setError('Payment failed. Please try again.');
            setIsLoading(false);
          },
          onClose: () => {
            // User closed the payment form
            router.push('/dashboard/pricing');
          }
        };
        
        // Initialize checkout
        cashfree.checkout(checkoutOptions);
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing payment:', error);
        setError('Failed to initialize payment gateway');
        setIsLoading(false);
      }
    };

    initializePayment();
  }, [sessionId, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
          Complete Your Payment
        </h1>
        
        {isLoading && (
          <div className="flex flex-col items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading payment gateway...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => router.push('/dashboard/pricing')}
                className="bg-primary text-white py-2 px-4 rounded hover:bg-primary/90"
              >
                Back to Plans
              </button>
            </div>
          </div>
        )}
        
        <div id="payment-form" className="min-h-[300px]"></div>
      </div>
    </div>
  );
}
