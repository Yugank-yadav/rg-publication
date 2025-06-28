"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { productAPI } from "@/lib/api";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useToast } from "@/contexts/ToastContext";
import logger from "@/lib/logger";
import {
  ArrowRightIcon,
  StarIcon,
  HeartIcon,
  FireIcon,
} from "@heroicons/react/24/outline";
import {
  StarIcon as StarSolidIcon,
  HeartIcon as HeartIconSolid,
} from "@heroicons/react/24/solid";

// Loading component following profile page skeleton pattern
function TrendingProductsLoading() {
  return (
    <section className="relative py-20 bg-gradient-to-br from-orange-50/30 via-white to-red-50/20 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-10 w-32 h-32 rounded-full opacity-10 bg-gray-200 animate-pulse" />
        <div className="absolute bottom-20 left-10 w-24 h-24 rounded-full opacity-10 bg-gray-200 animate-pulse" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header Skeleton */}
        <div className="text-center mb-16">
          <div className="h-8 bg-gray-200 rounded-full animate-pulse mb-6 mx-auto w-32"></div>
          <div className="h-12 bg-gray-200 rounded animate-pulse mb-6 mx-auto max-w-md"></div>
          <div className="h-6 bg-gray-200 rounded animate-pulse mx-auto max-w-3xl"></div>
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
                  <div className="h-10 bg-gray-200 rounded animate-pulse w-24"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action Skeleton */}
        <div className="text-center">
          <div className="h-12 bg-gray-200 rounded-xl animate-pulse mx-auto w-48"></div>
        </div>
      </div>
    </section>
  );
}

export default function TrendingProducts() {
  const [isLoading, setIsLoading] = useState(true);
  const [books, setBooks] = useState([]);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { showSuccess, showError, showWarning } = useToast();
  // No static data - all content should come from API

  // Load trending books from API
  useEffect(() => {
    const loadTrendingBooks = async () => {
      try {
        setIsLoading(true);

        const response = await productAPI.getFeaturedProducts("trending");

        if (response.success) {
          // Transform API data to match component expectations
          const transformedBooks = response.data.trending.map((product) => ({
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
          // No fallback to static data - show empty state
          setBooks([]);
        }
      } catch (err) {
        logger.error("Error loading trending books:", err);
        // No fallback to static data - show empty state
        setBooks([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadTrendingBooks();
  }, []);

  // Show loading state
  if (isLoading) {
    return <TrendingProductsLoading />;
  }

  // Show empty state if no books
  if (books.length === 0) {
    return (
      <section className="relative py-20 bg-gradient-to-br from-orange-50/30 via-white to-red-50/20 overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{ backgroundColor: "#a8f1ff20" }}
              whileHover={{ scale: 1.05 }}
            >
              <FireIcon className="h-5 w-5 text-orange-500" />
              <span className="text-sm font-semibold text-gray-700">
                Trending Now
              </span>
            </motion.div>

            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Trending{" "}
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                Products
              </span>
            </h2>
          </motion.div>

          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <FireIcon className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              No Trending Products Available
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              We&apos;re currently updating our trending list. Please check back
              soon or browse our full catalog.
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

  return (
    <section className="relative py-20 bg-gradient-to-br from-orange-50/30 via-white to-red-50/20 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 right-10 w-32 h-32 rounded-full opacity-10"
          style={{ backgroundColor: "#f97316" }}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute bottom-20 left-10 w-24 h-24 rounded-full opacity-10"
          style={{ backgroundColor: "#ef4444" }}
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{ backgroundColor: "#a8f1ff20" }}
            whileHover={{ scale: 1.05 }}
          >
            <FireIcon className="h-5 w-5 text-orange-500" />
            <span className="text-sm font-semibold text-gray-700">
              Trending Now
            </span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Trending{" "}
            <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              Products
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover the hottest books and publications that everyone is talking
            about. Stay ahead with the latest trending content across all
            categories.
          </p>
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

                    {/* Trending Badge */}
                    <div className="absolute top-4 left-4">
                      <motion.div
                        className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                        animate={{
                          scale: [1, 1.05, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <FireIcon className="h-3 w-3 text-white" />
                        <span className="text-xs font-semibold text-white">
                          Trending
                        </span>
                      </motion.div>
                    </div>

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
                      {isInWishlist(book.id) ? (
                        <HeartIconSolid className="h-5 w-5 text-red-500" />
                      ) : (
                        <HeartIcon className="h-5 w-5 text-white" />
                      )}
                    </motion.button>

                    {/* Category Badge */}
                    <div className="absolute bottom-4 left-4">
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
          <Link href="/shop?featured=trending">
            <motion.button
              className="inline-flex items-center gap-3 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl"
              style={{ backgroundColor: "#a8f1ff", color: "#1f2937" }}
              whileHover={{
                scale: 1.05,
                y: -2,
              }}
              whileTap={{ scale: 0.95 }}
            >
              Browse All Trending
              <ArrowRightIcon className="h-5 w-5" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
