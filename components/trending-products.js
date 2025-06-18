"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRightIcon,
  StarIcon,
  HeartIcon,
  FireIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";

export default function TrendingProducts() {
  // Static data for trending books
  const trendingBooks = [
    {
      id: 1,
      title: "Advanced Physics Concepts",
      author: "Dr. Sarah Chen",
      description:
        "Explore cutting-edge physics theories and their real-world applications in this comprehensive guide.",
      price: "$18.99",
      rating: 4.9,
      reviews: 8547,
      coverImage:
        "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=300&h=400&fit=crop&auto=format",
      category: "Physics",
    },
    {
      id: 2,
      title: "Digital Marketing Mastery",
      author: "Alex Rodriguez",
      description:
        "Master the art of digital marketing with proven strategies and modern techniques for success.",
      price: "$22.99",
      rating: 4.8,
      reviews: 12394,
      coverImage:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=400&fit=crop&auto=format",
      category: "Business",
    },
    {
      id: 3,
      title: "Creative Writing Workshop",
      author: "Emma Thompson",
      description:
        "Unlock your creative potential with exercises and techniques from award-winning authors.",
      price: "$16.99",
      rating: 4.7,
      reviews: 9876,
      coverImage:
        "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop&auto=format",
      category: "Writing",
    },
    {
      id: 4,
      title: "Modern Web Development",
      author: "Jake Wilson",
      description:
        "Build modern web applications with the latest technologies and best practices in development.",
      price: "$24.99",
      rating: 4.9,
      reviews: 15432,
      coverImage:
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300&h=400&fit=crop&auto=format",
      category: "Technology",
    },
  ];

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
          {trendingBooks.map((book) => (
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
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Wishlist logic here
                        console.log(`Added ${book.title} to wishlist`);
                      }}
                      className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-full"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <HeartIcon className="h-5 w-5 text-white" />
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
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          // Add to cart logic here
                          console.log(`Added ${book.title} to cart`);
                        }}
                        className="px-4 py-2 text-sm font-semibold rounded-lg text-gray-800 transition-all duration-300"
                        style={{ backgroundColor: "#a8f1ff" }}
                        whileHover={{
                          scale: 1.05,
                          backgroundColor: "#8ee8f7",
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Add to Cart
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
