"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { wishlistAPI } from "@/lib/api";
import logger from "@/lib/logger";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext();

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, user } = useAuth();

  // Load wishlist when user is authenticated
  useEffect(() => {
    // Only load if we have a stable authentication state
    if (isAuthenticated !== null && user !== undefined) {
      if (isAuthenticated && user) {
        loadWishlist();
      } else {
        setWishlistItems([]);
      }
    }
  }, [isAuthenticated, user?.id]); // Only depend on user ID, not entire user object

  // Load wishlist from server
  const loadWishlist = async () => {
    try {
      setIsLoading(true);
      const response = await wishlistAPI.getWishlist();
      logger.debug("Wishlist API Response:", response);

      // Handle both possible response structures
      const wishlistData = response.data?.wishlist || response.data;
      const items = wishlistData?.items || [];

      if (response.success && items.length > 0) {
        // Transform backend wishlist items to frontend format
        const transformedItems = items.map((item) => ({
          id: item.productId, // Product ID for frontend use
          wishlistItemId: item.id, // Wishlist item ID for removal
          title: item.product?.title || "Unknown Product",
          price: parseFloat(item.product?.price) || 0, // Ensure price is a number
          originalPrice: item.product?.originalPrice
            ? parseFloat(item.product.originalPrice)
            : null,
          image: item.product?.image,
          author: item.product?.author || "Unknown Author",
          subject: item.product?.subject,
          class: item.product?.class,
          rating: item.product?.rating,
          inStock: item.product?.inStock,
          addedAt: item.addedAt,
        }));
        logger.debug("Transformed wishlist items:", transformedItems);
        setWishlistItems(transformedItems);
      } else {
        logger.debug("Empty wishlist response");
        setWishlistItems([]);
      }
    } catch (error) {
      logger.error("Error loading wishlist:", error);
      setWishlistItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Add item to wishlist
  const addToWishlist = async (product) => {
    if (!isAuthenticated) {
      throw new Error("Please login to add items to wishlist");
    }

    // Check if item is already in wishlist
    if (isInWishlist(product.id)) {
      return { success: false, error: "Product is already in wishlist" };
    }

    try {
      const response = await wishlistAPI.addToWishlist(product.id);
      logger.debug("Add to wishlist response:", response);

      if (response.success) {
        const newItem = {
          id: product.id,
          wishlistItemId:
            response.data?.wishlistItem?.id || `temp_${Date.now()}`,
          title: product.title,
          price: parseFloat(product.price) || 0,
          originalPrice: product.originalPrice
            ? parseFloat(product.originalPrice)
            : null,
          image: product.image || product.coverImage,
          author: product.author,
          subject: product.subject,
          class: product.class,
          rating: product.rating,
          inStock: product.inStock,
          addedAt:
            response.data?.wishlistItem?.addedAt || new Date().toISOString(),
        };

        setWishlistItems((prev) => [...prev, newItem]);
        return { success: true };
      }
      return {
        success: false,
        error: response.message || "Failed to add to wishlist",
      };
    } catch (error) {
      logger.error("Error adding to wishlist:", error);
      return {
        success: false,
        error: error.message || "Failed to add to wishlist",
      };
    }
  };

  // Remove item from wishlist
  const removeFromWishlist = async (productId) => {
    if (!isAuthenticated) {
      return { success: false, error: "Please login to manage wishlist" };
    }

    try {
      const item = wishlistItems.find((item) => item.id === productId);
      if (!item) {
        return { success: false, error: "Item not found in wishlist" };
      }

      const response = await wishlistAPI.removeFromWishlist(
        item.wishlistItemId
      );
      if (response.success) {
        setWishlistItems((prev) =>
          prev.filter((item) => item.id !== productId)
        );
        return { success: true };
      }
      return { success: false, error: response.message };
    } catch (error) {
      logger.error("Error removing from wishlist:", error);
      return { success: false, error: error.message };
    }
  };

  // Check if item is in wishlist
  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => item.id === productId);
  };

  // Clear entire wishlist
  const clearWishlist = async () => {
    if (!isAuthenticated) {
      return { success: false, error: "Please login to manage wishlist" };
    }

    try {
      const response = await wishlistAPI.clearWishlist();
      if (response.success) {
        setWishlistItems([]);
        return { success: true };
      }
      return { success: false, error: response.message };
    } catch (error) {
      logger.error("Error clearing wishlist:", error);
      return { success: false, error: error.message };
    }
  };

  // Get wishlist count
  const getWishlistCount = () => {
    return wishlistItems.length;
  };

  const value = {
    wishlistItems,
    isLoading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    getWishlistCount,
    loadWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}
