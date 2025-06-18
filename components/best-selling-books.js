"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRightIcon,
  StarIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";

export default function BestSellingBooks() {
  // Static data for bestselling books
  const bestsellingBooks = [
    {
      id: 1,
      title: "Mathematics Learner’s Practice Book 8",
      author: "Matt Haig",
      description:
        "A dazzling novel about all the choices that go into a life well lived, from the internationally bestselling author.",
      price: "$14.99",
      rating: 4.8,
      reviews: 12847,
      coverImage:
        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop&auto=format",
      category: "Maths",
    },
    {
      id: 2,
      title: "Mathematics Learner’s Solution Book 8",
      author: "James Clear",
      description:
        "An easy & proven way to build good habits & break bad ones. Transform your life with tiny changes in behavior.",
      price: "$16.99",
      rating: 4.9,
      reviews: 28394,
      coverImage:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop&auto=format",
      category: "Maths",
    },
    {
      id: 3,
      title: "SCIENCE LEARNER’S SOLUTION BOOK 8 ",
      author: "Taylor Jenkins Reid",
      description:
        "A reclusive Hollywood icon finally tells her story in this captivating and unforgettable novel.",
      price: "$13.99",
      rating: 4.7,
      reviews: 19283,
      coverImage:
        "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop&auto=format",
      category: "Science",
    },
    {
      id: 4,
      title: "Educated",
      author: "Tara Westover",
      description:
        "A memoir about a young girl who, kept out of school, leaves her survivalist family and goes on to earn a PhD.",
      price: "$15.99",
      rating: 4.6,
      reviews: 15672,
      coverImage:
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=400&fit=crop&auto=format",
      category: "Memoir",
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
          {bestsellingBooks.map((book) => (
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
