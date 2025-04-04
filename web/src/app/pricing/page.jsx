'use client';

import { useState } from 'react';
import RazorpayPayment from '@/components/RazorpayPayment';
import Link from 'next/link';
import plans from '@/constants/plans';

export default function PricingPage() {

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 bg-background text-foreground">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Select the perfect plan for your needs. All plans include access to our core features.
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => {          
          return (
            <div 
              key={plan.id}
              className={`bg-secondary text-secondary-foreground rounded-lg shadow-lg overflow-hidden ${
                plan.popular ? 'ring-2 ring-primary' : ''
              }`}
            >
              {plan.popular && (
                <div className="bg-primary text-primary-foreground text-center py-1 text-sm font-medium">
                  Most Popular
                </div>
              )}
              
              <div className="p-6">
                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                <p className="text-muted-foreground mb-4">{plan.description}</p>
                
                <div className="mb-6">
                  <span className="text-3xl font-bold">₹{plan.amount}</span>
                  <span className="text-muted-foreground">{plan.duration}</span>
                </div>
                
                { plan.id === 'plan_basic' ? (
                  <Link href="/dashboard" className="block w-full text-center bg-primary text-primary-foreground py-2 px-4 rounded hover:bg-primary/90 transition-colors">
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
                        className="h-5 w-5 text-accent-foreground mr-2" 
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
                      <span className="text-secondary-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-16 bg-secondary text-secondary-foreground rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
        <h2 className="text-xl font-bold mb-4">Need a custom solution?</h2>
        <p className="text-muted-foreground mb-6">
          Contact us for enterprise pricing and custom features tailored to your organization's needs.
        </p>
        <button className="bg-accent text-accent-foreground py-2 px-4 rounded hover:bg-accent/80 transition-colors">
          Contact Sales
        </button>
      </div>
    </div>
  );
}
