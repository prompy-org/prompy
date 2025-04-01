'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/services/auth';

export default function Pricing() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleSubscribe = async (planId) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = getToken();
      
      if (!token) {
        setError('Authentication required');
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscription/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ planId })
      });

      const data = await response.json();

      if (response.ok && data.paymentLink) {
        // Redirect to payment gateway
        window.location.href = data.paymentLink;
      } else {
        setError(data.message || 'Failed to create subscription order');
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: '₹499',
      period: 'per month',
      features: [
        '100 prompts per day',
        'Basic support',
        'Access to standard templates'
      ]
    },
    {
      id: 'pro',
      name: 'Professional',
      price: '₹999',
      period: 'per month',
      features: [
        'Unlimited prompts',
        'Priority support',
        'Access to all templates',
        'Advanced customization'
      ],
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '₹2499',
      period: 'per month',
      features: [
        'Unlimited prompts',
        'Dedicated support',
        'Custom templates',
        'Team collaboration',
        'API access'
      ]
    }
  ];

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Choose Your Plan</h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
          Select the plan that best fits your needs
        </p>
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md max-w-md mx-auto">
            {error}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden ${
              plan.popular ? 'ring-2 ring-primary' : ''
            }`}
          >
            {plan.popular && (
              <div className="bg-primary text-white text-center py-2 text-sm font-medium">
                Most Popular
              </div>
            )}
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{plan.name}</h2>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-extrabold text-gray-900 dark:text-white">{plan.price}</span>
                <span className="ml-1 text-xl text-gray-500 dark:text-gray-400">{plan.period}</span>
              </div>
              <ul className="mt-6 space-y-4">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 shrink-0 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isLoading}
                  className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                >
                  {isLoading ? 'Processing...' : 'Subscribe Now'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}