"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

const notificationTypes = {
  error: {
    icon: ExclamationTriangleIcon,
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    textColor: "text-red-800",
    iconColor: "text-red-600",
  },
  success: {
    icon: CheckCircleIcon,
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    textColor: "text-green-800",
    iconColor: "text-green-600",
  },
  warning: {
    icon: ExclamationCircleIcon,
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    textColor: "text-yellow-800",
    iconColor: "text-yellow-600",
  },
  info: {
    icon: InformationCircleIcon,
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-800",
    iconColor: "text-blue-600",
  },
};

export function ErrorNotification({
  type = "error",
  title,
  message,
  isVisible = false,
  onClose,
  autoClose = true,
  autoCloseDelay = 5000,
}) {
  const config = notificationTypes[type];
  const Icon = config.icon;

  // Auto close functionality
  React.useEffect(() => {
    if (isVisible && autoClose && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isVisible, autoClose, autoCloseDelay, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.95 }}
          className={`fixed top-4 right-4 z-50 max-w-md w-full ${config.bgColor} ${config.borderColor} border rounded-lg shadow-lg p-4`}
        >
          <div className="flex items-start">
            <Icon
              className={`w-5 h-5 ${config.iconColor} mt-0.5 flex-shrink-0`}
            />
            <div className="ml-3 flex-1">
              {title && (
                <h3 className={`text-sm font-medium ${config.textColor} mb-1`}>
                  {title}
                </h3>
              )}
              <p className={`text-sm ${config.textColor}`}>{message}</p>
            </div>
            {onClose && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className={`ml-4 ${config.iconColor} hover:opacity-75 transition-opacity`}
              >
                <XMarkIcon className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Toast notification system
export function useNotification() {
  const [notifications, setNotifications] = React.useState([]);

  const addNotification = React.useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = { ...notification, id };

    setNotifications((prev) => [...prev, newNotification]);

    // Auto remove after delay
    if (notification.autoClose !== false) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.autoCloseDelay || 5000);
    }

    return id;
  }, []);

  const removeNotification = React.useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const showError = React.useCallback(
    (message, title = "Error") => {
      return addNotification({ type: "error", title, message });
    },
    [addNotification]
  );

  const showSuccess = React.useCallback(
    (message, title = "Success") => {
      return addNotification({ type: "success", title, message });
    },
    [addNotification]
  );

  const showWarning = React.useCallback(
    (message, title = "Warning") => {
      return addNotification({ type: "warning", title, message });
    },
    [addNotification]
  );

  const showInfo = React.useCallback(
    (message, title = "Info") => {
      return addNotification({ type: "info", title, message });
    },
    [addNotification]
  );

  const NotificationContainer = React.useCallback(
    () => (
      <div className="fixed top-4 right-4 z-50 space-y-2">
        <AnimatePresence>
          {notifications.map((notification) => (
            <ErrorNotification
              key={notification.id}
              {...notification}
              isVisible={true}
              onClose={() => removeNotification(notification.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    ),
    [notifications, removeNotification]
  );

  return {
    showError,
    showSuccess,
    showWarning,
    showInfo,
    removeNotification,
    NotificationContainer,
  };
}

// Inline error message component
export function InlineError({ message, className = "" }) {
  if (!message) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-2 text-red-600 text-sm mt-1 ${className}`}
    >
      <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />
      <span>{message}</span>
    </motion.div>
  );
}

export default ErrorNotification;
