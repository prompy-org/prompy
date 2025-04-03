'use client';

import { useState } from 'react';
import RazorpayPayment from '@/components/RazorpayPayment';
import Link from 'next/link';

export default function PricingPage() {
  
  const plans = [
    {
      id: 'plan_basic',
      name: 'Basic',
      description: 'Perfect for individuals',
      duration: ' For lifetime',
      amount: 0,
      features: [
        'Up to 50 prompts',
        'Basic templates',
        'Email support'
      ]
    },
    {
      id: 'one_time_payment_plan',
      name: 'Advanced',
      description: 'Get 500 prompts with lifetime access',
      duration: ' One-time payment',
      amount: 353,
      popular: true,
      features: [
        '500 prompts',
        'Advanced templates',
        'Priority support',
        'API access'
      ]
    }, 
    {
      id: 'unlimited_monthly',
      name: 'Unlimited Monthly',
      description: 'Unlimited prompts, monthly subscription',
      duration: ' For a month',
      amount: 153,
      features: [
        'Unlimited prompts',
        'Advanced templates',
        'Priority support',
        'API access'
      ]
    },
    {
      id: 'unlimited_quarterly',
      name: 'Unlimited Quarterly',
      description: 'Unlimited prompts, quarterly subscription',
      duration: ' For 3 months',
      amount: 453,
      features: [
        'Unlimited prompts',
        'Advanced templates',
        'Priority support',
        'API access'
      ]
    },
    {
      id: 'unlimited_yearly',
      name: 'Unlimited Yearly',
      description: 'Unlimited prompts, yearly subscription',
      duration: ' For a year',
      amount: 1653,
      features: [
        'Unlimited prompts',
        'Advanced templates',
        'Priority support',
        'API access'
      ]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Select the perfect plan for your needs. All plans include access to our core features.
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => {          
          return (
            <div 
              key={plan.id}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden ${
                plan.popular ? 'ring-2 ring-primary' : ''
              }`}
            >
              {plan.popular && (
                <div className="bg-primary text-white text-center py-1 text-sm font-medium">
                  Most Popular
                </div>
              )}
              
              <div className="p-6">
                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">{plan.description}</p>
                
                <div className="mb-6">
                  <span className="text-3xl font-bold">₹{plan.amount}</span>
                  <span className="text-gray-500 dark:text-gray-400">{plan.duration}</span>
                </div>
                
                { plan.id === 'plan_basic' ? (
                  <Link  href="/dashboard" className="w-full bg-primary text-white py-2 px-4 rounded hover:bg-primary/90">
                    Get Started
                  </Link>
                ) : <RazorpayPayment
                  amount={plan.amount}
                  planName={plan.name}
                  planId={plan.id}
                  isSubscription={false}
                />}
                
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg 
                        className="h-5 w-5 text-green-500 mr-2" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M5 13l4 4L19 7" 
                        />
                      </svg>
                      <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-16 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
        <h2 className="text-xl font-bold mb-4">Need a custom solution?</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Contact us for enterprise pricing and custom features tailored to your organization's needs.
        </p>
        <button className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white py-2 px-4 rounded hover:bg-gray-300 dark:hover:bg-gray-600">
          Contact Sales
        </button>
      </div>
    </div>
  );
}