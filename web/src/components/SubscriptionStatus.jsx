import Link from "next/link";
import { Crown, Star, Shield, Calendar, AlertTriangle, Clock } from "lucide-react";
import plans from "@/constants/plans";

export default function SubscriptionStatus({ userSubscription, activeSubscriptions = [], isAdvancedUser, advancedUserSince }) {
  // Determine if user has active subscription plans
  const hasActiveSubscription = 
    userSubscription?.isActive && 
    userSubscription?.planId !== "plan_basic";
  
  // Check if subscription is expired
  const isExpired = userSubscription?.expiresAt && new Date(userSubscription.expiresAt) < new Date();
  
  // Sort active subscriptions by end date (furthest end date first)
  const sortedSubscriptions = [...(activeSubscriptions || [])].sort((a, b) => 
    new Date(b.endDate) - new Date(a.endDate)
  );

  // User is premium if they have either an active subscription or advanced user status
  const isPremium = (hasActiveSubscription && !isExpired) || isAdvancedUser;

  return (
    <div className="bg-secondary rounded-lg shadow p-6 relative overflow-hidden">
      {isPremium && (
        <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden">
          <div className="absolute top-0 right-0 transform translate-y-[-50%] translate-x-[50%] rotate-45 bg-primary w-[150%] h-6"></div>
          <Crown className="absolute top-2 right-2 h-4 w-4 text-primary-foreground" />
        </div>
      )}

      <h2 className="text-xl font-semibold mb-4 flex items-center">
        Subscription
        {isPremium && <Crown className="h-5 w-5 text-yellow-500 ml-2" />}
      </h2>

      {!userSubscription ? (
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-3/4"></div>
          <div className="h-6 bg-muted rounded w-1/2"></div>
        </div>
      ) : (
        <div>
          <div className="flex items-center mb-4">
            <div
              className={`w-3 h-3 rounded-full mr-2 ${
                isPremium ? "bg-green-500" : "bg-red-500"
              }`}></div>
            <span
              className={`font-medium ${
                isPremium ? "text-green-500" : "text-red-500"
              }`}>
              {isPremium ? (
                hasActiveSubscription ? "Active" : "Advanced User"
              ) : "Inactive"}
            </span>
          </div>

          {/* Display both subscription and advanced status */}
          <div className="space-y-4">
            {/* Show subscription status if user has active subscriptions */}
            {hasActiveSubscription && !isExpired && (
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">Subscription Plan</p>
                <div className="flex items-center">
                  <div className="flex items-center bg-gradient-to-r from-yellow-400 to-amber-600 bg-clip-text text-transparent">
                    <Crown className="h-4 w-4 text-yellow-500 mr-1" />
                    <p className="text-lg font-bold">Premium</p>
                    {/* <p className="text-sm ml-1">({isAdvancedUser ? "Advanced" : ""})</p> */}
                  </div>
                </div>
              </div>
            )}
            
            {/* Show advanced user status if applicable */}
            {isAdvancedUser && (
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">Advanced Status</p>
                <p className="text-lg font-medium text-primary flex items-center">
                  <Shield className="h-4 w-4 mr-1" /> 
                  Extended Access
                </p>
                {advancedUserSince && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Since {new Date(advancedUserSince).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
            
            {/* Show basic plan if user has neither */}
            {!isPremium && (
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">Plan</p>
                <p className="text-lg font-medium">Basic</p>
              </div>
            )}
          </div>

          {/* Active Subscriptions Section - show regardless of advanced user status */}
          {hasActiveSubscription && !isExpired && sortedSubscriptions.length > 0 && (
            <div className="mb-4 mt-2">
              <p className="text-sm text-muted-foreground mb-2 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                Active Subscriptions
              </p>
              <div className="space-y-2 bg-secondary/50 p-3 rounded-md border border-primary/10">
                {sortedSubscriptions.map((sub, index) => {
                  // Check if this subscription is currently active (today falls between start and end dates)
                  const now = new Date();
                  const startDate = new Date(sub.startDate);
                  const endDate = new Date(sub.endDate);
                  const isCurrentlyActive = now >= startDate && now <= endDate;
                  
                  return (
                    <div key={index} className={`text-sm ${isCurrentlyActive ? "border-l-2 border-primary pl-2" : ""}`}>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">
                          {plans.find(plan => plan.id === sub.planId)?.name || sub.planName}
                          {isCurrentlyActive && <span className="text-xs ml-1 text-primary">(Current)</span>}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {new Date(sub.startDate).toLocaleDateString()} - {new Date(sub.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      {index === 0 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          All subscriptions valid until {new Date(userSubscription.endDate || sub.endDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Show expired message only for subscription plans */}
          {hasActiveSubscription && isExpired && (
            <div className="mb-4">
              <p className="text-sm text-muted-foreground flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                Subscription Expired On
              </p>
              <p className="text-lg font-medium text-red-500">
                {new Date(userSubscription.expiresAt).toLocaleDateString()}
              </p>
            </div>
          )}

          {/* Premium benefits section */}
          {isPremium && (
            <div className="mb-4 mt-4 space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <Shield className="h-3 w-3 mr-1 text-primary" />
                <span>Premium Support</span>
              </div>
              {hasActiveSubscription && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Star className="h-3 w-3 mr-1 text-primary" />
                  <span>Unlimited Prompts</span>
              </div>
              )}
            </div>
          )}

          {/* Expired subscription warning - only show if all subscriptions expired and user is not advanced */}
          {hasActiveSubscription && isExpired && !isAdvancedUser && (
            <div className="flex items-start space-x-2 p-3 bg-red-100 dark:bg-red-900/20 rounded-md text-sm mb-4">
              <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-700 dark:text-red-400 font-medium">Subscription expired</p>
                <p className="text-red-600 dark:text-red-300 mt-1">
                  Your prompt limit has been reset to basic. Renew your subscription to regain premium benefits.
                </p>
              </div>
            </div>
          )}

          <Link
            href="/pricing"
            className={`block w-full text-center ${
              isPremium
                ? "bg-secondary border border-primary text-primary"
                : "bg-primary text-primary-foreground"
            } px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors mt-4`}>
            {isPremium ? "Manage Subscription" : "Upgrade to Premium"}
          </Link>
        </div>
      )}
    </div>
  );
}
