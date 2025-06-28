/**
 * Production-ready logging utility for RG Publication
 * Provides conditional logging based on environment
 */

// Log levels
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

// Current log level based on environment
const getCurrentLogLevel = () => {
  if (typeof window !== "undefined") {
    // Client-side
    return process.env.NODE_ENV === "development"
      ? LOG_LEVELS.DEBUG
      : LOG_LEVELS.ERROR;
  } else {
    // Server-side
    return process.env.NODE_ENV === "development"
      ? LOG_LEVELS.DEBUG
      : LOG_LEVELS.WARN;
  }
};

const currentLogLevel = getCurrentLogLevel();
const isDevelopment = process.env.NODE_ENV === "development";

// Logger utility
const logger = {
  /**
   * Log error messages (always in development, only errors in production)
   */
  error: (...args) => {
    if (currentLogLevel >= LOG_LEVELS.ERROR) {
      console.error("[ERROR]", ...args);
    }
  },

  /**
   * Log warning messages (development only)
   */
  warn: (...args) => {
    if (currentLogLevel >= LOG_LEVELS.WARN) {
      console.warn("[WARN]", ...args);
    }
  },

  /**
   * Log info messages (development only)
   */
  info: (...args) => {
    if (currentLogLevel >= LOG_LEVELS.INFO) {
      console.info("[INFO]", ...args);
    }
  },

  /**
   * Log debug messages (development only)
   */
  debug: (...args) => {
    if (currentLogLevel >= LOG_LEVELS.DEBUG) {
      console.log("[DEBUG]", ...args);
    }
  },

  /**
   * Log API requests and responses (development only)
   */
  api: {
    request: (method, url, data) => {
      if (currentLogLevel >= LOG_LEVELS.DEBUG) {
        console.log(
          `[API REQUEST] ${method.toUpperCase()} ${url}`,
          data ? { data } : ""
        );
      }
    },
    response: (url, status, data) => {
      if (currentLogLevel >= LOG_LEVELS.DEBUG) {
        console.log(`[API RESPONSE] ${url} (${status})`, data);
      }
    },
    error: (method, url, error) => {
      if (currentLogLevel >= LOG_LEVELS.ERROR) {
        console.error(`[API ERROR] ${method.toUpperCase()} ${url}`, {
          status: error.response?.status,
          message: error.message,
          data: error.response?.data,
        });
      }
    },
  },

  /**
   * Log authentication events (development only)
   */
  auth: {
    login: (success, user) => {
      if (currentLogLevel >= LOG_LEVELS.DEBUG) {
        console.log("[AUTH] Login attempt:", {
          success,
          user: user?.email || "unknown",
        });
      }
    },
    logout: () => {
      if (currentLogLevel >= LOG_LEVELS.DEBUG) {
        console.log("[AUTH] User logged out");
      }
    },
    stateChange: (isAuthenticated, user) => {
      if (currentLogLevel >= LOG_LEVELS.DEBUG) {
        console.log("[AUTH] State changed:", {
          isAuthenticated,
          user: user?.email || "none",
        });
      }
    },
  },

  /**
   * Log cart operations (development only)
   */
  cart: {
    init: (source, itemCount) => {
      if (currentLogLevel >= LOG_LEVELS.DEBUG) {
        console.log(`[CART] Initialized from ${source}:`, `${itemCount} items`);
      }
    },
    add: (productTitle, success) => {
      if (currentLogLevel >= LOG_LEVELS.DEBUG) {
        console.log(`[CART] Add item:`, { product: productTitle, success });
      }
    },
    remove: (productTitle, success) => {
      if (currentLogLevel >= LOG_LEVELS.DEBUG) {
        console.log(`[CART] Remove item:`, { product: productTitle, success });
      }
    },
    update: (productTitle, quantity, success) => {
      if (currentLogLevel >= LOG_LEVELS.DEBUG) {
        console.log(`[CART] Update quantity:`, {
          product: productTitle,
          quantity,
          success,
        });
      }
    },
    sync: (source, itemCount) => {
      if (currentLogLevel >= LOG_LEVELS.DEBUG) {
        console.log(`[CART] Synced with ${source}:`, `${itemCount} items`);
      }
    },
  },

  /**
   * Check if debug logging is enabled
   */
  isDebugEnabled: () => currentLogLevel >= LOG_LEVELS.DEBUG,

  /**
   * Check if info logging is enabled
   */
  isInfoEnabled: () => currentLogLevel >= LOG_LEVELS.INFO,
};

export default logger;
