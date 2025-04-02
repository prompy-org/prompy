'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SubscriptionStatus from '@/components/SubscriptionStatus';
import Image from 'next/image';

export default function Dashboard() {
  const [usageStats, setUsageStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
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
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {/* Main dashboard content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
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
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  To access and manage your prompts, please install our Chrome extension. 
                  The extension provides a seamless experience for creating, editing, and using your prompts directly in your browser.
                </p>
                <Link 
                  href="https://chrome.google.com/webstore/detail/prompy/your-extension-id"
                  className="bg-primary text-white px-6 py-3 rounded-md hover:bg-primary/90 inline-flex items-center"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Install Chrome Extension
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          {/* Sidebar with subscription status */}
          <SubscriptionStatus userSubscription={usageStats?.subscription} />
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Usage Stats</h2>
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ) : error ? (
              <div className="text-red-500 p-4 border border-red-300 rounded-md">
                {error}
              </div>
            ) : usageStats ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Prompts Created</p>
                  <p className="text-lg font-medium">{usageStats.promptCount || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Last Activity</p>
                  <p className="text-lg font-medium">
                    {usageStats.lastActivity 
                      ? new Date(usageStats.lastActivity).toLocaleDateString() 
                      : 'No activity yet'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Account Created</p>
                  <p className="text-lg font-medium">
                    {usageStats.createdAt 
                      ? new Date(usageStats.createdAt).toLocaleDateString() 
                      : 'Unknown'}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No usage data available</p>
            )}
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
            <ul className="space-y-2">
              <li>
                <Link href="/pricing" className="text-primary hover:underline">
                  Subscription Plans
                </Link>
              </li>
              <li>
                <Link href="/dashboard/settings" className="text-primary hover:underline">
                  Account Settings
                </Link>
              </li>
              <li>
                <Link href="/dashboard/support" className="text-primary hover:underline">
                  Get Support
                </Link>
              </li>
              <li>
                <Link href="https://chrome.google.com/webstore/detail/prompy/your-extension-id" 
                  className="text-primary hover:underline"
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
