"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { productAPI } from "@/lib/api";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useToast } from "@/contexts/ToastContext";
import logger from "@/lib/logger";
import {
  FunnelIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";
import {
  CalculatorIcon,
  BeakerIcon,
  ShoppingCartIcon,
} from "@heroicons/react/16/solid";

// Metadata is handled by layout.js for client components

// Custom styles for the range slider
const sliderStyles = `
  .slider::-webkit-slider-thumb {
    appearance: none;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #a8f1ff;
    cursor: pointer;
    border: 2px solid #ffffff;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  }

  .slider::-moz-range-thumb {
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #a8f1ff;
    cursor: pointer;
    border: 2px solid #ffffff;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  }
`;

// No static data - all content should come from API

function ShopContent() {
  const searchParams = useSearchParams();
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    subjects: [],
    classes: [],
    types: [],
    priceRange: [200, 500],
    featured: "", // New featured filter: "", "bestseller", "trending", "new-arrival"
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("class");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { showSuccess, showError } = useToast();

  // Load products from API
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await productAPI.getProducts({
          page: 1,
          limit: 50, // Load more products for shop page
          sortBy: "class",
          sortOrder: "asc",
        });

        if (response.success) {
          // Transform API data to match component expectations
          const transformedBooks = response.data.products.map((product) => ({
            id: product.id || product._id,
            title: product.title,
            subject: product.subject,
            class: product.class,
            type: product.type || "Textbook",
            price: product.price,
            image: product.images?.[0]?.url || null,
            featured: product.featured || null,
            inStock: product.inStock,
            author: product.author,
            description: product.description,
            coverImage: product.images?.[0]?.url,
          }));

          setFilteredBooks(transformedBooks);
        } else {
          setError("Failed to load products");
          // No fallback to static data - show empty state
          setFilteredBooks([]);
        }
      } catch (err) {
        logger.error("Error loading products:", err);
        setError("Failed to load products");
        // No fallback to static data - show empty state
        setFilteredBooks([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Apply filters from URL parameters whenever they change
  useEffect(() => {
    const subject = searchParams.get("subject");
    const classParam = searchParams.get("class");
    const featured = searchParams.get("featured");

    // Start with clean filter state for navigation-driven filtering
    const newFilters = {
      subjects: [],
      classes: [],
      types: [],
      priceRange: [200, 500],
      featured: "",
    };

    // Apply subject filter if present in URL
    if (subject) {
      newFilters.subjects = [subject];
    }

    // Apply class filter if present in URL
    if (classParam) {
      const classNum = parseInt(classParam);
      if (!isNaN(classNum)) {
        newFilters.classes = [classNum];
      }
    }

    // Apply featured filter if present in URL
    if (
      featured &&
      ["bestseller", "trending", "new-arrival"].includes(featured)
    ) {
      newFilters.featured = featured;
    }

    // Update filters state
    setFilters(newFilters);
  }, [searchParams]);

  // Filter and search logic with API integration
  useEffect(() => {
    const applyFiltersAndSearch = async () => {
      try {
        // Build search parameters
        const searchParams = {
          page: 1,
          limit: 100,
          sortBy:
            sortBy === "class"
              ? "class"
              : sortBy === "alphabetical"
              ? "title"
              : "price",
          sortOrder: sortBy === "price-high" ? "desc" : "asc",
        };

        // Add search query
        if (searchQuery) {
          searchParams.q = searchQuery;
        }

        // Add subject filter
        if (filters.subjects.length > 0) {
          searchParams.subject = filters.subjects.join(",");
        }

        // Add class filter
        if (filters.classes.length > 0) {
          searchParams.class = filters.classes.join(",");
        }

        // Add type filter
        if (filters.types.length > 0) {
          searchParams.type = filters.types.join(",");
        }

        // Add price range filter
        if (filters.priceRange[0] > 200) {
          searchParams.priceMin = filters.priceRange[0];
        }
        if (filters.priceRange[1] < 500) {
          searchParams.priceMax = filters.priceRange[1];
        }

        // Add featured filter
        if (filters.featured) {
          searchParams.featured = filters.featured;
        }

        // Call search API
        const response = await productAPI.searchProducts(searchParams);

        if (response.success) {
          // Transform API data to match component expectations
          const transformedBooks = response.data.results.map((product) => ({
            id: product.id || product._id,
            title: product.title,
            subject: product.subject,
            class: product.class,
            type: product.type || "Textbook",
            price: product.price,
            image: product.images?.[0]?.url || null,
            featured: product.featured || null,
            inStock: product.inStock,
            author: product.author,
            description: product.description,
            coverImage: product.images?.[0]?.url,
          }));

          setFilteredBooks(transformedBooks);
          return;
        }
      } catch (error) {
        logger.error("Search/filter error:", error);
      }

      // No fallback to client-side filtering - show empty state
      setFilteredBooks([]);
      return;
    };

    // Debounce the search to avoid too many API calls
    const debounceTimer = setTimeout(() => {
      applyFiltersAndSearch();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [filters, searchQuery, sortBy]);

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter((item) => item !== value)
        : [...prev[filterType], value],
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      subjects: [],
      classes: [],
      types: [],
      priceRange: [200, 500],
      featured: "",
    });
    setSearchQuery("");
  };

  // Wishlist toggle function
  const toggleWishlist = async (book) => {
    try {
      if (isInWishlist(book.id)) {
        const result = await removeFromWishlist(book.id);
        if (result.success) {
          showSuccess("Removed from wishlist");
        } else {
          showError(result.error || "Failed to remove from wishlist");
        }
      } else {
        const result = await addToWishlist(book);
        if (result.success) {
          showSuccess("Added to wishlist");
        } else {
          showError(result.error || "Failed to add to wishlist");
        }
      }
    } catch (error) {
      logger.error("Wishlist error:", error);
      showError(error.message || "Please log in to manage your wishlist");
    }
  };

  // Add to cart function with proper error handling
  const handleAddToCart = async (book) => {
    try {
      await addToCart(book, 1);
    } catch (error) {
      logger.error("Add to cart error:", error);

      // Handle different error types with appropriate messages
      if (error.code === "AUTHENTICATION_REQUIRED") {
        showWarning("Please log in to add items to your cart");
      } else if (error.code === "INSUFFICIENT_STOCK") {
        showError("Sorry, this item is out of stock");
      } else {
        showError(error.message || "Failed to add item to cart");
      }
    }
  };

  // Show loading state
  if (isLoading) {
    return <ShopLoading />;
  }

  return (
    <div className="bg-gray-50 pb-8">
      <style jsx>{sliderStyles}</style>
      {/* Fixed Header Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb */}

          {/* Header */}
          <section className="relative bg-gradient-to-br from-blue-50/30 via-white to-cyan-50/20 py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <motion.h1
                  className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  Educational{" "}
                  <span
                    className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-400"
                    style={{
                      backgroundImage: `linear-gradient(135deg, #3b82f6 0%, #a8f1ff 100%)`,
                    }}
                  >
                    Book Shop
                  </span>
                </motion.h1>
                <motion.p
                  className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  Discover our comprehensive collection of Mathematics and
                  Science textbooks designed for students from Class 5 to Class
                  12.
                </motion.p>
              </div>
            </div>
          </section>

          {/* Search and Sort Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search books by title, subject, or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent shadow-sm transition-all duration-200"
                style={{
                  "--tw-ring-color": "#a8f1ff",
                }}
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent shadow-sm transition-all duration-200 bg-white"
              style={{
                "--tw-ring-color": "#a8f1ff",
              }}
            >
              <option value="class">Sort by Class</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="alphabetical">Alphabetical</option>
            </select>

            {/* Mobile Filter Toggle */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="lg:hidden flex items-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm transition-all duration-200"
            >
              <FunnelIcon className="h-5 w-5" />
              Filters
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main Layout Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="flex flex-col lg:flex-row gap-6 py-6">
          {/* Desktop Sticky Sidebar */}
          <div className="hidden lg:block w-72 sticky top-80 h-fit">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Filters</h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearAllFilters}
                  className="text-sm font-medium px-3 py-1 rounded-lg transition-colors"
                  style={{
                    color: "#a8f1ff",
                    backgroundColor: "rgba(168, 241, 255, 0.1)",
                  }}
                >
                  Clear All
                </motion.button>
              </div>

              {/* Subject Filter */}
              <div className="mb-8">
                <h4 className="font-semibold text-gray-900 mb-4 text-lg">
                  Subject
                </h4>
                <div className="space-y-3">
                  <motion.label
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={filters.subjects.includes("Mathematics")}
                      onChange={() =>
                        handleFilterChange("subjects", "Mathematics")
                      }
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <CalculatorIcon className="h-5 w-5 text-blue-500 ml-3 mr-3" />
                    <span className="text-gray-700 font-medium">
                      Mathematics
                    </span>
                  </motion.label>
                  <motion.label
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={filters.subjects.includes("Science")}
                      onChange={() => handleFilterChange("subjects", "Science")}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500 w-4 h-4"
                    />
                    <BeakerIcon className="h-5 w-5 text-green-500 ml-3 mr-3" />
                    <span className="text-gray-700 font-medium">Science</span>
                  </motion.label>
                </div>
              </div>

              {/* Featured Collections Filter */}
              <div className="mb-8">
                <h4 className="font-semibold text-gray-900 mb-4 text-lg">
                  Featured Collections
                </h4>
                <div className="space-y-3">
                  <select
                    value={filters.featured}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        featured: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent shadow-sm transition-all duration-200 bg-white"
                    style={{
                      "--tw-ring-color": "#a8f1ff",
                    }}
                  >
                    <option value="">All Products</option>
                    <option value="bestseller">Best Selling Books</option>
                    <option value="trending">Trending Products</option>
                    <option value="new-arrival">New Arrivals</option>
                  </select>
                </div>
              </div>

              {/* Class Filter */}
              <div className="mb-8">
                <h4 className="font-semibold text-gray-900 mb-4 text-lg">
                  Class Level
                </h4>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 6, 7, 8, 9, 10, 11, 12].map((classNum) => (
                    <motion.label
                      key={classNum}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center justify-center p-2 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.classes.includes(classNum)}
                        onChange={() => handleFilterChange("classes", classNum)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2 w-3 h-3"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {classNum}
                      </span>
                    </motion.label>
                  ))}
                </div>
              </div>

              {/* Book Type Filter */}
              <div className="mb-8">
                <h4 className="font-semibold text-gray-900 mb-4 text-lg">
                  Book Type
                </h4>
                <div className="space-y-3">
                  {[
                    "Textbook",
                    "Practice Book",
                    "Lab Manual",
                    "Advanced Guide",
                  ].map((type) => (
                    <motion.label
                      key={type}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.types.includes(type)}
                        onChange={() => handleFilterChange("types", type)}
                        className="rounded border-gray-300 focus:ring-2 w-4 h-4"
                        style={{
                          color: "#a8f1ff",
                          "--tw-ring-color": "#a8f1ff",
                        }}
                      />
                      <span className="text-gray-700 ml-3 font-medium">
                        {type}
                      </span>
                    </motion.label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-4 text-lg">
                  Price Range
                </h4>
                <div className="px-3">
                  <input
                    type="range"
                    min="200"
                    max="500"
                    value={filters.priceRange[1]}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        priceRange: [200, parseInt(e.target.value)],
                      }))
                    }
                    className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #a8f1ff 0%, #a8f1ff ${
                        ((filters.priceRange[1] - 200) / 300) * 100
                      }%, #e5e7eb ${
                        ((filters.priceRange[1] - 200) / 300) * 100
                      }%, #e5e7eb 100%)`,
                    }}
                  />
                  <div className="flex justify-between text-sm text-gray-600 mt-2">
                    <span className="font-medium">₹200</span>
                    <span className="font-bold" style={{ color: "#a8f1ff" }}>
                      ₹{filters.priceRange[1]}
                    </span>
                    <span className="font-medium">₹500</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Filter Panel */}
          <AnimatePresence>
            {isMobileFilterOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="lg:hidden bg-white rounded-lg shadow-lg p-6 mb-6 mx-4 sm:mx-0"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Filters
                  </h3>
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Mobile filter content - same as desktop but in mobile layout */}
                <div className="space-y-6">
                  {/* Featured Collections Filter */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">
                      Featured Collections
                    </h4>
                    <select
                      value={filters.featured}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          featured: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent bg-white"
                      style={{
                        "--tw-ring-color": "#a8f1ff",
                      }}
                    >
                      <option value="">All Products</option>
                      <option value="bestseller">Best Selling Books</option>
                      <option value="trending">Trending Products</option>
                      <option value="new-arrival">New Arrivals</option>
                    </select>
                  </div>

                  {/* Subject Filter */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Subject</h4>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.subjects.includes("Mathematics")}
                          onChange={() =>
                            handleFilterChange("subjects", "Mathematics")
                          }
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <CalculatorIcon className="h-4 w-4 text-blue-500 ml-2 mr-2" />
                        <span className="text-gray-700">Mathematics</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.subjects.includes("Science")}
                          onChange={() =>
                            handleFilterChange("subjects", "Science")
                          }
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <BeakerIcon className="h-4 w-4 text-green-500 ml-2 mr-2" />
                        <span className="text-gray-700">Science</span>
                      </label>
                    </div>
                  </div>

                  {/* Class Filter */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">
                      Class Level
                    </h4>
                    <div className="grid grid-cols-4 gap-2">
                      {[5, 6, 7, 8, 9, 10, 11, 12].map((classNum) => (
                        <label key={classNum} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.classes.includes(classNum)}
                            onChange={() =>
                              handleFilterChange("classes", classNum)
                            }
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-1"
                          />
                          <span className="text-sm text-gray-700">
                            {classNum}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={clearAllFilters}
                    className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium"
                  >
                    Clear All Filters
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content Area */}
          <div className="flex-1">
            <div className="lg:pr-2">
              {/* Desktop Scrollable Container */}
              <div
                className="hidden lg:block lg:max-h-screen lg:overflow-y-auto"
                style={{ maxHeight: "calc(100vh - 200px)" }}
              >
                {/* Results Header */}
                <div className="flex items-center justify-between mb-4 sticky top-0 bg-gray-50 py-3 z-10">
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-gray-600 text-sm"
                  >
                    Showing{" "}
                    <span className="font-semibold text-gray-900">
                      {filteredBooks.length}
                    </span>{" "}
                    books found
                  </motion.p>
                </div>

                {/* Active Filters Display - Desktop */}
                {(filters.subjects.length > 0 ||
                  filters.classes.length > 0 ||
                  filters.types.length > 0 ||
                  filters.featured) && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-blue-900">
                        Active Filters:
                      </h4>
                      <button
                        onClick={clearAllFilters}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {filters.subjects.map((subject) => (
                        <span
                          key={subject}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {subject}
                          <button
                            onClick={() =>
                              handleFilterChange("subjects", subject)
                            }
                            className="hover:bg-blue-200 rounded-full p-0.5"
                          >
                            <XMarkIcon className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                      {filters.classes.map((classNum) => (
                        <span
                          key={classNum}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                        >
                          Class {classNum}
                          <button
                            onClick={() =>
                              handleFilterChange("classes", classNum)
                            }
                            className="hover:bg-green-200 rounded-full p-0.5"
                          >
                            <XMarkIcon className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                      {filters.types.map((type) => (
                        <span
                          key={type}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                        >
                          {type}
                          <button
                            onClick={() => handleFilterChange("types", type)}
                            className="hover:bg-purple-200 rounded-full p-0.5"
                          >
                            <XMarkIcon className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                      {filters.featured && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                          {filters.featured === "bestseller"
                            ? "🏆 Best Selling Books"
                            : filters.featured === "trending"
                            ? "🔥 Trending Products"
                            : filters.featured === "new-arrival"
                            ? "✨ New Arrivals"
                            : "Featured"}
                          <button
                            onClick={() =>
                              setFilters((prev) => ({ ...prev, featured: "" }))
                            }
                            className="hover:bg-orange-200 rounded-full p-0.5"
                          >
                            <XMarkIcon className="h-3 w-3" />
                          </button>
                        </span>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Books Grid - Desktop */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-8 mb-8">
                  {filteredBooks.map((book, index) => (
                    <motion.div
                      key={book.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ delay: index * 0.02 }}
                      whileHover={{
                        scale: 1.02,
                        y: -2,
                        transition: { duration: 0.2 },
                      }}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200 cursor-pointer"
                    >
                      <Link href={`/shop/${book.id}`} className="block">
                        {/* Book Cover */}
                        <div
                          className={`h-36 flex items-center justify-center text-4xl relative overflow-hidden ${
                            book.subject === "Mathematics"
                              ? "bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300"
                              : "bg-gradient-to-br from-green-100 via-green-200 to-green-300"
                          }`}
                        >
                          {/* <div className="absolute inset-0 bg-white bg-opacity-10"></div>
                          <span className="relative z-10 drop-shadow-sm">
                            {book.image}
                          </span> */}

                          <img
                            src={book.image}
                            alt={book.title}
                            className="w-full h-full object-cover"
                          />

                          {/* Featured Badge */}
                          {book.featured && (
                            <div className="absolute top-2 right-2 z-20">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-bold text-white shadow-lg ${
                                  book.featured === "bestseller"
                                    ? "bg-gradient-to-r from-blue-600 to-cyan-400"
                                    : book.featured === "trending"
                                    ? "bg-gradient-to-r from-orange-500 to-red-500"
                                    : book.featured === "new-arrival"
                                    ? "bg-gradient-to-r from-purple-500 to-indigo-500"
                                    : "bg-gray-500"
                                }`}
                              >
                                {book.featured === "bestseller"
                                  ? "🏆 Best Seller"
                                  : book.featured === "trending"
                                  ? "🔥 Trending"
                                  : book.featured === "new-arrival"
                                  ? "✨ New"
                                  : "Featured"}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Book Details */}
                        <div className="p-4">
                          {/* Subject and Class Tags */}
                          <div className="flex items-center gap-1 mb-3 flex-wrap">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                book.subject === "Mathematics"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {book.subject}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                              Class {book.class}
                            </span>
                          </div>

                          {/* Book Title */}
                          <h3 className="text-sm font-semibold text-gray-900 mb-3 leading-tight line-clamp-2">
                            {book.title}
                          </h3>

                          {/* Price */}
                          <div className="flex items-center justify-between mb-4">
                            <span
                              className="text-xl font-bold"
                              style={{ color: "#a8f1ff" }}
                            >
                              ₹{book.price}
                            </span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleAddToCart(book);
                              }}
                              disabled={!book.inStock}
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md font-medium transition-all duration-200 flex items-center justify-center gap-1 text-sm shadow-sm hover:shadow-md"
                            >
                              <ShoppingCartIcon className="h-3 w-3" />
                              Add to Cart
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleWishlist(book);
                              }}
                              className={`px-3 py-2 border rounded-md transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md ${
                                isInWishlist(book.id)
                                  ? "border-red-300 bg-red-50 text-red-600 hover:border-red-400"
                                  : "border-gray-300 bg-white text-gray-600 hover:border-gray-400"
                              }`}
                            >
                              <HeartIcon className="h-3 w-3" />
                            </motion.button>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* No Results - Desktop */}
                {filteredBooks.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-12"
                  >
                    <div className="text-6xl mb-4">📚</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      No books found
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Try adjusting your filters or search query to find more
                      books.
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={clearAllFilters}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      Clear All Filters
                    </motion.button>
                  </motion.div>
                )}
              </div>

              {/* Mobile/Tablet Natural Flow Container */}
              <div className="lg:hidden">
                {/* Results Header */}
                <div className="flex items-center justify-between mb-4 bg-gray-50 py-3">
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-gray-600 text-sm"
                  >
                    Showing{" "}
                    <span className="font-semibold text-gray-900">
                      {filteredBooks.length}
                    </span>{" "}
                    books found
                  </motion.p>
                </div>

                {/* Active Filters Display - Mobile */}
                {(filters.subjects.length > 0 ||
                  filters.classes.length > 0 ||
                  filters.types.length > 0 ||
                  filters.featured) && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-blue-900">
                        Active Filters:
                      </h4>
                      <button
                        onClick={clearAllFilters}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {filters.subjects.map((subject) => (
                        <span
                          key={subject}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {subject}
                          <button
                            onClick={() =>
                              handleFilterChange("subjects", subject)
                            }
                            className="hover:bg-blue-200 rounded-full p-0.5"
                          >
                            <XMarkIcon className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                      {filters.classes.map((classNum) => (
                        <span
                          key={classNum}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                        >
                          Class {classNum}
                          <button
                            onClick={() =>
                              handleFilterChange("classes", classNum)
                            }
                            className="hover:bg-green-200 rounded-full p-0.5"
                          >
                            <XMarkIcon className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                      {filters.types.map((type) => (
                        <span
                          key={type}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                        >
                          {type}
                          <button
                            onClick={() => handleFilterChange("types", type)}
                            className="hover:bg-purple-200 rounded-full p-0.5"
                          >
                            <XMarkIcon className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                      {filters.featured && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                          {filters.featured === "bestseller"
                            ? "🏆 Best Selling Books"
                            : filters.featured === "trending"
                            ? "🔥 Trending Products"
                            : filters.featured === "new-arrival"
                            ? "✨ New Arrivals"
                            : "Featured"}
                          <button
                            onClick={() =>
                              setFilters((prev) => ({ ...prev, featured: "" }))
                            }
                            className="hover:bg-orange-200 rounded-full p-0.5"
                          >
                            <XMarkIcon className="h-3 w-3" />
                          </button>
                        </span>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Books Grid - Mobile */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-16 mb-16">
                  {filteredBooks.map((book, index) => (
                    <motion.div
                      key={book.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ delay: index * 0.02 }}
                      whileHover={{
                        scale: 1.02,
                        y: -2,
                        transition: { duration: 0.2 },
                      }}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200 cursor-pointer"
                    >
                      <Link href={`/shop/${book.id}`} className="block">
                        {/* Book Cover */}
                        <div className="h-36 relative overflow-hidden">
                          {book.coverImage ? (
                            <img
                              src={book.coverImage}
                              alt={book.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div
                              className={`h-full flex items-center justify-center text-4xl relative ${
                                book.subject === "Mathematics"
                                  ? "bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300"
                                  : "bg-gradient-to-br from-green-100 via-green-200 to-green-300"
                              }`}
                            >
                              <div className="absolute inset-0 bg-white bg-opacity-10"></div>
                              <span className="relative z-10 drop-shadow-sm">
                                {book.subject === "Mathematics" ? "📐" : "🔬"}
                              </span>
                            </div>
                          )}

                          {/* Featured Badge */}
                          {book.featured && (
                            <div className="absolute top-2 right-2 z-20">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-bold text-white shadow-lg ${
                                  book.featured === "bestseller"
                                    ? "bg-gradient-to-r from-blue-600 to-cyan-400"
                                    : book.featured === "trending"
                                    ? "bg-gradient-to-r from-orange-500 to-red-500"
                                    : book.featured === "new-arrival"
                                    ? "bg-gradient-to-r from-purple-500 to-indigo-500"
                                    : "bg-gray-500"
                                }`}
                              >
                                {book.featured === "bestseller"
                                  ? "🏆 Best Seller"
                                  : book.featured === "trending"
                                  ? "🔥 Trending"
                                  : book.featured === "new-arrival"
                                  ? "✨ New"
                                  : "Featured"}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Book Details */}
                        <div className="p-4">
                          {/* Subject and Class Tags */}
                          <div className="flex items-center gap-1 mb-3 flex-wrap">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                book.subject === "Mathematics"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {book.subject}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                              Class {book.class}
                            </span>
                          </div>

                          {/* Book Title */}
                          <h3 className="text-sm font-semibold text-gray-900 mb-3 leading-tight line-clamp-2">
                            {book.title}
                          </h3>

                          {/* Price */}
                          <div className="flex items-center justify-between mb-4">
                            <span
                              className="text-xl font-bold"
                              style={{ color: "#a8f1ff" }}
                            >
                              ₹{book.price}
                            </span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleAddToCart(book);
                              }}
                              disabled={!book.inStock}
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md font-medium transition-all duration-200 flex items-center justify-center gap-1 text-sm shadow-sm hover:shadow-md"
                            >
                              <ShoppingCartIcon className="h-3 w-3" />
                              Add to Cart
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleWishlist(book);
                              }}
                              className={`px-3 py-2 border rounded-md transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md ${
                                isInWishlist(book.id)
                                  ? "border-red-300 bg-red-50 text-red-600 hover:border-red-400"
                                  : "border-gray-300 bg-white text-gray-600 hover:border-gray-400"
                              }`}
                            >
                              <HeartIcon className="h-3 w-3" />
                            </motion.button>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* No Results */}
                {filteredBooks.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-12"
                  >
                    <div className="text-6xl mb-4">📚</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      No books found
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Try adjusting your filters or search query to find more
                      books.
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={clearAllFilters}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      Clear All Filters
                    </motion.button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading component following profile page skeleton pattern
function ShopLoading() {
  return (
    <div className="bg-gray-50 pb-8">
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <section className="relative bg-gradient-to-br from-blue-50/30 via-white to-cyan-50/20 py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <div className="h-12 bg-gray-200 rounded animate-pulse mb-6 mx-auto max-w-md"></div>
                <div className="h-6 bg-gray-200 rounded animate-pulse mx-auto max-w-2xl"></div>
              </div>
            </div>
          </section>

          {/* Search and Sort Bar Skeleton */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
            <div className="w-48">
              <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
            <div className="lg:hidden w-24">
              <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6 py-6">
          {/* Sidebar Skeleton */}
          <div className="hidden lg:block w-72">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="h-6 bg-gray-200 rounded animate-pulse mb-6 w-32"></div>
              <div className="space-y-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i}>
                    <div className="h-5 bg-gray-200 rounded animate-pulse mb-3 w-24"></div>
                    <div className="space-y-3">
                      {[...Array(3)].map((_, j) => (
                        <div
                          key={j}
                          className="h-10 bg-gray-200 rounded animate-pulse"
                        ></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Product Grid Skeleton */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-4">
                  <div className="h-48 bg-gray-200 rounded-lg animate-pulse mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    <div className="flex gap-2 mt-3">
                      <div className="h-6 bg-gray-200 rounded-full animate-pulse w-16"></div>
                      <div className="h-6 bg-gray-200 rounded-full animate-pulse w-12"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded animate-pulse w-20 mt-2"></div>
                    <div className="flex gap-2 mt-3">
                      <div className="h-10 bg-gray-200 rounded animate-pulse flex-1"></div>
                      <div className="h-10 bg-gray-200 rounded animate-pulse w-10"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main export with Suspense wrapper
export default function ShopPage() {
  return (
    <Suspense fallback={<ShopLoading />}>
      <ShopContent />
    </Suspense>
  );
}
