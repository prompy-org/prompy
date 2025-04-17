'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Crown, CreditCard, Calendar, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import plans from '@/constants/plans';
import { getUserSubscriptionDetails } from '@/services/userService';
import { useLoadingBar } from '@/components/TopLoadingBar';

export default function SettingsPage() {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const loadingBar = useLoadingBar();

  useEffect(() => {
    loadingBar.setAutoRun(false);
    if (isLoading){
      loadingBar.start();
    } else {
      loadingBar.done();
      loadingBar.setAutoRun(true);
    }
  },[isLoading])

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        setIsLoading(true);
        const data = await getUserSubscriptionDetails();
        setSubscriptionData(data);
      } catch (err) {
        console.error('Error fetching subscription data:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptionData();
  }, []);

  const handleDeleteAccount = () => {
    // This would be replaced with actual account deletion logic
    console.log('Account deletion requested');
    setShowDeleteConfirm(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPlanName = (planId) => {
    const plan = plans.find(p => p.id === planId);
    return plan ? plan.name : planId;
  };

  return (
    <div className="max-w-3xl mx-auto p-5">
      {/* Settings Container */}
      <div className="bg-secondary rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>

        {/* Subscription Section */}
        <section className="mb-8 pb-6 border-b border-border">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            Subscription Management
            {subscriptionData?.isAdvancedUser && (
              <Crown className="ml-2 h-5 w-5 text-yellow-500" />
            )}
          </h2>

          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-muted rounded w-3/4"></div>
              <div className="h-6 bg-muted rounded w-1/2"></div>
              <div className="h-6 bg-muted rounded w-2/3"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 p-4 bg-red-50 rounded-md">
              <p>Error loading subscription data. Please try again later.</p>
            </div>
          ) : (
            <div>
              {/* Current Plan Info */}
              <div className="mb-6 bg-accent p-4 rounded-md">
                <h3 className="font-semibold mb-2 flex items-center">
                  <CreditCard className="mr-2 h-5 w-5" />
                  Current Plan
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Plan</p>
                    <p className="font-medium">
                      {subscriptionData?.subscription?.planId ? (
                        getPlanName(subscriptionData.subscription.planId)
                      ) : 'Free Tier'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-medium flex items-center">
                      {subscriptionData?.subscription?.isActive ? (
                        <>
                          <CheckCircle className="mr-1 h-4 w-4 text-green-500" />
                          <span className="text-green-600">Active</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="mr-1 h-4 w-4 text-red-500" />
                          <span className="text-red-600">Inactive</span>
                        </>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Prompt Limit</p>
                    <p className="font-medium">
                      {subscriptionData?.promptLimit === -1 ? 'Unlimited' : subscriptionData?.promptLimit || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Prompts Used</p>
                    <p className="font-medium">{subscriptionData?.promptCount || 0}</p>
                  </div>
                  {subscriptionData?.subscription?.startDate && (
                    <div>
                      <p className="text-sm text-muted-foreground">Start Date</p>
                      <p className="font-medium">{formatDate(subscriptionData.subscription.startDate)}</p>
                    </div>
                  )}
                  {subscriptionData?.subscription?.expiresAt && (
                    <div>
                      <p className="text-sm text-muted-foreground">Expiry Date</p>
                      <p className="font-medium flex items-center">
                        <Calendar className="mr-1 h-4 w-4" />
                        {formatDate(subscriptionData.subscription.expiresAt)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Active Subscriptions */}
              {subscriptionData?.activeSubscriptions && subscriptionData.activeSubscriptions.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2 flex items-center">
                    <Clock className="mr-2 h-5 w-5" />
                    Active Subscriptions
                  </h3>
                  <div className="space-y-3 bg-accent/30 p-4 rounded-md border border-border">
                    {subscriptionData.activeSubscriptions.map((sub, index) => {
                      const now = new Date();
                      const startDate = new Date(sub.startDate);
                      const endDate = new Date(sub.endDate);
                      const isCurrentlyActive = now >= startDate && now <= endDate;

                      return (
                        <div key={index} className={`${isCurrentlyActive ? "border-l-2 border-primary pl-2" : ""} p-2 rounded-md ${isCurrentlyActive ? "bg-accent/50" : "bg-secondary/50"}`}>
                          <div className="flex justify-between items-center">
                            <span className="font-medium">
                              {getPlanName(sub.planId)}
                              {isCurrentlyActive && <span className="text-xs ml-1 text-primary font-semibold">(Current)</span>}
                            </span>
                            <span className="text-muted-foreground text-xs">
                              {formatDate(sub.startDate)} - {formatDate(sub.endDate)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Payment History */}
              {subscriptionData?.payments && subscriptionData.payments.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2 flex items-center">
                    <CreditCard className="mr-2 h-5 w-5" />
                    Payment History
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-border rounded-md overflow-hidden">
                      <thead>
                        <tr className="bg-accent border-b border-border">
                          <th className="text-left p-2 text-sm font-semibold">Date</th>
                          <th className="text-left p-2 text-sm font-semibold">Plan</th>
                          <th className="text-left p-2 text-sm font-semibold">Amount</th>
                          <th className="text-left p-2 text-sm font-semibold">Order ID</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subscriptionData.payments.map((payment, index) => (
                          <tr key={index} className="border-t border-border hover:bg-accent/50">
                            <td className="p-2 text-sm">{formatDate(payment.date)}</td>
                            <td className="p-2 text-sm font-medium">{getPlanName(payment.planId)}</td>
                            <td className="p-2 text-sm font-medium">₹{payment.amount}</td>
                            <td className="p-2 text-sm text-muted-foreground">{payment.orderId}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                {subscriptionData?.subscription?.isActive && (
                  <Link
                    href="/pricing"
                    className="px-4 py-2 bg-accent text-accent-foreground rounded-md font-medium hover:bg-accent/80 transition-colors"
                  >
                    Manage Subscription
                  </Link>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Danger Zone */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
            Danger Zone
          </h2>
          <div className="flex justify-between items-center bg-red-100 dark:bg-red-950/30 p-4 rounded-md border border-red-300 dark:border-red-900">
            <div>
              <h3 className="font-semibold text-red-800 dark:text-red-400">Delete Account</h3>
              <p className="text-sm text-red-700">Permanently delete your account and all associated data. This action cannot be undone.</p>
            </div>
            <button
              className="px-4 py-2 bg-red-200 text-red-900 dark:bg-red-900/50 dark:text-red-200 rounded-md font-medium hover:bg-red-300 dark:hover:bg-red-900 transition-colors"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete Account
            </button>
          </div>
        </section>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-secondary rounded-lg p-6 w-full max-w-md shadow-xl">
            <h3 className="text-xl font-semibold mb-2">Delete Account</h3>
            <p className="mb-6 text-secondary-foreground">Are you sure you want to delete your account? This action cannot be undone. We will miss you!</p>
            <div className="flex gap-3">
              <button
                className="px-4 py-2 bg-accent text-accent-foreground rounded-md font-medium hover:bg-accent/80 transition-colors"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition-colors"
                onClick={handleDeleteAccount}
              >
                Yes, Delete My Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}