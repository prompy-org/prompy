'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {load} from '@cashfreepayments/cashfree-js';

export default function SubscriptionButton({ planId, className }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubscribe = async () => {
    try {
      setIsLoading(true);
      
      // Get auth token from localStorage or cookies
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        // Redirect to login if not authenticated
        router.push('/login');
        return;
      }
      
      // Create subscription order
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscription/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ planId })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create subscription');
      }
      
      if (data.paymentSessionId) {
        const cashfree = await load({
          mode:"sandbox" //or production
        });
        let checkoutOptions = {
          paymentSessionId: data.paymentSessionId,
          redirectTarget: "_self" //optional (_self or _blank)
        }
        cashfree.checkout(checkoutOptions)

      } else {
        // Handle case where no payment link is returned
        console.error('No payment Session ID received');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Failed to process subscription. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    <button
      onClick={handleSubscribe}
      disabled={isLoading}
      className={`${className} ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
    >
      {isLoading ? 'Processing...' : 'Get Unlimited Access'}
    </button>
    </>
  );
}