import Link from "next/link";
import { Crown, Star, Shield, Calendar } from "lucide-react";
import plans from "@/constants/plans";

export default function SubscriptionStatus({ userSubscription }) {
  // Determine subscription status
  const isPremium =
    userSubscription?.planId !== "one_time_payment_plan" &&
    userSubscription?.isActive &&
    userSubscription?.planId !== "plan_basic";
  const isActive = userSubscription?.isActive;

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
                isActive ? "bg-green-500" : "bg-red-500"
              }`}></div>
            <span
              className={`font-medium ${
                isActive ? "text-green-500" : "text-red-500"
              }`}>
              {isActive ? "Active" : "Inactive"}
            </span>
          </div>

          <div className="mb-4">
            <p className="text-sm text-muted-foreground">Plan</p>
            <div className="flex items-center">
              {isPremium && (
                <div className="flex items-center bg-gradient-to-r from-yellow-400 to-amber-600 bg-clip-text text-transparent">
                  <Crown className="h-4 w-4 text-yellow-500 mr-1" />
                  <p className="text-lg font-bold">Premium</p>
                </div>
              )}
              {!isPremium && userSubscription.planId === "one_time_payment_plan" ? (
                <p className="text-lg font-medium text-primary flex items-center"> <Crown className="h-4 w-4 mr-1" /> Extended</p>
              ): (
                <p className="text-lg font-medium">Basic</p>
              )}
            </div>
          </div>

          {userSubscription.renewDate && (
            <div className="mb-4">
              <p className="text-sm text-muted-foreground flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                Renews On
              </p>
              <p className="text-lg font-medium">
                {new Date(userSubscription.renewDate).toLocaleDateString()}
              </p>
            </div>
          )}

          {isPremium && (
            <div className="mb-4 mt-4 space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <Shield className="h-3 w-3 mr-1 text-primary" />
                <span>Premium Support</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Star className="h-3 w-3 mr-1 text-primary" />
                <span>Unlimited Prompts</span>
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
