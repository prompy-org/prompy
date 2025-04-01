import Link from 'next/link';

export default function SubscriptionStatus({ userSubscription : subscription}) {

  if (!subscription || !subscription.isActive) {
    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <p className="text-gray-600 dark:text-gray-300 mb-2">
          You don't have an active subscription.
        </p>
        <Link 
          href="/dashboard/pricing" 
          className="inline-block bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
        >
          Subscribe Now
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="flex items-center mb-2">
        <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
        <h3 className="font-medium text-gray-900 dark:text-white">Active Subscription</h3>
      </div>
      <p className="text-gray-600 dark:text-gray-300 mb-1">
        Plan: <span className="font-medium">{subscription?.planName || 'Unlimited'}</span>
      </p>
      {subscription.expiresAt && (
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          Renews on: {new Date(subscription.expiresAt).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}
