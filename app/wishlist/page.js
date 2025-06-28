"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/contexts/ToastContext";
import logger from "@/lib/logger";
import {
  HeartIcon,
  ShoppingCartIcon,
  TrashIcon,
  ChevronRightIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";

// Loading component
function WishlistLoading() {
  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6">
                <div className="h-48 bg-gray-200 rounded mb-4"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                <div className="flex justify-between items-center">
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                  <div className="h-10 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Auth check component
function AuthCheck({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <HeartIconSolid className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Sign In Required
          </h2>
          <p className="text-gray-600 mb-6">
            Please sign in to view your wishlist and save your favorite books.
          </p>
          <div className="space-y-3">
            <Link
              href="/auth/login"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 inline-block"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-all duration-200 inline-block"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist, isLoading } = useWishlist();
  const { addToCart } = useCart();
  const { showSuccess, showError } = useToast();

  const handleRemoveFromWishlist = async (itemId) => {
    try {
      const result = await removeFromWishlist(itemId);
      if (result.success) {
        showSuccess("Removed from wishlist");
      } else {
        showError(result.error || "Failed to remove from wishlist");
      }
    } catch (error) {
      logger.error("Error removing from wishlist:", error);
      showError("Failed to remove from wishlist");
    }
  };

  const handleAddToCart = async (item) => {
    try {
      await addToCart(item, 1);
    } catch (error) {
      logger.error("Add to cart error:", error);
      showError("Failed to add to cart");
    }
  };

  if (isLoading) {
    return <WishlistLoading />;
  }

  return (
    <AuthCheck>
      <div className="min-h-screen bg-gray-50 pt-16">
        {/* Breadcrumb Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="flex items-center space-x-2 text-sm">
              <Link href="/" className="text-gray-500 hover:text-gray-700">
                Home
              </Link>
              <ChevronRightIcon className="h-4 w-4 text-gray-400" />
              <span className="text-gray-900 font-medium">My Wishlist</span>
            </nav>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  My Wishlist
                </h1>
                <p className="text-gray-600 mt-2">
                  {wishlistItems.length}{" "}
                  {wishlistItems.length === 1 ? "item" : "items"} saved
                </p>
              </div>
            </div>

            {wishlistItems.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center py-16"
              >
                <HeartIconSolid className="h-24 w-24 text-gray-300 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Your wishlist is empty
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Start adding books you love to your wishlist. You can save
                  items for later and easily find them here.
                </p>
                <Link
                  href="/shop"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <ShoppingCartIcon className="h-5 w-5 mr-2" />
                  Browse Books
                </Link>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {wishlistItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300"
                    >
                      <Link href={`/shop/${item.id}`}>
                        <div className="relative">
                          {item.image && item.image.startsWith("http") ? (
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-48 object-cover"
                              onError={(e) => {
                                e.target.src =
                                  "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop&auto=format";
                              }}
                            />
                          ) : (
                            <div
                              className={`w-full h-48 flex items-center justify-center text-6xl ${
                                item.subject === "Mathematics"
                                  ? "bg-gradient-to-br from-blue-100 to-blue-200"
                                  : "bg-gradient-to-br from-green-100 to-green-200"
                              }`}
                            >
                              {item.subject === "Mathematics" ? "📐" : "🔬"}
                            </div>
                          )}
                          <div className="absolute top-4 right-4">
                            <motion.button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleRemoveFromWishlist(item.id);
                              }}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all duration-200"
                            >
                              <TrashIcon className="h-4 w-4 text-red-500" />
                            </motion.button>
                          </div>
                        </div>
                      </Link>

                      <div className="p-6">
                        <Link href={`/shop/${item.id}`}>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                            {item.title}
                          </h3>
                        </Link>

                        <p className="text-sm text-gray-600 mb-2">
                          {item.author}
                        </p>

                        {item.rating && (
                          <div className="flex items-center mb-3">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <StarIcon
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < Math.floor(item.rating)
                                      ? "text-yellow-400 fill-current"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600 ml-2">
                              ({item.reviews || 0})
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-gray-900">
                              ₹{item.price}
                            </span>
                            {item.originalPrice && (
                              <span className="text-sm text-gray-500 line-through">
                                ₹{item.originalPrice}
                              </span>
                            )}
                          </div>

                          <motion.button
                            onClick={() => handleAddToCart(item)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg"
                          >
                            <ShoppingCartIcon className="h-4 w-4" />
                            <span>Add to Cart</span>
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AuthCheck>
  );
}
