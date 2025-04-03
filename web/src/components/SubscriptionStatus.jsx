import Link from 'next/link';
import { Crown } from 'lucide-react';

export default function SubscriptionStatus({ userSubscription }) {
  // Determine subscription status
  const isPremium = userSubscription?.planId !== 'one_time_payment_plan' && userSubscription?.isActive && userSubscription?.planId !== 'plan_basic';
  const isActive = userSubscription?.isActive;
  
  return (
    <div className="bg-secondary rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Subscription</h2>
      
      {!userSubscription ? (
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-3/4"></div>
          <div className="h-6 bg-muted rounded w-1/2"></div>
        </div>
      ) : (
        <div>
          <div className="flex items-center mb-4">
            <div className={`w-3 h-3 rounded-full mr-2 ${isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className={`font-medium ${isActive ? 'text-green-500' : 'text-red-500'}`}>
              {isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">Plan</p>
            <div className="flex items-center">
              {isPremium && <Crown className="h-4 w-4 text-yellow-500 mr-1" />}
              <p className="text-lg font-medium">
                {isPremium ? 'Premium' : 'Free'}
              </p>
            </div>
          </div>
          
          {userSubscription.renewDate && (
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">Renews On</p>
              <p className="text-lg font-medium">
                {new Date(userSubscription.renewDate).toLocaleDateString()}
              </p>
            </div>
          )}
          
          <Link 
            href="/pricing" 
            className="block w-full text-center bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors mt-4"
          >
            {isPremium ? 'Manage Subscription' : 'Upgrade to Premium'}
          </Link>
        </div>
      )}
    </div>
  );
}
