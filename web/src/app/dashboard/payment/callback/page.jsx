'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { getToken } from '@/services/auth';

export default function PaymentCallback() {
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    if (!orderId) {
      setStatus('failed');
      setError('Invalid order ID');
      return;
    }

    const verifyPayment = async () => {
      try {
        const token = getToken();
        if (!token) {
          router.push('/login');
          return;
        }

        // First check if webhook has already processed the payment
        const response = await axios.get(`/api/subscription/verify/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          setStatus('success');
          setSubscription(response.data.subscription);
          
          // Clear the pending order ID from localStorage
          localStorage.removeItem('pendingOrderId');
          
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            router.push('/dashboard');
          }, 5000);
        } else {
          setStatus('failed');
          setError(`Payment ${response.data.status || 'failed'}. Please try again.`);
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        setStatus('failed');
        setError('Failed to verify payment status. Please contact support.');
      }
    };

    verifyPayment();
  }, [orderId, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
          Payment Verification
        </h1>
        
        {status === 'processing' && (
          <div className="flex flex-col items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Verifying your payment...</p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Payment Successful!</p>
            <p className="mt-2">Your subscription has been activated.</p>
            {subscription && (
              <div className="mt-4">
                <p>Plan: {subscription.planId}</p>
                {subscription.endDate && (
                  <p>Valid until: {new Date(subscription.endDate).toLocaleDateString()}</p>
                )}
              </div>
            )}
            <div className="mt-4 flex justify-center">
              <p>Redirecting to dashboard...</p>
            </div>
          </div>
        )}
        
        {status === 'failed' && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Payment Verification Failed</p>
            <p className="mt-2">{error}</p>
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
      </div>
    </div>
  );
}
