'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import axios from 'axios';
import { getToken } from '@/services/auth';
import { cancelOrder, createOrder } from '@/services/paymentService';

export default function RazorpayPayment({ 
  amount, 
  currency = 'INR', 
  planName, 
  planId = null, 
  isSubscription = false,
  buttonText = 'Pay',
  onBeforePayment = () => true
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderId, setOrderId] = useState(null);

  const onCreateOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = getToken();
      if (!token) {
        window.location.href = '/login';
        return;
      }
      
      const endpoint = isSubscription 
        ? '/api/subscription/create-subscription'
        : '/api/payment/create-order';
        
      const payload = isSubscription 
        ? {
            plan_id: planId,
            total_count: 12, // 12 billing cycles
            customer_notify: 0,
            notes: { planName }
          }
        : {
            planId,
            amount,
            currency,
            receipt: `receipt_${Date.now()}`,
            notes: { planName }
          };
      
      const response = await createOrder(payload);
      
      if (response.success) {
        const orderData = isSubscription 
          ? response.subscription 
          : response.order;
          
        setOrderId(orderData.orderId);
        
        // Store order ID in localStorage to handle page refreshes
        localStorage.setItem('pendingOrderId', orderData.orderId);
        
        return orderData;
      } else {
        throw new Error(response.message || 'Failed to create order');
      }
    } catch (err) {
      if (err?.response?.message) setError(err.response.message);
      else setError(err.message || 'Something went wrong');
      
      console.log('Error creating order:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {

    if (onBeforePayment && !onBeforePayment()) return;

    const orderData = await onCreateOrder();
    
    if (!orderData) return;
    const RAZORPAY_KEY = process.env.NODE_ENV === 'PROD' ? process.env.NEXT_PUBLIC_PROD_RAZORPAY_KEY_ID : process.env.NEXT_PUBLIC_DEV_RAZORPAY_KEY_ID;

    const options = {
      key: RAZORPAY_KEY,
      name: 'Prompy',
      description: `Purchase of ${planName}`,
      image: '/extension-preview.png',
      theme: { color: '#4c6ef5' },
      
      // For one-time payments
      ...(isSubscription ? {} : {
        amount: amount * 100, // Convert to paise
        currency,
        order_id: orderData.orderId,
      }),
      
      // For subscriptions
      ...(isSubscription ? {
        subscription_id: orderData.orderId,
      } : {}),
      
      handler: function(response) {
        // Redirect to callback page with parameters
        const params = new URLSearchParams();
        
        if (isSubscription) {
          params.append('razorpay_payment_id', response.razorpay_payment_id);
          params.append('razorpay_subscription_id', response.razorpay_subscription_id);
          params.append('razorpay_signature', response.razorpay_signature);
        } else {
          params.append('razorpay_payment_id', response.razorpay_payment_id);
          params.append('razorpay_order_id', response.razorpay_order_id);
          params.append('razorpay_signature', response.razorpay_signature);
        }
                
        window.location.href = `/dashboard/payment/callback?${params.toString()}`;
      },
      
      prefill: {
        name: '',
        email: '',
        contact: ''
      },
      
      notes: {
        planName
      },
      
      modal: {
        ondismiss: async function() {
          await cancelOrder({
            razorpay_order_id: orderData.orderId,
          });
          console.log('Payment dismissed');
        }
      }
    };

    const paymentObject = new Razorpay(options);
    paymentObject.open();
  };

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
      
      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full bg-primary cursor-pointer text-white py-2 px-4 rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <span className="animate-spin h-4 w-4 mr-2 border-b-2 border-white rounded-full"></span>
            Processing...
          </span>
        ) : (
          <span>
            {buttonText} {currency} {amount}
          </span>
        )}
      </button>
      
      {error && (
        <div className="mt-2 text-red-500 text-sm">
          {error}
        </div>
      )}
    </>
  );
}