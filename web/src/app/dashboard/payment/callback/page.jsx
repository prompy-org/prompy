'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getToken } from '@/services/auth';
import PaymentStatus from '@/components/PaymentStatus';
import { verifyPayment } from '@/services/paymentService';

export default function PaymentCallback() {
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get Razorpay parameters from URL
  const razorpayPaymentId = searchParams.get('razorpay_payment_id');
  const razorpayOrderId = searchParams.get('razorpay_order_id');
  const razorpaySignature = searchParams.get('razorpay_signature');

  useEffect(() => {
    if (!(razorpayOrderId || razorpaySubscriptionId)) {
      setStatus('failed');
      setError('Invalid order or subscription ID');
      return;
    }

    const handleVerifyPayment = async () => {
      try {
        setIsLoading(true);
        const token = getToken();
        if (!token) {
          router.push('/login');
          return;
        }

        let response;
        
        // If we have Razorpay signature parameters, verify the payment directly
        if (razorpayPaymentId && razorpayOrderId && razorpaySignature) {
          response = await verifyPayment({
            razorpay_payment_id: razorpayPaymentId,
            razorpay_order_id: razorpayOrderId,
            razorpay_signature: razorpaySignature
          });
        }      

        if (response.success) {
          setStatus('success');
          
          // Clear the pending order ID from localStorage
          localStorage.removeItem('pendingOrderId');
          
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            router.push('/dashboard');
          }, 5000);
        } else {
          setStatus('failed');
          setError(`Payment ${response.status || 'failed'}. Please try again.`);
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        setStatus('failed');
        setError('Failed to verify payment status. Please contact support.');
      } finally {
        setIsLoading(false);
      }
    };

    !isLoading && handleVerifyPayment();
  }, [razorpayOrderId, razorpayPaymentId, razorpaySignature, razorpaySubscriptionId, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 bg-background">
      <div className="w-full max-w-md p-6 bg-secondary rounded-lg shadow-lg border border-border">
        <h1 className="text-2xl font-bold text-center mb-6 text-foreground">
          Payment Verification
        </h1>
        
        {status === 'processing' || isLoading && (
          <div className="flex flex-col items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Verifying your payment...</p>
          </div>
        )}
        
        {status === 'success' && (
          <div>
            <PaymentStatus 
              status="success" 
              message={'Payment verified successfully.'}
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
