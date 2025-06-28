"use client";

import { useState, useEffect } from "react";

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [isApiAvailable, setIsApiAvailable] = useState(true);

  useEffect(() => {
    // Check browser online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial check
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Check API availability - reduced frequency to avoid rate limiting
  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/health`,
          {
            method: "GET",
            timeout: 5000,
          }
        );
        setIsApiAvailable(response.ok);
      } catch (error) {
        setIsApiAvailable(false);
      }
    };

    // Check immediately only if online
    if (isOnline) {
      checkApiHealth();
    }

    // Check every 2 minutes instead of 30 seconds to reduce API calls
    const interval = setInterval(() => {
      if (isOnline) {
        checkApiHealth();
      }
    }, 120000); // 2 minutes

    return () => clearInterval(interval);
  }, [isOnline]); // Only run when online status changes

  return {
    isOnline,
    isApiAvailable,
    isConnected: isOnline && isApiAvailable,
  };
}

export default useNetworkStatus;
