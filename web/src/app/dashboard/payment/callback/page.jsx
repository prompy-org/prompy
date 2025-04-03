'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { getToken } from '@/services/auth';
import PaymentStatus from '@/components/PaymentStatus';

export default function PaymentCallback() {
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get Razorpay parameters from URL
  const razorpayPaymentId = searchParams.get('razorpay_payment_id');
  const razorpayOrderId = searchParams.get('razorpay_order_id');
  const razorpaySubscriptionId = searchParams.get('razorpay_subscription_id');
  const razorpaySignature = searchParams.get('razorpay_signature');

  useEffect(() => {
    if (!(razorpayOrderId || razorpaySubscriptionId)) {
      setStatus('failed');
      setError('Invalid order or subscription ID');
      return;
    }

    const verifyPayment = async () => {
      try {
        const token = getToken();
        if (!token) {
          router.push('/login');
          return;
        }

        let response;
        
        // If we have Razorpay signature parameters, verify the payment directly
        if (razorpayPaymentId && razorpayOrderId && razorpaySignature) {
          response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/payment/verify-payment`, {
            razorpay_payment_id: razorpayPaymentId,
            razorpay_order_id: razorpayOrderId,
            razorpay_signature: razorpaySignature
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } 
        else if (razorpaySubscriptionId) {
          response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/subscription/verify-subscription`, {
            razorpay_subscription_id: razorpaySubscriptionId,
            razorpay_payment_id: razorpayPaymentId,
            razorpay_signature: razorpaySignature
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }        

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
  }, [razorpayOrderId, razorpayPaymentId, razorpaySignature, razorpaySubscriptionId, router]);

  const [timeLeft, setTimeLeft] = useState(5);

  useEffect(() => {
    if (status === 'success' && timeLeft > 0) {
      const timerId = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);

      return () => clearTimeout(timerId); // Cleanup on unmount or re-run
    }
  }, [timeLeft, status]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 bg-background">
      <div className="w-full max-w-md p-6 bg-secondary rounded-lg shadow-lg border border-border">
        <h1 className="text-2xl font-bold text-center mb-6 text-foreground">
          Payment Verification
        </h1>
        
        {status === 'processing' && (
          <div className="flex flex-col items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Verifying your payment...</p>
          </div>
        )}
        
        {status === 'success' && (
          <div>
            <PaymentStatus 
              status="success" 
              message={
                <>
                  Your subscription has been activated.
                  {subscription && (
                    <div className="mt-4 text-muted-foreground">
                      <p>Plan: {subscription.planId}</p>
                      {subscription.endDate && (
                        <p>Valid until: {new Date(subscription.endDate).toLocaleDateString()}</p>
                      )}
                      <p className="mt-4">Redirecting to dashboard in {timeLeft}...</p>
                    </div>
                  )}
                </>
              }
              redirectPath="/dashboard"
            />
          </div>
        )}
        
        {status === 'failed' && (
          <PaymentStatus 
            status="error" 
            message={error} 
            redirectPath="/dashboard/pricing" 
          />
        )}
      </div>
    </div>
  );
}
