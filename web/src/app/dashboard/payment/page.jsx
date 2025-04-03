'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Script from 'next/script';

export default function Payment() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const amount = searchParams.get('amount');
  const currency = searchParams.get('currency');

  useEffect(() => {
    if (!orderId) {
      setError('Invalid payment session');
      setIsLoading(false);
      return;
    }

    const initializePayment = async () => {
      try {
        // Initialize Razorpay checkout
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: amount,
          currency: currency,
          name: 'Prompy',
          description: 'Subscription Payment',
          order_id: orderId,
          handler: function (response) {
            // Redirect to callback page with order ID
            router.push(`/dashboard`);
          },
          prefill: {
            name: '',
            email: '',
            contact: ''
          },
          theme: {
            color: '#3399cc'
          },
          modal: {
            ondismiss: function() {
              router.push('/dashboard/pricing');
            }
          }
        };

        const paymentObject = new Razorpay(options);
        paymentObject.open();
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing payment:', error);
        setError('Failed to initialize payment gateway');
        setIsLoading(false);
      }
    };

    initializePayment();
  }, [orderId, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
      />
      <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
          Processing Payment
        </h1>
        
        {isLoading && (
          <div className="flex flex-col items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Initializing payment gateway...</p>
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
