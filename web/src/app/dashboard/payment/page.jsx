'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { ArrowLeft } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

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
        const RAZORPAY_KEY = process.env.ENV === 'PROD' ? process.env.NEXT_PUBLIC_PROD_RAZORPAY_KEY_ID : process.env.NEXT_PUBLIC_DEV_RAZORPAY_KEY_ID;
        const options = {
          key: RAZORPAY_KEY,
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
            color: '#4c6ef5' // Match primary color from globals.css
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
  }, [orderId, router, amount, currency]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 bg-background">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="beforeInteractive"
      />
      <div className="w-full max-w-md p-8 bg-secondary rounded-lg shadow-lg border border-border">
        <h1 className="text-2xl font-bold text-center mb-6 text-foreground">
          Processing Payment
        </h1>
        
        {isLoading && (
          <div className="flex flex-col items-center py-8">
            <LoadingSpinner size="large" className="mb-4" />
            <p className="text-muted-foreground">Initializing payment gateway...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-accent border border-red-400 text-red-700 dark:text-red-400 px-6 py-4 rounded-md mb-6">
            <p className="font-medium">{error}</p>
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => router.push('/dashboard/pricing')}
                className="flex items-center gap-2 bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
              >
                <ArrowLeft size={16} />
                Back to Plans
              </button>
            </div>
          </div>
        )}
        
        <div id="payment-form" className="min-h-[200px]"></div>
      </div>
      
      <div className="mt-6 text-sm text-muted-foreground">
        <p>Having trouble? <button 
          onClick={() => router.push('/dashboard/pricing')} 
          className="text-primary hover:underline"
        >
          Return to pricing page
        </button></p>
      </div>
    </div>
  );
}
