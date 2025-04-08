'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RazorpayPayment from '@/components/RazorpayPayment';
import Link from 'next/link';
import plans from '@/constants/plans';
import { Check, Crown, AlertCircle } from 'lucide-react';
import { getToken } from '@/services/auth';
import axios from 'axios';

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [userSubscription, setUserSubscription] = useState(null);
  const [isAdvancedUser, setIsAdvancedUser] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  
  // Filter plans by type
  const basicPlan = plans.find(plan => plan.id === 'plan_basic');
  const extendedPlan = plans.find(plan => plan.id === 'one_time_payment_plan');
  
  // Get all unlimited plans
  const unlimitedPlans = {
    monthly: plans.find(plan => plan.id === 'unlimited_monthly'),
    quarterly: plans.find(plan => plan.id === 'unlimited_quarterly'),
    yearly: plans.find(plan => plan.id === 'unlimited_yearly')
  };
  
  // Get current selected unlimited plan
  const currentUnlimitedPlan = unlimitedPlans[selectedPlan];

  // Check if user is logged in and get subscription status
  useEffect(() => {
    const fetchUserSubscription = async () => {
      const token = getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/user/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Get subscription plan ID (for unlimited plans)
        response.data.subscription.isActive && setUserSubscription(response.data.subscription?.planId);
        
        // Get advanced user status (for one-time payment)
        setIsAdvancedUser(response.data.isAdvancedUser);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching subscription:', error);
        setIsLoading(false);
      }
    };

    fetchUserSubscription();
  }, []);

  // Handle payment button click for non-logged in users
  const handlePaymentClick = () => {
    const token = getToken();
    if (!token) {
      // Save current URL to redirect back after login
      localStorage.setItem('redirectAfterLogin', '/pricing');
      router.push('/login');
      return false;
    }
    return true;
  };

  // Check if user already has extended plan (one-time payment)
  const hasExtendedPlan = isAdvancedUser;
  
  // Check if user has any active subscription (unlimited plans)
  const hasActiveSubscription = userSubscription && 
    userSubscription !== 'plan_basic';

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 bg-background text-foreground">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Select the perfect plan for your needs. All plans include access to our core features.
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        {/* Basic Plan */}
        <div className="bg-secondary text-secondary-foreground rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <h3 className="text-xl font-bold mb-1">{basicPlan.name}</h3>
            <p className="text-muted-foreground mb-4">{basicPlan.description}</p>
            
            <div className="mb-6">
              <span className="text-3xl font-bold">₹{basicPlan.amount}</span>
              <span className="text-muted-foreground">{basicPlan.duration}</span>
            </div>
            
            <Link href="/dashboard" className="block w-full text-center bg-primary text-primary-foreground py-2 px-4 rounded hover:bg-primary/90 transition-colors">
              Get Started
            </Link>
            
            <ul className="mt-6 space-y-3">
              {basicPlan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="h-5 w-5 text-accent-foreground mr-2" />
                  <span className="text-secondary-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Extended Plan */}
        <div className="bg-secondary text-secondary-foreground rounded-lg shadow-lg overflow-hidden ring-2 ring-primary">
          <div className="bg-primary text-primary-foreground text-center py-1 text-sm font-medium">
            Most Popular
          </div>
          <div className="p-6">
            <h3 className="text-xl font-bold mb-1">{extendedPlan.name}</h3>
            <p className="text-muted-foreground mb-4">{extendedPlan.description}</p>
            
            <div className="mb-6">
              <span className="text-3xl font-bold">₹{extendedPlan.amount}</span>
              <span className="text-muted-foreground">{extendedPlan.duration}</span>
            </div>
            
            {isLoading ? (
              <button disabled className="w-full bg-primary/50 text-primary-foreground py-2 px-4 rounded cursor-not-allowed">
                Loading...
              </button>
            ) : hasExtendedPlan ? (
              <div className="w-full text-center bg-secondary border border-primary text-primary py-2 px-4 rounded flex items-center justify-center">
                <Check className="h-5 w-5 mr-2" />
                Already Purchased
              </div>
            ) : (
              <RazorpayPayment
                amount={extendedPlan.amount}
                planName={extendedPlan.name}
                planId={extendedPlan.id}
                isSubscription={false}
                onBeforePayment={handlePaymentClick}
              />
            )}
            
            <ul className="mt-6 space-y-3">
              {extendedPlan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="h-5 w-5 text-accent-foreground mr-2" />
                  <span className="text-secondary-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Unlimited Plan with Tabs */}
        <div className="bg-secondary text-secondary-foreground rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <h3 className="text-xl font-bold mb-1 flex items-center">
              Unlimited
              <Crown className="ml-2 h-5 w-5 text-yellow-500" />
            </h3>
            <p className="text-muted-foreground mb-4">Unlimited prompts with premium features</p>
            
            {/* Tabs */}
            <div className="flex border border-border rounded-md mb-6">
              <button
                onClick={() => setSelectedPlan('monthly')}
                className={`flex-1 py-2 text-sm font-medium ${
                  selectedPlan === 'monthly' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary hover:bg-secondary/80'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setSelectedPlan('quarterly')}
                className={`flex-1 py-2 text-sm font-medium ${
                  selectedPlan === 'quarterly' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary hover:bg-secondary/80'
                }`}
              >
                Quarterly
              </button>
              <button
                onClick={() => setSelectedPlan('yearly')}
                className={`flex-1 py-2 text-sm font-medium ${
                  selectedPlan === 'yearly' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary hover:bg-secondary/80'
                }`}
              >
                Yearly
              </button>
            </div>
            
            <div className="mb-6">
              <span className="text-3xl font-bold">₹{currentUnlimitedPlan.amount}</span>
              <span className="text-muted-foreground">{currentUnlimitedPlan.duration}</span>
              
              {selectedPlan === 'yearly' && (
                <div className="mt-2 text-sm text-green-500 dark:text-green-400">
                  Save 10% compared to monthly billing
                </div>
              )}
            </div>
            
            {isLoading ? (
              <button disabled className="w-full bg-primary/50 text-primary-foreground py-2 px-4 rounded cursor-not-allowed">
                Loading...
              </button>
            ) : hasActiveSubscription ? (
              <div className="mb-2 p-3 bg-secondary/80 border border-primary/50 rounded-md text-sm">
                <p className="flex items-center text-primary">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  You already have an active subscription
                </p>
                <p className="mt-1 text-muted-foreground text-xs">
                  Purchasing this plan will extend your current subscription.
                </p>
              </div>
            ) : null}
            
            {!isLoading && (
              <RazorpayPayment
                amount={currentUnlimitedPlan.amount}
                planName={currentUnlimitedPlan.name}
                planId={currentUnlimitedPlan.id}
                isSubscription={false}
                onBeforePayment={handlePaymentClick}
                buttonText={hasActiveSubscription ? "Renew Subscription" : "Pay"}
              />
            )}
            
            <ul className="mt-6 space-y-3">
              {currentUnlimitedPlan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="h-5 w-5 text-accent-foreground mr-2" />
                  <span className="text-secondary-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
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
