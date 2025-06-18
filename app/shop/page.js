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
    <div className="bg-gray-50 pb-8">
      <style jsx>{sliderStyles}</style>
      {/* Fixed Header Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb */}
          <nav className="flex mb-6" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link
                  href="/"
                  className="text-gray-700 hover:text-gray-900 transition-colors"
                >
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
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold text-gray-900 mb-4"
            >
              Educational Book Shop
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-600 max-w-3xl mx-auto"
            >
              Discover our comprehensive collection of Mathematics and Science
              textbooks designed for students from Class 5 to Class 12.
            </motion.p>
          </div>

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
                    of{" "}
                    <span className="font-semibold text-gray-900">
                      {sampleBooks.length}
                    </span>{" "}
                    books
                  </motion.p>
                </div>

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
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200"
                    >
                      {/* Book Cover */}
                      <div
                        className={`h-36 flex items-center justify-center text-4xl relative overflow-hidden ${
                          book.subject === "Mathematics"
                            ? "bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300"
                            : "bg-gradient-to-br from-green-100 via-green-200 to-green-300"
                        }`}
                      >
                        <div className="absolute inset-0 bg-white bg-opacity-10"></div>
                        <span className="relative z-10 drop-shadow-sm">
                          {book.image}
                        </span>
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
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md font-medium transition-all duration-200 flex items-center justify-center gap-1 text-sm shadow-sm hover:shadow-md"
                          >
                            <ShoppingCartIcon className="h-3 w-3" />
                            Add to Cart
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-3 py-2 border border-gray-300 hover:border-gray-400 text-gray-600 rounded-md transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md"
                          >
                            <EyeIcon className="h-3 w-3" />
                          </motion.button>
                        </div>
                      </div>
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
                    of{" "}
                    <span className="font-semibold text-gray-900">
                      {sampleBooks.length}
                    </span>{" "}
                    books
                  </motion.p>
                </div>

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
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200"
                    >
                      {/* Book Cover */}
                      <div
                        className={`h-36 flex items-center justify-center text-4xl relative overflow-hidden ${
                          book.subject === "Mathematics"
                            ? "bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300"
                            : "bg-gradient-to-br from-green-100 via-green-200 to-green-300"
                        }`}
                      >
                        <div className="absolute inset-0 bg-white bg-opacity-10"></div>
                        <span className="relative z-10 drop-shadow-sm">
                          {book.image}
                        </span>
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
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md font-medium transition-all duration-200 flex items-center justify-center gap-1 text-sm shadow-sm hover:shadow-md"
                          >
                            <ShoppingCartIcon className="h-3 w-3" />
                            Add to Cart
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-3 py-2 border border-gray-300 hover:border-gray-400 text-gray-600 rounded-md transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md"
                          >
                            <EyeIcon className="h-3 w-3" />
                          </motion.button>
                        </div>
                      </div>
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
