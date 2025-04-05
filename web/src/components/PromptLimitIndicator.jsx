import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, Infinity as InfinityIcon, Crown, Calendar, Shield } from 'lucide-react';

export default function PromptLimitIndicator({ promptCount, promptLimit, isPremium, expiresAt, isAdvancedUser, activeSubscriptions = [] }) {
  const [percentage, setPercentage] = useState(0);
  
  useEffect(() => {
    if (promptLimit === -1) return;
    const calculatedPercentage = Math.min(100, Math.round((promptCount / promptLimit) * 100));
    setPercentage(calculatedPercentage);
  }, [promptCount, promptLimit]);
  
  // Determine if user has active subscriptions
  const hasActiveSubscription = activeSubscriptions && activeSubscriptions.length > 0 && 
                               new Date(expiresAt) > new Date();
  
  // User has unlimited prompts if they have active subscription OR are an advanced user
  const hasUnlimitedPrompts = promptLimit === -1 || isPremium;
  
  // Determine status and color based on percentage
  const getStatusInfo = () => {
    if (hasUnlimitedPrompts) return { color: 'bg-primary', textColor: 'text-primary', status: 'unlimited' };
    
    if (percentage >= 100) return { color: 'bg-red-500', textColor: 'text-red-500', status: 'exceeded' };
    if (percentage >= 80) return { color: 'bg-amber-500', textColor: 'text-amber-500', status: 'warning' };
    return { color: 'bg-green-500', textColor: 'text-green-500', status: 'good' };
  };
  
  const { color, textColor, status } = getStatusInfo();
  
  // Get the furthest expiration date from active subscriptions
  const getFurthestExpiryDate = () => {
    if (!activeSubscriptions || activeSubscriptions.length === 0) return expiresAt;
    
    return activeSubscriptions.reduce((latest, sub) => {
      const endDate = new Date(sub.endDate);
      return endDate > latest ? endDate : latest;
    }, new Date(0)).toISOString();
  };
  
  const displayExpiryDate = getFurthestExpiryDate();
  
  return (
    <div className="bg-secondary rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Prompt Limit</h2>
        <div className="flex items-center">
          {hasActiveSubscription && <Crown className="h-5 w-5 text-yellow-500 mr-1" />}
          {isAdvancedUser && <Shield className="h-5 w-5 text-primary ml-1" />}
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground flex items-center">
            {promptCount} / {hasUnlimitedPrompts ? (
              <span className="flex items-center">
                <InfinityIcon className="h-4 w-4 inline ml-1" />
                {hasActiveSubscription && (
                  <>
                    <Calendar className="h-3 w-3 ml-2" />
                    {new Date(displayExpiryDate) > new Date() ? (
                      <span className="ml-1 text-xs text-muted-foreground">
                        Till {new Date(displayExpiryDate).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="ml-1 text-xs text-muted-foreground">Expired</span>
                    )}
                  </>
                )}
              </span>
            ) : promptLimit}
          </span>
          <span className={`text-sm font-medium ${textColor}`}>
            {hasUnlimitedPrompts ? 'Unlimited' : `${percentage}%`}
          </span>
        </div>
        
        <div className="w-full bg-muted rounded-full h-2.5">
          {hasUnlimitedPrompts ? (
            <div className="bg-primary h-2.5 rounded-full w-full opacity-70 animate-pulse"></div>
          ) : (
            <div 
              className={`${color} h-2.5 rounded-full transition-all duration-500 ease-in-out`} 
              style={{ width: `${percentage}%` }}
            ></div>
          )}
        </div>
      </div>
      
      {status === 'exceeded' && (
        <div className="flex items-start space-x-2 p-3 bg-red-100 dark:bg-red-900/20 rounded-md text-sm">
          <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-red-700 dark:text-red-400 font-medium">Limit reached</p>
            <p className="text-red-600 dark:text-red-300 mt-1">
              You've reached your prompt limit. Upgrade to create more prompts.
            </p>
            <Link 
              href="/pricing" 
              className="mt-2 inline-block bg-primary text-primary-foreground px-3 py-1 text-sm rounded hover:bg-primary/90 transition-colors"
            >
              Upgrade Now
            </Link>
          </div>
        </div>
      )}
      
      {status === 'warning' && (
        <div className="flex items-start space-x-2 p-3 bg-amber-100 dark:bg-amber-900/20 rounded-md text-sm">
          <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-amber-700 dark:text-amber-400 font-medium">Almost there</p>
            <p className="text-amber-600 dark:text-amber-300">
              You're approaching your prompt limit. Consider upgrading soon.
            </p>
          </div>
        </div>
      )}
      
      {status === 'unlimited' && (
        <div className="flex items-center justify-center space-x-2 p-3 bg-primary/10 rounded-md">
          <p className="text-primary font-medium flex items-center">
            {hasActiveSubscription && <Crown className="h-4 w-4 mr-2" />}
            {isAdvancedUser && <Shield className="h-4 w-4 mr-2" />}
            Unlimited {hasActiveSubscription ? 'Premium' : 'Advanced'} Access
          </p>
        </div>
      )}
    </div>
  );
}
