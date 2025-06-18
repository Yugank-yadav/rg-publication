"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  FunnelIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";
import {
  CalculatorIcon,
  BeakerIcon,
  ShoppingCartIcon,
  EyeIcon,
} from "@heroicons/react/16/solid";

// Metadata is handled by layout.js for client components

// Sample book data
const sampleBooks = [
  // Mathematics Books
  {
    id: 1,
    title: "Complete Mathematics for Class 5",
    subject: "Mathematics",
    class: 5,
    type: "Textbook",
    price: 250,
    image: "📐",
  },
  {
    id: 2,
    title: "Math Practice Book Class 5",
    subject: "Mathematics",
    class: 5,
    type: "Practice Book",
    price: 180,
    image: "📐",
  },
  {
    id: 3,
    title: "Advanced Math Class 5",
    subject: "Mathematics",
    class: 5,
    type: "Advanced Guide",
    price: 300,
    image: "📐",
  },

  {
    id: 4,
    title: "Complete Mathematics for Class 6",
    subject: "Mathematics",
    class: 6,
    type: "Textbook",
    price: 270,
    image: "📐",
  },
  {
    id: 5,
    title: "Math Practice Book Class 6",
    subject: "Mathematics",
    class: 6,
    type: "Practice Book",
    price: 200,
    image: "📐",
  },
  {
    id: 6,
    title: "Advanced Math Class 6",
    subject: "Mathematics",
    class: 6,
    type: "Advanced Guide",
    price: 320,
    image: "📐",
  },

  {
    id: 7,
    title: "Complete Mathematics for Class 7",
    subject: "Mathematics",
    class: 7,
    type: "Textbook",
    price: 290,
    image: "📐",
  },
  {
    id: 8,
    title: "Math Practice Book Class 7",
    subject: "Mathematics",
    class: 7,
    type: "Practice Book",
    price: 220,
    image: "📐",
  },
  {
    id: 9,
    title: "Advanced Math Class 7",
    subject: "Mathematics",
    class: 7,
    type: "Advanced Guide",
    price: 340,
    image: "📐",
  },

  {
    id: 10,
    title: "Complete Mathematics for Class 8",
    subject: "Mathematics",
    class: 8,
    type: "Textbook",
    price: 310,
    image: "📐",
  },
  {
    id: 11,
    title: "Math Practice Book Class 8",
    subject: "Mathematics",
    class: 8,
    type: "Practice Book",
    price: 240,
    image: "📐",
  },
  {
    id: 12,
    title: "Advanced Math Class 8",
    subject: "Mathematics",
    class: 8,
    type: "Advanced Guide",
    price: 360,
    image: "📐",
  },

  {
    id: 13,
    title: "Complete Mathematics for Class 9",
    subject: "Mathematics",
    class: 9,
    type: "Textbook",
    price: 330,
    image: "📐",
  },
  {
    id: 14,
    title: "Math Practice Book Class 9",
    subject: "Mathematics",
    class: 9,
    type: "Practice Book",
    price: 260,
    image: "📐",
  },
  {
    id: 15,
    title: "Advanced Math Class 9",
    subject: "Mathematics",
    class: 9,
    type: "Advanced Guide",
    price: 380,
    image: "📐",
  },

  {
    id: 16,
    title: "Complete Mathematics for Class 10",
    subject: "Mathematics",
    class: 10,
    type: "Textbook",
    price: 350,
    image: "📐",
  },
  {
    id: 17,
    title: "Math Practice Book Class 10",
    subject: "Mathematics",
    class: 10,
    type: "Practice Book",
    price: 280,
    image: "📐",
  },
  {
    id: 18,
    title: "Advanced Math Class 10",
    subject: "Mathematics",
    class: 10,
    type: "Advanced Guide",
    price: 400,
    image: "📐",
  },

  {
    id: 19,
    title: "Complete Mathematics for Class 11",
    subject: "Mathematics",
    class: 11,
    type: "Textbook",
    price: 420,
    image: "📐",
  },
  {
    id: 20,
    title: "Math Practice Book Class 11",
    subject: "Mathematics",
    class: 11,
    type: "Practice Book",
    price: 320,
    image: "📐",
  },
  {
    id: 21,
    title: "Advanced Math Class 11",
    subject: "Mathematics",
    class: 11,
    type: "Advanced Guide",
    price: 450,
    image: "📐",
  },

  {
    id: 22,
    title: "Complete Mathematics for Class 12",
    subject: "Mathematics",
    class: 12,
    type: "Textbook",
    price: 450,
    image: "📐",
  },
  {
    id: 23,
    title: "Math Practice Book Class 12",
    subject: "Mathematics",
    class: 12,
    type: "Practice Book",
    price: 350,
    image: "📐",
  },
  {
    id: 24,
    title: "Advanced Math Class 12",
    subject: "Mathematics",
    class: 12,
    type: "Advanced Guide",
    price: 480,
    image: "📐",
  },

  // Science Books
  {
    id: 25,
    title: "Complete Science for Class 5",
    subject: "Science",
    class: 5,
    type: "Textbook",
    price: 240,
    image: "🔬",
  },
  {
    id: 26,
    title: "Science Lab Manual Class 5",
    subject: "Science",
    class: 5,
    type: "Lab Manual",
    price: 160,
    image: "🔬",
  },
  {
    id: 27,
    title: "Advanced Science Class 5",
    subject: "Science",
    class: 5,
    type: "Advanced Guide",
    price: 290,
    image: "🔬",
  },

  {
    id: 28,
    title: "Complete Science for Class 6",
    subject: "Science",
    class: 6,
    type: "Textbook",
    price: 260,
    image: "🔬",
  },
  {
    id: 29,
    title: "Science Lab Manual Class 6",
    subject: "Science",
    class: 6,
    type: "Lab Manual",
    price: 180,
    image: "🔬",
  },
  {
    id: 30,
    title: "Advanced Science Class 6",
    subject: "Science",
    class: 6,
    type: "Advanced Guide",
    price: 310,
    image: "🔬",
  },

  {
    id: 31,
    title: "Complete Science for Class 7",
    subject: "Science",
    class: 7,
    type: "Textbook",
    price: 280,
    image: "🔬",
  },
  {
    id: 32,
    title: "Science Lab Manual Class 7",
    subject: "Science",
    class: 7,
    type: "Lab Manual",
    price: 200,
    image: "🔬",
  },
  {
    id: 33,
    title: "Advanced Science Class 7",
    subject: "Science",
    class: 7,
    type: "Advanced Guide",
    price: 330,
    image: "🔬",
  },

  {
    id: 34,
    title: "Complete Science for Class 8",
    subject: "Science",
    class: 8,
    type: "Textbook",
    price: 300,
    image: "🔬",
  },
  {
    id: 35,
    title: "Science Lab Manual Class 8",
    subject: "Science",
    class: 8,
    type: "Lab Manual",
    price: 220,
    image: "🔬",
  },
  {
    id: 36,
    title: "Advanced Science Class 8",
    subject: "Science",
    class: 8,
    type: "Advanced Guide",
    price: 350,
    image: "🔬",
  },

  {
    id: 37,
    title: "Complete Science for Class 9",
    subject: "Science",
    class: 9,
    type: "Textbook",
    price: 320,
    image: "🔬",
  },
  {
    id: 38,
    title: "Science Lab Manual Class 9",
    subject: "Science",
    class: 9,
    type: "Lab Manual",
    price: 240,
    image: "🔬",
  },
  {
    id: 39,
    title: "Advanced Science Class 9",
    subject: "Science",
    class: 9,
    type: "Advanced Guide",
    price: 370,
    image: "🔬",
  },

  {
    id: 40,
    title: "Complete Science for Class 10",
    subject: "Science",
    class: 10,
    type: "Textbook",
    price: 380,
    image: "🔬",
  },
  {
    id: 41,
    title: "Science Lab Manual Class 10",
    subject: "Science",
    class: 10,
    type: "Lab Manual",
    price: 280,
    image: "🔬",
  },
  {
    id: 42,
    title: "Advanced Science Class 10",
    subject: "Science",
    class: 10,
    type: "Advanced Guide",
    price: 420,
    image: "🔬",
  },

  {
    id: 43,
    title: "Physics Fundamentals Class 11",
    subject: "Science",
    class: 11,
    type: "Textbook",
    price: 420,
    image: "🔬",
  },
  {
    id: 44,
    title: "Chemistry Concepts Class 11",
    subject: "Science",
    class: 11,
    type: "Textbook",
    price: 400,
    image: "🔬",
  },
  {
    id: 45,
    title: "Biology Essentials Class 11",
    subject: "Science",
    class: 11,
    type: "Textbook",
    price: 390,
    image: "🔬",
  },

  {
    id: 46,
    title: "Physics Advanced Class 12",
    subject: "Science",
    class: 12,
    type: "Textbook",
    price: 450,
    image: "🔬",
  },
  {
    id: 47,
    title: "Chemistry Mastery Class 12",
    subject: "Science",
    class: 12,
    type: "Textbook",
    price: 430,
    image: "🔬",
  },
  {
    id: 48,
    title: "Biology Complete Class 12",
    subject: "Science",
    class: 12,
    type: "Textbook",
    price: 420,
    image: "🔬",
  },
];

export default function ShopPage() {
  const [filteredBooks, setFilteredBooks] = useState(sampleBooks);
  const [filters, setFilters] = useState({
    subjects: [],
    classes: [],
    types: [],
    priceRange: [200, 500],
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("class");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Filter and search logic
  useEffect(() => {
    let filtered = sampleBooks;

    // Apply subject filter
    if (filters.subjects.length > 0) {
      filtered = filtered.filter((book) =>
        filters.subjects.includes(book.subject)
      );
    }

    // Apply class filter
    if (filters.classes.length > 0) {
      filtered = filtered.filter((book) =>
        filters.classes.includes(book.class)
      );
    }

    // Apply type filter
    if (filters.types.length > 0) {
      filtered = filtered.filter((book) => filters.types.includes(book.type));
    }

    // Apply price range filter
    filtered = filtered.filter(
      (book) =>
        book.price >= filters.priceRange[0] &&
        book.price <= filters.priceRange[1]
    );

    // Apply search query
    if (searchQuery) {
      filtered = filtered.filter(
        (book) =>
          book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "alphabetical":
          return a.title.localeCompare(b.title);
        case "class":
        default:
          return a.class - b.class || a.subject.localeCompare(b.subject);
      }
    });

    setFilteredBooks(filtered);
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
    });
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link href="/" className="text-gray-700 hover:text-gray-900">
                Home
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-gray-900 font-medium">Shop</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Educational Book Shop
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover our comprehensive collection of Mathematics and Science
            textbooks designed for students from Class 5 to Class 12.
          </p>
        </div>

        {/* Search and Sort Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="class">Sort by Class</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="alphabetical">Alphabetical</option>
          </select>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <FunnelIcon className="h-5 w-5" />
            Filters
          </button>
        </div>

        {/* Main Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-80 bg-white rounded-lg shadow-lg p-6 h-fit">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              <button
                onClick={clearAllFilters}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear All
              </button>
            </div>

            {/* Subject Filter */}
            <div className="mb-6">
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
                    onChange={() => handleFilterChange("subjects", "Science")}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <BeakerIcon className="h-4 w-4 text-green-500 ml-2 mr-2" />
                  <span className="text-gray-700">Science</span>
                </label>
              </div>
            </div>

            {/* Class Filter */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Class Level</h4>
              <div className="grid grid-cols-4 gap-2">
                {[5, 6, 7, 8, 9, 10, 11, 12].map((classNum) => (
                  <label key={classNum} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.classes.includes(classNum)}
                      onChange={() => handleFilterChange("classes", classNum)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-1"
                    />
                    <span className="text-sm text-gray-700">{classNum}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Book Type Filter */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Book Type</h4>
              <div className="space-y-2">
                {[
                  "Textbook",
                  "Practice Book",
                  "Lab Manual",
                  "Advanced Guide",
                ].map((type) => (
                  <label key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.types.includes(type)}
                      onChange={() => handleFilterChange("types", type)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-700 ml-2">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Price Range</h4>
              <div className="px-2">
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
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>₹200</span>
                  <span>₹{filters.priceRange[1]}</span>
                  <span>₹500</span>
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
                className="lg:hidden bg-white rounded-lg shadow-lg p-6 mb-6"
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
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                Showing {filteredBooks.length} of {sampleBooks.length} books
              </p>
            </div>

            {/* Books Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredBooks.map((book) => (
                <motion.div
                  key={book.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{
                    scale: 1.02,
                    rotateY: 2,
                    transition: { duration: 0.2 },
                  }}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 max-w-sm mx-auto"
                >
                  {/* Book Cover */}
                  <div
                    className={`h-48 flex items-center justify-center text-6xl ${
                      book.subject === "Mathematics"
                        ? "bg-gradient-to-br from-blue-100 to-blue-200"
                        : "bg-gradient-to-br from-green-100 to-green-200"
                    }`}
                  >
                    {book.image}
                  </div>

                  {/* Book Details */}
                  <div className="p-6">
                    {/* Subject and Class Tags */}
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          book.subject === "Mathematics"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {book.subject}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                        Class {book.class}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                        {book.type}
                      </span>
                    </div>

                    {/* Book Title */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
                      {book.title}
                    </h3>

                    {/* Price */}
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className="text-2xl font-bold"
                        style={{ color: "#a8f1ff" }}
                      >
                        ₹{book.price}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <ShoppingCartIcon className="h-4 w-4" />
                        Add to Cart
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 border border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg transition-colors flex items-center justify-center"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* No Results */}
            {filteredBooks.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No books found
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your filters or search query to find more books.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
