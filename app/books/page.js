"use client";

import { motion } from "framer-motion";
import BestSellingBooks from "@/components/best-selling-books";
import TrendingProducts from "@/components/trending-products";
import NewArrivals from "@/components/new-arrivals";

export default function BooksPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50/30 via-white to-cyan-50/20 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1
              className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Our{" "}
              <span
                className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-400"
                style={{
                  backgroundImage: `linear-gradient(135deg, #3b82f6 0%, #a8f1ff 100%)`,
                }}
              >
                Book Collection
              </span>
            </motion.h1>
            <motion.p
              className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Discover our comprehensive collection of educational books, from bestsellers 
              to the latest arrivals. Find the perfect resources for your learning journey.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Book Sections */}
      <BestSellingBooks />
      <TrendingProducts />
      <NewArrivals />
    </div>
  );
}
