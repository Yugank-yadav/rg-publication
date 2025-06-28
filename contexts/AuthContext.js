"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { authAPI } from "@/lib/api";
import logger from "@/lib/logger";

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginCallbacks, setLoginCallbacks] = useState([]);

  // Initialize auth state on mount
  useEffect(() => {
    logger.debug("Auth useEffect starting...");

    const initializeAuth = async () => {
      try {
        logger.debug("Calling authAPI.getCurrentUser()...");
        const currentUser = authAPI.getCurrentUser();
        logger.debug("getCurrentUser result:", currentUser);

        logger.debug("Calling authAPI.isAuthenticated()...");
        const isAuth = authAPI.isAuthenticated();
        logger.debug("isAuthenticated result:", isAuth);

        if (currentUser && isAuth) {
          logger.debug("Setting user as authenticated");
          setUser(currentUser);
          setIsAuthenticated(true);
        } else {
          logger.debug("User not authenticated");
        }
      } catch (error) {
        logger.error("Error initializing auth state:", error);
      } finally {
        logger.debug("Setting isLoading to false");
        setIsLoading(false);
      }
    };

    // Add a small delay to ensure DOM is ready
    const timeout = setTimeout(() => {
      initializeAuth();
    }, 100);

    return () => clearTimeout(timeout);
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      logger.debug("AuthContext: Starting login process");
      setIsLoading(true);

      logger.debug("AuthContext: Calling authAPI.login");
      const response = await authAPI.login(credentials);
      logger.debug("AuthContext: API response received:", {
        success: response.success,
        hasUser: !!response.data?.user,
        hasTokens: !!response.data?.tokens,
      });

      if (response.success) {
        logger.auth.login(true, response.data.user);
        setUser(response.data.user);
        setIsAuthenticated(true);

        // Trigger login callbacks (e.g., cart refresh)
        loginCallbacks.forEach((callback) => {
          try {
            callback(response.data.user);
          } catch (error) {
            logger.error("Error in login callback:", error);
          }
        });

        return { success: true, user: response.data.user };
      } else {
        logger.auth.login(false, null);
        return { success: false, error: response.message || "Login failed" };
      }
    } catch (error) {
      logger.error("AuthContext: Login error:", error);
      return { success: false, error: error.message || "Login failed" };
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setIsLoading(true);
      logger.debug("AuthContext: Attempting registration with data:", userData);
      const response = await authAPI.register(userData);
      logger.debug("AuthContext: Registration response:", response);

      if (response.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        return { success: true, user: response.data.user };
      } else {
        logger.error("AuthContext: Registration failed:", response);
        return {
          success: false,
          error: response.message || "Registration failed",
        };
      }
    } catch (error) {
      logger.error("AuthContext: Registration error:", error);
      return { success: false, error: error.message || "Registration failed" };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      await authAPI.logout();
    } catch (error) {
      logger.error("Logout error:", error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  };

  // Update user data
  const updateUser = (userData) => {
    setUser(userData);
  };

  // Register callback to be called after successful login - memoized to prevent infinite re-renders
  const registerLoginCallback = useCallback((callback) => {
    setLoginCallbacks((prev) => [...prev, callback]);
  }, []);

  // Unregister login callback - memoized to prevent infinite re-renders
  const unregisterLoginCallback = useCallback((callback) => {
    setLoginCallbacks((prev) => prev.filter((cb) => cb !== callback));
  }, []);

  // Debug auth state (only when state changes)
  useEffect(() => {
    logger.auth.stateChange(isAuthenticated, user);
  }, [isLoading, isAuthenticated, user]);

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    registerLoginCallback,
    unregisterLoginCallback,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
