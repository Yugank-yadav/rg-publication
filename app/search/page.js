"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { productAPI } from "@/lib/api";
import logger from "@/lib/logger";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  ChevronRightIcon,
  FunnelIcon,
  ClockIcon,
  BookOpenIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";
import { MagnifyingGlassIcon as MagnifyingGlassIconSolid } from "@heroicons/react/24/solid";

// No static data - all content should come from API

// Popular search terms for fallback suggestions
const popularSearches = [
  "Mathematics Class 10",
  "Science Class 11",
  "English Grammar",
  "Physics",
  "Chemistry",
  "Biology",
  "Algebra",
  "Geometry",
];

// Search suggestions component
function SearchSuggestions({ query, onSelectSuggestion, onClose }) {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        setIsLoading(true);
        const response = await productAPI.getSearchSuggestions(query);
        if (response.success) {
          setSuggestions(response.data.suggestions.slice(0, 5));
        } else {
          // No fallback to static data - show empty suggestions
          setSuggestions([]);
        }
      } catch (error) {
        logger.error("Error fetching suggestions:", error);
        // No fallback to static data - show empty suggestions
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  if (query.length === 0) {
    return (
      <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-50">
        <div className="p-4">
          <div className="text-center text-gray-500">
            <MagnifyingGlassIconSolid className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Start typing to search for books...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-50">
      <div className="p-2">
        {suggestions.length > 0 ? (
          suggestions.map((product) => (
            <button
              key={product.id}
              onClick={() => onSelectSuggestion(product.title)}
              className="flex items-center space-x-3 w-full text-left p-3 hover:bg-gray-50 rounded-md"
            >
              <div
                className={`w-10 h-12 flex items-center justify-center text-lg rounded ${
                  product.subject === "Mathematics"
                    ? "bg-blue-100"
                    : product.subject === "Science"
                    ? "bg-green-100"
                    : "bg-gray-100"
                }`}
              >
                {product.image}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {product.title}
                </p>
                <p className="text-xs text-gray-500">
                  {product.subject} • Class {product.class}
                </p>
              </div>
            </button>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500">
            <MagnifyingGlassIconSolid className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">
              No suggestions found for &quot;{query}&quot;
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Search result item component
function SearchResultItem({ product }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
    >
      <Link href={`/shop/${product.id}`} className="block">
        <div className="flex items-start space-x-4">
          <div
            className={`w-16 h-20 flex items-center justify-center text-2xl rounded-lg ${
              product.subject === "Mathematics"
                ? "bg-gradient-to-br from-blue-100 to-blue-200"
                : product.subject === "Science"
                ? "bg-gradient-to-br from-green-100 to-green-200"
                : "bg-gradient-to-br from-gray-100 to-gray-200"
            }`}
          >
            {product.image}
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors duration-200">
              {product.title}
            </h3>
            <p className="text-sm text-gray-600 mt-1">by {product.author}</p>
            <p className="text-sm text-gray-600 mt-2">{product.description}</p>

            <div className="flex items-center gap-2 mt-3">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  product.subject === "Mathematics"
                    ? "bg-blue-100 text-blue-700"
                    : product.subject === "Science"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {product.subject}
              </span>
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                Class {product.class}
              </span>
            </div>

            <div className="flex items-center justify-between mt-4">
              <p className="text-xl font-bold text-gray-900">
                ₹{product.price}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all duration-200"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Add to cart logic
                  logger.debug(`Added ${product.title} to cart`);
                }}
              >
                Add to Cart
              </motion.button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// Main search component
export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filters, setFilters] = useState({
    subject: "",
    class: "",
    priceRange: [0, 500],
  });
  const [hasSearched, setHasSearched] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    // Focus search input on mount
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (query && query.length > 0) {
      performSearch(query);
    } else {
      setSearchResults([]);
      setHasSearched(false);
    }
  }, [query, filters]);

  const performSearch = async (searchQuery) => {
    setIsLoading(true);
    setHasSearched(true);

    try {
      // Build search parameters
      const searchParams = {
        q: searchQuery,
        page: 1,
        limit: 50,
        sortBy: "relevance",
        sortOrder: "desc",
      };

      // Add filters
      if (filters.subject) searchParams.subject = filters.subject;
      if (filters.class) searchParams.class = filters.class;
      if (filters.priceRange[0] > 0)
        searchParams.priceMin = filters.priceRange[0];
      if (filters.priceRange[1] < 500)
        searchParams.priceMax = filters.priceRange[1];

      // Call search API
      const response = await productAPI.searchProducts(searchParams);

      if (response.success) {
        // Transform API data to match component expectations
        const transformedResults = response.data.results.map((product) => ({
          id: product.id,
          title: product.title,
          subject: product.subject,
          class: product.class,
          type: product.type || "Textbook",
          price: product.price,
          image: product.subject === "Mathematics" ? "📐" : "🔬",
          author: product.author,
          description: product.description,
          tags: product.tags || [],
          featured: product.featured,
          inStock: product.inStock,
          coverImage: product.images?.[0]?.url,
        }));

        setSearchResults(transformedResults);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      logger.error("Search error:", error);
      // No fallback to static data - show empty results
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (query.trim()) {
      performSearch(query.trim());
    }
  };

  const handleSuggestionSelect = (suggestion) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    performSearch(suggestion);
  };

  const clearSearch = () => {
    setQuery("");
    setSearchResults([]);
    setHasSearched(false);
    setShowSuggestions(false);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

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
            <span className="text-gray-900 font-medium">Search</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Search Books
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find the perfect educational materials for your studies. Search by
            title, subject, author, or keywords.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto mb-8">
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={query || ""}
                onChange={(e) => setQuery(e.target.value || "")}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Search for books, subjects, authors..."
                className="w-full pl-12 pr-12 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
              {query && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
            </div>

            {showSuggestions && (
              <SearchSuggestions
                query={query}
                onSelectSuggestion={handleSuggestionSelect}
                onClose={() => setShowSuggestions(false)}
              />
            )}
          </form>
        </div>

        {/* Search Results */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <div className="flex items-center space-x-2 mb-6">
                <FunnelIcon className="h-5 w-5 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              </div>

              {/* Subject Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <select
                  value={filters.subject}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, subject: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Subjects</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Science">Science</option>
                  <option value="English">English</option>
                  <option value="Social Science">Social Science</option>
                </select>
              </div>

              {/* Class Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class
                </label>
                <select
                  value={filters.class}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, class: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Classes</option>
                  {[...Array(8)].map((_, i) => (
                    <option key={i} value={i + 5}>
                      Class {i + 5}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() =>
                  setFilters({ subject: "", class: "", priceRange: [0, 500] })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="space-y-6">
                {/* Results header skeleton */}
                <div className="flex items-center justify-between">
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-48"></div>
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-32"></div>
                </div>

                {/* Search result skeletons following profile page pattern */}
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white border border-gray-200 rounded-lg p-6"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-20 bg-gray-200 rounded-lg animate-pulse"></div>
                      <div className="flex-1 space-y-3">
                        <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>

                        <div className="flex items-center gap-2 mt-3">
                          <div className="h-6 bg-gray-200 rounded-full animate-pulse w-20"></div>
                          <div className="h-6 bg-gray-200 rounded-full animate-pulse w-16"></div>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <div className="h-6 bg-gray-200 rounded animate-pulse w-16"></div>
                          <div className="h-10 bg-gray-200 rounded animate-pulse w-24"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : hasSearched ? (
              searchResults.length > 0 ? (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-gray-600">
                      Found {searchResults.length} result
                      {searchResults.length !== 1 ? "s" : ""} for &quot;{query}
                      &quot;
                    </p>
                  </div>
                  <div className="space-y-4">
                    <AnimatePresence>
                      {searchResults.map((product) => (
                        <SearchResultItem key={product.id} product={product} />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-16"
                >
                  <BookOpenIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No results found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    We couldn&apos;t find any books matching &quot;{query}
                    &quot;. Try adjusting your search or filters.
                  </p>
                  <div className="space-y-4">
                    <button
                      onClick={clearSearch}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200"
                    >
                      Clear Search
                    </button>
                    <div className="text-sm text-gray-500">
                      <p>Try searching for:</p>
                      <div className="flex flex-wrap justify-center gap-2 mt-2">
                        {popularSearches.slice(0, 3).map((search, index) => (
                          <button
                            key={`popular-search-${index}-${search}`}
                            onClick={() => handleSuggestionSelect(search)}
                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors duration-200"
                          >
                            {search}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <MagnifyingGlassIconSolid className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Start your search
                </h3>
                <p className="text-gray-600 mb-6">
                  Enter keywords in the search box above to find books, or
                  browse our popular categories.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-md mx-auto">
                  {[
                    "Mathematics",
                    "Science",
                    "English",
                    "Class 10",
                    "Class 11",
                    "Class 12",
                  ].map((category) => (
                    <button
                      key={category}
                      onClick={() => handleSuggestionSelect(category)}
                      className="px-4 py-2 bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 rounded-lg text-sm font-medium transition-all duration-200"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
