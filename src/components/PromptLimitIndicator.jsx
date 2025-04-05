import React, { useState, useEffect } from 'react';
import { FiAlertTriangle, FiCalendar, FiShield } from 'react-icons/fi';
import { FaCrown, FaInfinity } from "react-icons/fa";

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
    if (hasUnlimitedPrompts) return { color: '#7c3aed', textColor: '#7c3aed', status: 'unlimited' };
    
    if (percentage >= 100) return { color: '#ef4444', textColor: '#ef4444', status: 'exceeded' };
    if (percentage >= 95) return { color: '#f59e0b', textColor: '#f59e0b', status: 'warning' };
    return { color: '#10b981', textColor: '#10b981', status: 'good' };
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
    <div className="prompt-limit-indicator">
      <div className="prompt-limit-header">
        <h2>Prompt Limit</h2>
        <div className="prompt-limit-badges">
          {hasActiveSubscription && <FaCrown className="crown-icon" />}
          {isAdvancedUser && <FiShield className="shield-icon" />}
        </div>
      </div>
      
      <div className="prompt-limit-meter">
        <div className="prompt-limit-info">
          <span className="prompt-count">
            {promptCount} / {hasUnlimitedPrompts ? (
              <span className="unlimited-container">
                <FaInfinity className="infinity-icon" />
                {hasActiveSubscription && (
                  <>
                    <FiCalendar className="calendar-icon" />
                    {new Date(displayExpiryDate) > new Date() ? (
                      <span className="expiry-date">
                        Till {new Date(displayExpiryDate).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="expiry-date">Expired</span>
                    )}
                  </>
                )}
              </span>
            ) : promptLimit}
          </span>
          <span className="percentage-text" style={{ color: textColor }}>
            {hasUnlimitedPrompts ? 'Unlimited' : `${percentage}%`}
          </span>
        </div>
        
        <div className="progress-bar-bg">
          {hasUnlimitedPrompts ? (
            <div className="progress-bar-unlimited"></div>
          ) : (
            <div 
              className="progress-bar"
              style={{ width: `${percentage}%`, backgroundColor: color }}
            ></div>
          )}
        </div>
      </div>
      
      {status === 'exceeded' && (
        <div className="alert exceeded-alert">
          <FiAlertTriangle className="alert-icon" />
          <div>
            <p className="alert-title">Limit reached</p>
            <p className="alert-message">
              You've reached your prompt limit. Upgrade to create more prompts.
            </p>
            <a 
              href="https://prompy.org/dashboard" 
              target="_blank" 
              rel="noopener noreferrer"
              className="upgrade-button"
            >
              Upgrade Now
            </a>
          </div>
        </div>
      )}
      
      {status === 'warning' && (
        <div className="alert warning-alert">
          <FiAlertTriangle className="alert-icon" />
          <div>
            <p className="alert-title">Almost there</p>
            <p className="alert-message">
              You're approaching your prompt limit. Consider upgrading soon.
            </p>
            <a 
              href="https://prompy.org/dashboard" 
              target="_blank" 
              rel="noopener noreferrer"
              className="dashboard-link"
            >
              View Dashboard
            </a>
          </div>
        </div>
      )}
      
      {status === 'unlimited' && (
        <div className="unlimited-status">
          <p className="unlimited-text">
            {hasActiveSubscription && <FaCrown className="status-icon" />}
            {isAdvancedUser && <FiShield className="status-icon" />}
            Unlimited {hasActiveSubscription ? 'Premium' : 'Advanced'} Access
          </p>
        </div>
      )}
    </div>
  );
}