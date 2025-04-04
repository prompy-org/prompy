'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SubscriptionStatus from '@/components/SubscriptionStatus';
import PromptLimitIndicator from '@/components/PromptLimitIndicator';
import Image from 'next/image';
import { useTheme } from '@/components/ThemeProvider';
import { Download, Crown } from 'lucide-react';

export default function Dashboard() {
  const [usageStats, setUsageStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { theme } = useTheme();
  
  useEffect(() => {
    const fetchUsageStats = async () => {
      try {
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          setError('Authentication required');
          setIsLoading(false);
          return;
        }
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch usage statistics');
        }
        
        const data = await response.json();
        setUsageStats(data);
      } catch (error) {
        console.error('Error fetching usage stats:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsageStats();
  }, []);
  
  // Determine if user is premium
  const isPremium = usageStats?.subscription?.planId !== 'one_time_payment_plan' && 
                   usageStats?.subscription?.isActive && 
                   usageStats?.subscription?.planId !== 'plan_basic';
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        Dashboard
        {isPremium && (
          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-200 to-yellow-500 text-yellow-800 dark:text-yellow-900">
            <Crown className="h-3 w-3 mr-1" />
            Premium
          </span>
        )}
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {/* Main dashboard content */}
          <div className="bg-secondary rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6">Manage Your Prompts</h2>
            
            <div className="text-center py-8 space-y-6">
              <div className="max-w-md mx-auto">
                <Image 
                  src="/extension-preview.png" 
                  alt="Chrome Extension" 
                  width={120} 
                  height={120}
                  className="mx-auto mb-4"
                />
                <h3 className="text-lg font-medium mb-2">Install Our Chrome Extension</h3>
                <p className="text-muted-foreground mb-6">
                  To access and manage your prompts, please install our Chrome extension. 
                  The extension provides a seamless experience for creating, editing, and using your prompts directly in your browser.
                </p>
                <Link 
                  href="https://chrome.google.com/webstore/detail/prompy/your-extension-id"
                  className="bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors inline-flex items-center"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Install Chrome Extension
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          {/* Sidebar with subscription status */}
          <SubscriptionStatus userSubscription={usageStats?.subscription} />
          
          {/* Prompt Limit Indicator */}
          {!isLoading && !error && usageStats && (
            <PromptLimitIndicator 
              promptCount={usageStats.promptCount || 0} 
              promptLimit={usageStats.promptLimit || 50}
              isPremium={isPremium}
            />
          )}
          
          <div className="bg-secondary rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Usage Stats</h2>
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-6 bg-muted rounded w-1/2"></div>
              </div>
            ) : error ? (
              <div className="text-red-500 p-4 border border-red-300 rounded-md">
                {error}
              </div>
            ) : usageStats ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Prompts Created</p>
                  <p className="text-lg font-medium">{usageStats.promptCount || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Activity</p>
                  <p className="text-lg font-medium">
                    {usageStats.lastActivity 
                      ? new Date(usageStats.lastActivity).toLocaleDateString() 
                      : 'No activity yet'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Account Created</p>
                  <p className="text-lg font-medium">
                    {usageStats.createdAt 
                      ? new Date(usageStats.createdAt).toLocaleDateString() 
                      : 'Unknown'}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No usage data available</p>
            )}
          </div>
          
          <div className="bg-secondary rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
            <ul className="space-y-2">
              <li>
                <Link href="/pricing" className="text-primary hover:text-primary/80 hover:underline transition-colors">
                  Subscription Plans
                </Link>
              </li>
              <li>
                <Link href="/dashboard/settings" className="text-primary hover:text-primary/80 hover:underline transition-colors">
                  Account Settings
                </Link>
              </li>
              <li>
                <Link href="/dashboard/support" className="text-primary hover:text-primary/80 hover:underline transition-colors">
                  Get Support
                </Link>
              </li>
              <li>
                <Link href="https://chrome.google.com/webstore/detail/prompy/your-extension-id" 
                  className="text-primary hover:text-primary/80 hover:underline transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Chrome Extension
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
