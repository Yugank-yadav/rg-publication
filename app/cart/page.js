"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useCart } from "../../contexts/CartContext";
import {
  ShoppingBagIcon,
  TrashIcon,
  PlusIcon,
  MinusIcon,
  ChevronRightIcon,
  CreditCardIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { ShoppingBagIcon as ShoppingBagIconSolid } from "@heroicons/react/24/solid";

// Mock cart data - this would come from a global state management system
const mockCartItems = [
  {
    id: 1,
    title: "Complete Mathematics for Class 10",
    price: 250,
    quantity: 2,
    image: "📐",
    subject: "Mathematics",
    class: 10,
    author: "Dr. R.K. Sharma",
    isbn: "978-81-234-5678-9",
  },
  {
    id: 15,
    title: "Advanced Physics for Class 12",
    price: 300,
    quantity: 1,
    image: "⚛️",
    subject: "Science",
    class: 12,
    author: "Prof. A.K. Singh",
    isbn: "978-81-234-5679-6",
  },
  {
    id: 8,
    title: "Chemistry Practical Manual",
    price: 180,
    quantity: 1,
    image: "🧪",
    subject: "Science",
    class: 11,
    author: "Dr. M.L. Gupta",
    isbn: "978-81-234-5680-2",
  },
];

// Loading component
function CartLoading() {
  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="h-8 bg-gray-200 rounded animate-pulse mb-6 w-48"></div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-24 bg-gray-200 rounded animate-pulse"
                  ></div>
                ))}
              </div>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="h-6 bg-gray-200 rounded animate-pulse mb-4 w-32"></div>
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-4 bg-gray-200 rounded animate-pulse"
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Cart item component
function CartItem({ item, onUpdateQuantity, onRemove }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex items-start space-x-4">
        {/* Book Cover */}
        <div
          className={`w-20 h-24 flex items-center justify-center text-3xl rounded-lg ${
            item.subject === "Mathematics"
              ? "bg-gradient-to-br from-blue-100 to-blue-200"
              : "bg-gradient-to-br from-green-100 to-green-200"
          }`}
        >
          {item.image}
        </div>

        {/* Book Details */}
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <Link
                href={`/shop/${item.id}`}
                className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors duration-200"
              >
                {item.title}
              </Link>
              <p className="text-sm text-gray-600 mt-1">by {item.author}</p>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.subject === "Mathematics"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {item.subject}
                </span>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                  Class {item.class}
                </span>
              </div>
            </div>

            {/* Remove Button */}
            <motion.button
              onClick={() => onRemove(item.id)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
            >
              <TrashIcon className="h-5 w-5" />
            </motion.button>
          </div>

          {/* Quantity and Price */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700">
                Quantity:
              </span>
              <div className="flex items-center space-x-2">
                <motion.button
                  onClick={() =>
                    onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))
                  }
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-1 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
                >
                  <MinusIcon className="h-4 w-4" />
                </motion.button>
                <span className="w-12 text-center font-medium">
                  {item.quantity}
                </span>
                <motion.button
                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-1 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
                >
                  <PlusIcon className="h-4 w-4" />
                </motion.button>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-600">₹{item.price} each</p>
              <p className="text-lg font-bold text-gray-900">
                ₹{item.price * item.quantity}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Order summary component
function OrderSummary({ items, onCheckout }) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = subtotal > 500 ? 0 : 50;
  const tax = Math.round(subtotal * 0.18); // 18% GST
  const total = subtotal + shipping + tax;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white rounded-lg shadow-md p-6 h-fit sticky top-24"
    >
      <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>

      <div className="space-y-4 mb-6">
        <div className="flex justify-between text-gray-600">
          <span>
            Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)}{" "}
            items)
          </span>
          <span>₹{subtotal}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Shipping</span>
          <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Tax (GST 18%)</span>
          <span>₹{tax}</span>
        </div>
        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-between text-lg font-bold text-gray-900">
            <span>Total</span>
            <span>₹{total}</span>
          </div>
        </div>
      </div>

      {shipping > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-700">
            Add ₹{500 - subtotal} more to get free shipping!
          </p>
        </div>
      )}

      <motion.button
        onClick={onCheckout}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
        style={{ backgroundColor: "#3B82F6" }}
      >
        <CreditCardIcon className="h-5 w-5" />
        <span>Proceed to Checkout</span>
      </motion.button>

      {/* Trust indicators */}
      <div className="mt-6 space-y-3">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <ShieldCheckIcon className="h-4 w-4 text-green-500" />
          <span>Secure checkout</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <TruckIcon className="h-4 w-4 text-blue-500" />
          <span>Fast delivery</span>
        </div>
      </div>
    </motion.div>
  );
}

// Main cart component
export default function CartPage() {
  const {
    cartItems,
    isLoading,
    updateQuantity,
    removeFromCart,
    getCartTotals,
  } = useCart();

  const handleCheckout = () => {
    // In a real app, this would navigate to checkout page
    alert(
      "Checkout functionality will be implemented with payment gateway integration!"
    );
  };

  if (isLoading) {
    return <CartLoading />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              Home
            </Link>
            <ChevronRightIcon className="h-4 w-4 text-gray-400" />
            <span className="text-gray-900 font-medium">Shopping Cart</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {cartItems.length === 0 ? (
          // Empty cart state
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <ShoppingBagIconSolid className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Looks like you haven&apos;t added any books to your cart yet.
              Start browsing our collection to find your perfect study
              materials!
            </p>
            <div className="space-y-4">
              <Link
                href="/shop"
                className="inline-flex items-center px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200"
              >
                Browse Books
              </Link>
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                <Link
                  href="/"
                  className="hover:text-gray-700 flex items-center space-x-1"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  <span>Continue Shopping</span>
                </Link>
              </div>
            </div>
          </motion.div>
        ) : (
          // Cart with items
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-3xl font-bold text-gray-900">
                    Shopping Cart
                  </h1>
                  <p className="text-gray-600">
                    {cartItems.length}{" "}
                    {cartItems.length === 1 ? "item" : "items"}
                  </p>
                </div>

                <div className="space-y-4">
                  <AnimatePresence>
                    {cartItems.map((item) => (
                      <CartItem
                        key={item.id}
                        item={item}
                        onUpdateQuantity={updateQuantity}
                        onRemove={removeFromCart}
                      />
                    ))}
                  </AnimatePresence>
                </div>

                {/* Continue Shopping */}
                <div className="mt-8">
                  <Link
                    href="/shop"
                    className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Continue Shopping
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <OrderSummary items={cartItems} onCheckout={handleCheckout} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
