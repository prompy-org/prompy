'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

// Create context with default values
const LoadingBarContext = createContext({
  start: () => {},
  done: () => {},
  progress: () => {},
  setColor: () => {},
  setHeight: () => {},
  setAutoRun: () => {}, // Add default value
});

// Custom hook to use the loading bar
export const useLoadingBar = () => useContext(LoadingBarContext);

export const LoadingBarProvider= ({
  children,
  initialColor = '#2563eb', // Default blue color
  initialHeight = 3,
  autoRun = true,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const [color, setColor] = useState(initialColor);
  const [height, setHeight] = useState(initialHeight);
  const [autoRunEnabled, setAutoRunEnabled] = useState(autoRun);
  
  const timeoutRef = useRef(null);
  const intervalRef = useRef(null);
  const skipNextAutoRunRef = useRef(false);
  
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Start the loading bar
  const start = () => {
    setIsLoading(true);
    setProgressValue(10);
    
    // Clear any existing intervals
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    // Simulate progress
    intervalRef.current = setInterval(() => {
      setProgressValue(prev => {
        if (prev >= 90) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 90;
        }
        return prev + Math.random() * 10;
      });
    }, 300);
  };

  // Complete the loading
  const done = () => {
    setProgressValue(100);
    
    // Clear any existing intervals
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    // Reset after animation completes
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsLoading(false);
      setProgressValue(0);
    }, 300); // Wait for transition to complete
  };

  // Set a specific progress value
  const progress = (value) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsLoading(true);
    setProgressValue(Math.min(Math.max(value, 0), 100));
  };

  // Custom color setter
  const handleSetColor = (newColor) => {
    setColor(newColor);
  };

  // Custom height setter
  const handleSetHeight = (newHeight) => {
    setHeight(newHeight);
  };

  // Method to control autoRun behavior
  const handleSetAutoRun = (value) => {
    setAutoRunEnabled(value);
    // If we're disabling autoRun and there's a loading in progress,
    // make sure to complete it to avoid stuck loading states
    if (!value && isLoading) {
      done();
    }
  };

  // Auto-run on route change
  useEffect(() => {
    if (autoRunEnabled) {
      start();
      // Simulate page loaded after some time
      const timeout = setTimeout(() => {
        done();
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [pathname, searchParams]);

  // Clean up timeouts and intervals on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <LoadingBarContext.Provider
      value={{
        start,
        done,
        progress,
        setColor: handleSetColor,
        setHeight: handleSetHeight,
        setAutoRun: handleSetAutoRun,
      }}
    >
      {isLoading && (
        <div
          className="fixed top-0 left-0 z-50 w-full"
          style={{ height: `${height}px` }}
        >
          <div
            className="h-full transition-all duration-300 ease-out"
            style={{
              width: `${progressValue}%`,
              backgroundColor: color,
              boxShadow: `0 0 10px ${color}40`,
            }}
          />
        </div>
      )}
      {children}
    </LoadingBarContext.Provider>
  );
};