"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  WifiIcon,
  ExclamationTriangleIcon,
  CloudIcon,
} from "@heroicons/react/24/outline";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

export function OfflineBanner() {
  const { isOnline, isApiAvailable, isConnected } = useNetworkStatus();

  const getBannerConfig = () => {
    if (!isOnline) {
      return {
        message:
          "You are currently offline. Some features may not be available.",
        icon: WifiIcon,
        bgColor: "bg-red-500",
        textColor: "text-white",
      };
    } else if (!isApiAvailable) {
      return {
        message: "Server temporarily unavailable. Using cached data.",
        icon: CloudIcon,
        bgColor: "bg-yellow-500",
        textColor: "text-white",
      };
    }
    return null;
  };

  const config = getBannerConfig();

  return (
    <AnimatePresence>
      {!isConnected && config && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className={`fixed top-16 left-0 right-0 z-40 ${config.bgColor} ${config.textColor} py-2 px-4`}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
            <config.icon className="w-5 h-5" />
            <span className="text-sm font-medium">{config.message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default OfflineBanner;
