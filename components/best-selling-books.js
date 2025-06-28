"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useToast } from "@/contexts/ToastContext";
import logger from "@/lib/logger";
import { productAPI } from "@/lib/api";
import {
  StarIcon,
  HeartIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";

// Loading component
function BestSellingBooksLoading() {
  return (
    <section className="relative py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header Skeleton */}
        <div className="text-center mb-16">
          <div className="h-12 bg-gray-200 rounded animate-pulse mb-4 mx-auto w-80"></div>
          <div className="h-6 bg-gray-200 rounded animate-pulse mx-auto w-96"></div>
        </div>

        {/* Books Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              <div className="h-64 bg-gray-200 animate-pulse"></div>
              <div className="p-6">
                <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-3 w-3/4"></div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-16"></div>
                  <div className="h-8 bg-gray-200 rounded animate-pulse w-24"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Button Skeleton */}
        <div className="text-center">
          <div className="h-12 bg-gray-200 rounded-xl animate-pulse mx-auto w-48"></div>
        </div>
      </div>
    </section>
  );
}

// Empty state component
function BestSellingBooksEmpty() {
  return (
    <section className="relative py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.h2
            className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Best Selling
            <span
              className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-400"
              style={{
                backgroundImage: `linear-gradient(135deg, #3b82f6 0%, #a8f1ff 100%)`,
              }}
            >
              Books
            </span>
          </motion.h2>
          <motion.p
            className="text-xl text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Discover the most popular books that readers can&apos;t put down.
          </motion.p>
        </motion.div>

        {/* Empty State */}
        <motion.div
          className="text-center py-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <BookOpenIcon className="h-24 w-24 text-gray-300 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            No Best Selling Books Available
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            We&apos;re currently updating our bestsellers list. Please check
            back soon or browse our full catalog.
          </p>
          <Link href="/shop">
            <motion.button
              className="inline-flex items-center gap-3 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl"
              style={{ backgroundColor: "#a8f1ff", color: "#1f2937" }}
              whileHover={{
                scale: 1.05,
                y: -2,
              }}
              whileTap={{ scale: 0.95 }}
            >
              Browse All Books
              <ArrowRightIcon className="h-5 w-5" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// Error state component
function BestSellingBooksError({ error, onRetry }) {
  return (
    <section className="relative py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.h2
            className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Best Selling
            <span
              className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-400"
              style={{
                backgroundImage: `linear-gradient(135deg, #3b82f6 0%, #a8f1ff 100%)`,
              }}
            >
              Books
            </span>
          </motion.h2>
        </motion.div>

        {/* Error State */}
        <motion.div
          className="text-center py-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <ExclamationTriangleIcon className="h-24 w-24 text-red-300 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Unable to Load Best Selling Books
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            {error ||
              "There was an error loading the bestsellers. Please try again or browse our full catalog."}
          </p>
          <div className="space-y-4">
            <motion.button
              onClick={onRetry}
              className="inline-flex items-center gap-3 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl mr-4"
              style={{ backgroundColor: "#a8f1ff", color: "#1f2937" }}
              whileHover={{
                scale: 1.05,
                y: -2,
              }}
              whileTap={{ scale: 0.95 }}
            >
              Try Again
            </motion.button>
            <Link href="/shop">
              <motion.button
                className="inline-flex items-center gap-3 px-8 py-4 text-lg font-semibold rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-300"
                whileHover={{
                  scale: 1.05,
                  y: -2,
                }}
                whileTap={{ scale: 0.95 }}
              >
                Browse All Books
                <ArrowRightIcon className="h-5 w-5" />
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default function BestSellingBooks() {
  const [isLoading, setIsLoading] = useState(true);
  const [books, setBooks] = useState([]);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { showSuccess, showError, showWarning } = useToast();

  // No static data - all content should come from API

  // Load bestselling books from API
  useEffect(() => {
    const loadBestsellingBooks = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await productAPI.getFeaturedProducts("bestseller");

        if (response.success) {
          // Transform API data to match component expectations
          const transformedBooks = response.data.bestsellers.map((product) => ({
            id: product.id,
            title: product.title,
            author: product.author,
            description: product.description,
            price: `₹${product.price}`,
            originalPrice: product.originalPrice
              ? `₹${product.originalPrice}`
              : null,
            rating: product.rating?.average || 0,
            reviews: product.rating?.count || 0,
            coverImage:
              product.images?.[0]?.url ||
              "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop&auto=format",
            category: product.subject,
            class: product.class,
            inStock: product.inStock,
          }));

          setBooks(transformedBooks);
        } else {
          setError("Failed to load bestselling books");
        }
      } catch (err) {
        logger.error("Error loading bestselling books:", err);
        setError("Failed to load bestselling books");
        // No fallback to static data - show error state instead
      } finally {
        setIsLoading(false);
      }
    };

    loadBestsellingBooks();
  }, []);

  const handleRetry = () => {
    setError(null);
    setBooks([]);
    setIsLoading(true);
    // Re-trigger the useEffect
    setTimeout(() => {
      const loadBestsellingBooks = async () => {
        try {
          const response = await productAPI.getFeaturedProducts("bestseller");
          if (response.success) {
            const transformedBooks = response.data.bestsellers.map(
              (product) => ({
                id: product.id,
                title: product.title,
                author: product.author,
                description: product.description,
                price: `₹${product.price}`,
                originalPrice: product.originalPrice
                  ? `₹${product.originalPrice}`
                  : null,
                rating: product.rating?.average || 0,
                reviews: product.rating?.count || 0,
                coverImage:
                  product.images?.[0]?.url ||
                  "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop&auto=format",
                category: product.subject,
                class: product.class,
                inStock: product.inStock,
              })
            );
            setBooks(transformedBooks);
          } else {
            setError("Failed to load bestselling books");
          }
        } catch (err) {
          logger.error("Error loading bestselling books:", err);
          setError("Failed to load bestselling books");
        } finally {
          setIsLoading(false);
        }
      };
      loadBestsellingBooks();
    }, 100);
  };

  // Show loading state
  if (isLoading) {
    return <BestSellingBooksLoading />;
  }

  // Show error state
  if (error) {
    return <BestSellingBooksError error={error} onRetry={handleRetry} />;
  }

  // Show empty state if no books
  if (books.length === 0) {
    return <BestSellingBooksEmpty />;
  }

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(<StarSolidIcon key={i} className="h-4 w-4 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <StarIcon className="h-4 w-4 text-yellow-400" />
          <StarSolidIcon
            className="h-4 w-4 text-yellow-400 absolute top-0 left-0"
            style={{ clipPath: "inset(0 50% 0 0)" }}
          />
        </div>
      );
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <StarIcon key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
      );
    }

    return stars;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const bookVariants = {
    hidden: {
      opacity: 0,
      y: 50,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 300,
      },
    },
  };

  return (
    <section className="relative py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 rounded-full opacity-10"
          style={{ backgroundColor: "#a8f1ff" }}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-24 h-24 rounded-full opacity-10"
          style={{ backgroundColor: "#3b82f6" }}
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.h2
            className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Best Selling
            <span
              className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-400"
              style={{
                backgroundImage: `linear-gradient(135deg, #3b82f6 0%, #a8f1ff 100%)`,
              }}
            >
              Books
            </span>
          </motion.h2>
          <motion.p
            className="text-xl text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Discover the most popular books that readers can&apos;t put down.
            From gripping fiction to life-changing non-fiction.
          </motion.p>
        </motion.div>

        {/* Books Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {books.map((book) => (
            <motion.div
              key={book.id}
              variants={bookVariants}
              className="group relative"
            >
              <Link href={`/shop/${book.id}`} className="block">
                <motion.div
                  className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-100 cursor-pointer"
                  whileHover={{
                    y: -8,
                    scale: 1.02,
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                  }}
                  transition={{
                    type: "spring",
                    damping: 20,
                    stiffness: 300,
                  }}
                >
                  {/* Book Cover */}
                  <div className="relative h-64 overflow-hidden">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                      className="w-full h-full"
                    >
                      <Image
                        src={book.coverImage}
                        alt={`${book.title} book cover`}
                        width={300}
                        height={400}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>

                    {/* Favorite Icon */}
                    <motion.button
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        try {
                          if (isInWishlist(book.id)) {
                            const result = await removeFromWishlist(book.id);
                            if (result.success) {
                              showSuccess("Removed from wishlist");
                            } else {
                              showError(
                                result.error || "Failed to remove from wishlist"
                              );
                            }
                          } else {
                            const result = await addToWishlist(book);
                            if (result.success) {
                              showSuccess("Added to wishlist");
                            } else {
                              showError(
                                result.error || "Failed to add to wishlist"
                              );
                            }
                          }
                        } catch (error) {
                          logger.error("Wishlist error:", error);
                          showError(
                            error.message ||
                              "Please log in to manage your wishlist"
                          );
                        }
                      }}
                      className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-full"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <HeartIcon
                        className={`h-5 w-5 ${
                          isInWishlist(book.id)
                            ? "text-red-500 fill-current"
                            : "text-white"
                        }`}
                      />
                    </motion.button>

                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                      <span
                        className="px-3 py-1 text-xs font-semibold rounded-full text-gray-800"
                        style={{ backgroundColor: "#a8f1ff" }}
                      >
                        {book.category}
                      </span>
                    </div>
                  </div>

                  {/* Book Details */}
                  <div className="p-6">
                    <h3 className="font-bold text-lg text-gray-900 mb-2">
                      {book.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {book.description}
                    </p>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center">
                        {renderStars(book.rating)}
                      </div>
                      <span className="text-sm text-gray-600">
                        {book.rating} ({book.reviews.toLocaleString()})
                      </span>
                    </div>

                    {/* Price and Action */}
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-gray-900">
                        {book.price}
                      </span>
                      <motion.button
                        onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();

                          try {
                            await addToCart(book, 1);
                          } catch (error) {
                            logger.error("Add to cart error:", error);

                            // Handle different error types with appropriate messages
                            if (error.code === "AUTHENTICATION_REQUIRED") {
                              showWarning(
                                "Please log in to add items to your cart"
                              );
                            } else if (error.code === "INSUFFICIENT_STOCK") {
                              showError("Sorry, this item is out of stock");
                            } else {
                              showError(
                                error.message || "Failed to add item to cart"
                              );
                            }
                          }
                        }}
                        disabled={!book.inStock}
                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${
                          book.inStock
                            ? "text-gray-800"
                            : "text-gray-500 cursor-not-allowed opacity-50"
                        }`}
                        style={{
                          backgroundColor: book.inStock ? "#a8f1ff" : "#f3f4f6",
                        }}
                        whileHover={
                          book.inStock
                            ? {
                                scale: 1.05,
                                backgroundColor: "#8ee8f7",
                              }
                            : {}
                        }
                        whileTap={book.inStock ? { scale: 0.95 } : {}}
                      >
                        {book.inStock ? "Add to Cart" : "Out of Stock"}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Link href="/shop?featured=bestseller">
            <motion.button
              className="inline-flex items-center gap-3 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl"
              style={{ backgroundColor: "#a8f1ff", color: "#1f2937" }}
              whileHover={{
                scale: 1.05,
                y: -2,
              }}
              whileTap={{ scale: 0.95 }}
            >
              Browse All Books
              <ArrowRightIcon className="h-5 w-5" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
