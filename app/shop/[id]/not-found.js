"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeftIcon, HomeIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";

export default function ProductNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* 404 Illustration */}
          <div className="text-8xl mb-8">📚</div>
          
          {/* Error Message */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-gray-900">
              Product Not Found
            </h1>
            <p className="text-lg text-gray-600">
              Sorry, we couldn't find the book you're looking for. It might have been moved or doesn't exist.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Link href="/shop">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <ShoppingBagIcon className="h-5 w-5" />
                <span>Browse All Books</span>
              </motion.button>
            </Link>
            
            <Link href="/">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 border border-gray-300 shadow-sm hover:shadow-md"
              >
                <HomeIcon className="h-5 w-5" />
                <span>Go to Homepage</span>
              </motion.button>
            </Link>
          </div>

          {/* Back Link */}
          <button
            onClick={() => window.history.back()}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mx-auto"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Go Back</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
