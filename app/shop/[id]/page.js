"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeftIcon,
  ShoppingCartIcon,
  HeartIcon,
  ShareIcon,
  StarIcon,
  ChevronRightIcon,
  PlusIcon,
  MinusIcon,
  CheckCircleIcon,
  BookOpenIcon,
  AcademicCapIcon,
  ClockIcon,
  LanguageIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import {
  StarIcon as StarIconSolid,
  CalculatorIcon,
  BeakerIcon,
} from "@heroicons/react/24/solid";
import { getProductById, getRelatedProducts } from "../../../data/products";

// Loading component for the product detail page
function ProductDetailLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb skeleton */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-12"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
          </div>
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image skeleton */}
          <div className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>

          {/* Product info skeleton */}
          <div className="space-y-6">
            <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4"></div>
            <div className="flex space-x-2">
              <div className="h-6 bg-gray-200 rounded animate-pulse w-20"></div>
              <div className="h-6 bg-gray-200 rounded animate-pulse w-16"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded animate-pulse w-32"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6"></div>
            </div>
            <div className="flex space-x-4">
              <div className="h-12 bg-gray-200 rounded animate-pulse flex-1"></div>
              <div className="h-12 bg-gray-200 rounded animate-pulse w-12"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Star rating component
function StarRating({ rating, reviews, size = "sm" }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIconSolid
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating ? "text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
      <span className="text-sm text-gray-600">
        {rating} ({reviews} reviews)
      </span>
    </div>
  );
}

// Quantity selector component
function QuantitySelector({ quantity, onQuantityChange, max = 10 }) {
  return (
    <div className="flex items-center border border-gray-300 rounded-md">
      <button
        onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
        disabled={quantity <= 1}
        className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <MinusIcon className="h-4 w-4" />
      </button>
      <span className="px-4 py-2 border-x border-gray-300 min-w-[3rem] text-center">
        {quantity}
      </span>
      <button
        onClick={() => onQuantityChange(Math.min(max, quantity + 1))}
        disabled={quantity >= max}
        className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <PlusIcon className="h-4 w-4" />
      </button>
    </div>
  );
}

// Main product detail component
export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [isLoading, setIsLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const productId = params.id;
        const productData = getProductById(productId);

        if (productData) {
          setProduct(productData);
          setRelatedProducts(getRelatedProducts(productId));
          setIsLoading(false);
        } else {
          // Product not found - redirect to 404 or shop page
          router.push("/shop");
        }
      } catch (error) {
        console.error("Error loading product:", error);
        router.push("/shop");
      }
    };

    loadProduct();
  }, [params.id, router]);

  if (isLoading) {
    return <ProductDetailLoading />;
  }

  if (!product) {
    return null;
  }

  const handleAddToCart = () => {
    // Add to cart logic here
    console.log(`Added ${quantity} of product ${product.id} to cart`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: product.subtitle,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const subjectIcon =
    product.subject === "Mathematics" ? CalculatorIcon : BeakerIcon;
  const subjectColor = product.subject === "Mathematics" ? "blue" : "green";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              Home
            </Link>
            <ChevronRightIcon className="h-4 w-4 text-gray-400" />
            <Link href="/shop" className="text-gray-500 hover:text-gray-700">
              Shop
            </Link>
            <ChevronRightIcon className="h-4 w-4 text-gray-400" />
            <span className="text-gray-900 font-medium truncate">
              {product.title}
            </span>
          </nav>
        </div>
      </div>

      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span>Back to Shop</span>
        </button>
      </div>

      {/* Main Product Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="aspect-square bg-white rounded-lg shadow-lg overflow-hidden"
          >
            <div
              className={`h-full flex items-center justify-center text-8xl relative ${
                product.subject === "Mathematics"
                  ? "bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300"
                  : "bg-gradient-to-br from-green-100 via-green-200 to-green-300"
              }`}
            >
              <div className="absolute inset-0 bg-white bg-opacity-10"></div>
              <span className="relative z-10 drop-shadow-lg">
                {product.image}
              </span>
            </div>
          </motion.div>

          {/* Product Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-6"
          >
            {/* Subject and Class Tags */}
            <div className="flex items-center space-x-2">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${subjectColor}-100 text-${subjectColor}-700`}
              >
                {React.createElement(subjectIcon, {
                  className: "h-4 w-4 mr-1",
                })}
                {product.subject}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                Class {product.class}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700">
                {product.type}
              </span>
            </div>

            {/* Title and Subtitle */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.title}
              </h1>
              <p className="text-lg text-gray-600">{product.subtitle}</p>
            </div>

            {/* Rating */}
            <StarRating
              rating={product.rating}
              reviews={product.reviews}
              size="md"
            />

            {/* Price */}
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold" style={{ color: "#a8f1ff" }}>
                ₹{product.price}
              </span>
              {product.originalPrice && (
                <span className="text-xl text-gray-500 line-through">
                  ₹{product.originalPrice}
                </span>
              )}
              {product.originalPrice && (
                <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                  Save ₹{product.originalPrice - product.price}
                </span>
              )}
            </div>

            {/* Availability */}
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
              <span className="text-green-600 font-medium">
                {product.availability}
              </span>
            </div>

            {/* Description */}
            <p className="text-gray-700 leading-relaxed">
              {product.description}
            </p>

            {/* Quantity and Actions */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">
                  Quantity:
                </span>
                <QuantitySelector
                  quantity={quantity}
                  onQuantityChange={setQuantity}
                />
              </div>

              <div className="flex space-x-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                >
                  <ShoppingCartIcon className="h-5 w-5" />
                  <span>Add to Cart</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`p-3 rounded-lg border transition-all duration-200 ${
                    isWishlisted
                      ? "bg-red-50 border-red-200 text-red-600"
                      : "bg-white border-gray-300 text-gray-600 hover:border-gray-400"
                  }`}
                >
                  <HeartIcon className="h-5 w-5" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleShare}
                  className="p-3 rounded-lg border border-gray-300 text-gray-600 hover:border-gray-400 bg-white transition-all duration-200"
                >
                  <ShareIcon className="h-5 w-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Product Details Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-16"
        >
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  {
                    id: "description",
                    label: "Description",
                    icon: DocumentTextIcon,
                  },
                  { id: "features", label: "Features", icon: CheckCircleIcon },
                  { id: "contents", label: "Contents", icon: BookOpenIcon },
                  { id: "details", label: "Details", icon: AcademicCapIcon },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                {activeTab === "description" && (
                  <motion.div
                    key="description"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <h3 className="text-lg font-semibold text-gray-900">
                      About This Book
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {product.description}
                    </p>
                    {product.learningObjectives && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          Learning Objectives:
                        </h4>
                        <ul className="space-y-1">
                          {product.learningObjectives.map(
                            (objective, index) => (
                              <li
                                key={index}
                                className="flex items-start space-x-2"
                              >
                                <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700">
                                  {objective}
                                </span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "features" && (
                  <motion.div
                    key="features"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <h3 className="text-lg font-semibold text-gray-900">
                      Key Features
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {product.features.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === "contents" && (
                  <motion.div
                    key="contents"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <h3 className="text-lg font-semibold text-gray-900">
                      Table of Contents
                    </h3>
                    <div className="space-y-2">
                      {product.tableOfContents.map((chapter, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </span>
                          <span className="text-gray-700">{chapter}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === "details" && (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <h3 className="text-lg font-semibold text-gray-900">
                      Product Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <span className="text-sm text-gray-500">ISBN:</span>
                            <p className="font-medium text-gray-900">
                              {product.isbn}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <AcademicCapIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <span className="text-sm text-gray-500">
                              Publisher:
                            </span>
                            <p className="font-medium text-gray-900">
                              {product.publisher}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <ClockIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <span className="text-sm text-gray-500">
                              Edition:
                            </span>
                            <p className="font-medium text-gray-900">
                              {product.edition}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <BookOpenIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <span className="text-sm text-gray-500">
                              Pages:
                            </span>
                            <p className="font-medium text-gray-900">
                              {product.pages}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <LanguageIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <span className="text-sm text-gray-500">
                              Language:
                            </span>
                            <p className="font-medium text-gray-900">
                              {product.language}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <CheckCircleIcon className="h-5 w-5 text-green-500" />
                          <div>
                            <span className="text-sm text-gray-500">
                              Availability:
                            </span>
                            <p className="font-medium text-green-600">
                              {product.availability}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-16"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Related Products
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct, index) => (
                <motion.div
                  key={relatedProduct.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  <Link href={`/shop/${relatedProduct.id}`}>
                    <div
                      className={`h-32 flex items-center justify-center text-3xl relative ${
                        relatedProduct.subject === "Mathematics"
                          ? "bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300"
                          : "bg-gradient-to-br from-green-100 via-green-200 to-green-300"
                      }`}
                    >
                      <div className="absolute inset-0 bg-white bg-opacity-10"></div>
                      <span className="relative z-10 drop-shadow-sm">
                        {relatedProduct.image}
                      </span>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center space-x-1 mb-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            relatedProduct.subject === "Mathematics"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {relatedProduct.subject}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                          Class {relatedProduct.class}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">
                        {relatedProduct.title}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span
                          className="text-lg font-bold"
                          style={{ color: "#a8f1ff" }}
                        >
                          ₹{relatedProduct.price}
                        </span>
                        <StarRating
                          rating={relatedProduct.rating}
                          reviews={relatedProduct.reviews}
                          size="sm"
                        />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
