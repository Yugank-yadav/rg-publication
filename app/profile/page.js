"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ShoppingBagIcon,
  HeartIcon,
  Cog8ToothIcon,
  KeyIcon,
  ChevronRightIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  TruckIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import {
  UserIcon as UserIconSolid,
  HeartIcon as HeartIconSolid,
  ShoppingBagIcon as ShoppingBagIconSolid,
} from "@heroicons/react/24/solid";

// Mock user data
const mockUser = {
  id: 1,
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+91 98765 43210",
  address: {
    street: "123 Education Street",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
    country: "India",
  },
  joinDate: "2023-01-15",
  avatar: "/profile-avatar.jpg",
};

// Mock order data
const mockOrders = [
  {
    id: "ORD-2024-001",
    date: "2024-01-15",
    status: "delivered",
    total: 450,
    items: [
      { title: "Mathematics Class 10", price: 250, quantity: 1 },
      { title: "Science Class 10", price: 200, quantity: 1 },
    ],
  },
  {
    id: "ORD-2024-002",
    date: "2024-01-20",
    status: "shipped",
    total: 300,
    items: [{ title: "Advanced Physics", price: 300, quantity: 1 }],
  },
];

// Mock wishlist data
const mockWishlist = [
  {
    id: 1,
    title: "Complete Mathematics for Class 5",
    price: 250,
    image: "📐",
    subject: "Mathematics",
    class: 5,
  },
  {
    id: 25,
    title: "Complete Science for Class 5",
    price: 240,
    image: "🔬",
    subject: "Science",
    class: 5,
  },
];

// Loading component
function ProfileLoading() {
  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="h-16 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                <div>
                  <div className="h-6 bg-gray-200 rounded animate-pulse mb-2 w-32"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-48"></div>
                </div>
              </div>
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-10 bg-gray-200 rounded animate-pulse"
                  ></div>
                ))}
              </div>
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="h-8 bg-gray-200 rounded animate-pulse mb-6 w-48"></div>
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-16 bg-gray-200 rounded animate-pulse"
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

// Status badge component
function StatusBadge({ status }) {
  const statusConfig = {
    delivered: { color: "green", label: "Delivered", icon: CheckIcon },
    shipped: { color: "blue", label: "Shipped", icon: TruckIcon },
    processing: { color: "yellow", label: "Processing", icon: ClockIcon },
    cancelled: { color: "red", label: "Cancelled", icon: XMarkIcon },
  };

  const config = statusConfig[status] || statusConfig.processing;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
      ${config.color === "green" ? "bg-green-100 text-green-700" : ""}
      ${config.color === "blue" ? "bg-blue-100 text-blue-700" : ""}
      ${config.color === "yellow" ? "bg-yellow-100 text-yellow-700" : ""}
      ${config.color === "red" ? "bg-red-100 text-red-700" : ""}
    `}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

// Authentication check component
function AuthCheck({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      setIsAuthenticated(true); // For demo, always authenticated
    }, 500);
  }, []);

  if (isAuthenticated === null) {
    return <ProfileLoading />;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <UserIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Sign In Required
          </h2>
          <p className="text-gray-600 mb-6">
            Please sign in to access your profile and account information.
          </p>
          <div className="space-y-3">
            <Link
              href="/auth/signin"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 inline-block"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-medium transition-all duration-200 inline-block"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}

// Main profile component
export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [activeTab, setActiveTab] = useState("personal");
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setUser(mockUser);
        setOrders(mockOrders);
        setWishlist(mockWishlist);
        setEditForm(mockUser);
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  if (isLoading) {
    return <ProfileLoading />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <XMarkIcon className="h-16 w-16 text-red-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Error Loading Profile
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <motion.button
            onClick={() => window.location.reload()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200"
          >
            Try Again
          </motion.button>
        </div>
      </div>
    );
  }

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditForm(user);
    }
  };

  const handleSave = () => {
    setUser(editForm);
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setEditForm((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setEditForm((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const removeFromWishlist = (itemId) => {
    setWishlist((prev) => prev.filter((item) => item.id !== itemId));
  };

  const tabs = [
    { id: "personal", label: "Personal Info", icon: UserIcon },
    { id: "orders", label: "Order History", icon: ShoppingBagIcon },
    { id: "wishlist", label: "Wishlist", icon: HeartIcon },
    { id: "settings", label: "Settings", icon: Cog8ToothIcon },
  ];

  return (
    <AuthCheck>
      <div className="min-h-screen bg-gray-50 pt-16">
        {/* Breadcrumb Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="flex items-center space-x-2 text-sm">
              <Link href="/" className="text-gray-500 hover:text-gray-700">
                Home
              </Link>
              <ChevronRightIcon className="h-4 w-4 text-gray-400" />
              <span className="text-gray-900 font-medium">My Profile</span>
            </nav>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                {/* User Info Header */}
                <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                        <UserIconSolid className="h-8 w-8 text-white" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {user.name}
                      </h2>
                      <p className="text-gray-600">{user.email}</p>
                      <p className="text-sm text-gray-500">
                        Member since {new Date(user.joinDate).getFullYear()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Navigation Tabs */}
                <div className="p-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <motion.button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                          activeTab === tab.id
                            ? "bg-blue-50 text-blue-700 border-l-4 border-blue-500"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{tab.label}</span>
                        {tab.id === "wishlist" && wishlist.length > 0 && (
                          <span className="ml-auto bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                            {wishlist.length}
                          </span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    {activeTab === "personal" && "Personal Information"}
                    {activeTab === "orders" && "Order History"}
                    {activeTab === "wishlist" && "My Wishlist"}
                    {activeTab === "settings" && "Account Settings"}
                  </h3>

                  <AnimatePresence mode="wait">
                    {activeTab === "personal" && (
                      <motion.div
                        key="personal"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex items-center justify-between mb-6">
                          <motion.button
                            onClick={isEditing ? handleSave : handleEditToggle}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                              isEditing
                                ? "bg-green-600 hover:bg-green-700 text-white"
                                : "bg-blue-600 hover:bg-blue-700 text-white"
                            }`}
                          >
                            {isEditing ? (
                              <>
                                <CheckIcon className="h-4 w-4" />
                                <span>Save Changes</span>
                              </>
                            ) : (
                              <>
                                <PencilIcon className="h-4 w-4" />
                                <span>Edit Profile</span>
                              </>
                            )}
                          </motion.button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Name */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Full Name
                            </label>
                            {isEditing ? (
                              <input
                                type="text"
                                value={editForm.name}
                                onChange={(e) =>
                                  handleInputChange("name", e.target.value)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            ) : (
                              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                                <UserIcon className="h-5 w-5 text-gray-400" />
                                <span className="text-gray-900">
                                  {user.name}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Email */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Email Address
                            </label>
                            {isEditing ? (
                              <input
                                type="email"
                                value={editForm.email}
                                onChange={(e) =>
                                  handleInputChange("email", e.target.value)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            ) : (
                              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                                <span className="text-gray-900">
                                  {user.email}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Phone */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Phone Number
                            </label>
                            {isEditing ? (
                              <input
                                type="tel"
                                value={editForm.phone}
                                onChange={(e) =>
                                  handleInputChange("phone", e.target.value)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            ) : (
                              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                                <PhoneIcon className="h-5 w-5 text-gray-400" />
                                <span className="text-gray-900">
                                  {user.phone}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Address */}
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Address
                            </label>
                            {isEditing ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                  type="text"
                                  placeholder="Street Address"
                                  value={editForm.address?.street || ""}
                                  onChange={(e) =>
                                    handleInputChange(
                                      "address.street",
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <input
                                  type="text"
                                  placeholder="City"
                                  value={editForm.address?.city || ""}
                                  onChange={(e) =>
                                    handleInputChange(
                                      "address.city",
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <input
                                  type="text"
                                  placeholder="State"
                                  value={editForm.address?.state || ""}
                                  onChange={(e) =>
                                    handleInputChange(
                                      "address.state",
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <input
                                  type="text"
                                  placeholder="PIN Code"
                                  value={editForm.address?.pincode || ""}
                                  onChange={(e) =>
                                    handleInputChange(
                                      "address.pincode",
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                            ) : (
                              <div className="flex items-start space-x-2 p-3 bg-gray-50 rounded-lg">
                                <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                                <div className="text-gray-900">
                                  <div>{user.address.street}</div>
                                  <div>
                                    {user.address.city}, {user.address.state}{" "}
                                    {user.address.pincode}
                                  </div>
                                  <div>{user.address.country}</div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {isEditing && (
                          <div className="mt-6 flex space-x-3">
                            <motion.button
                              onClick={() => setIsEditing(false)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-all duration-200"
                            >
                              Cancel
                            </motion.button>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {activeTab === "orders" && (
                      <motion.div
                        key="orders"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        {orders.length === 0 ? (
                          <div className="text-center py-12">
                            <ShoppingBagIconSolid className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h4 className="text-lg font-medium text-gray-900 mb-2">
                              No orders yet
                            </h4>
                            <p className="text-gray-600 mb-6">
                              Start shopping to see your orders here!
                            </p>
                            <Link
                              href="/shop"
                              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200"
                            >
                              Browse Books
                            </Link>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {orders.map((order) => (
                              <motion.div
                                key={order.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
                              >
                                <div className="flex items-center justify-between mb-4">
                                  <div>
                                    <h4 className="text-lg font-semibold text-gray-900">
                                      Order {order.id}
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                      Placed on{" "}
                                      {new Date(
                                        order.date
                                      ).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <StatusBadge status={order.status} />
                                    <p className="text-lg font-bold text-gray-900 mt-1">
                                      ₹{order.total}
                                    </p>
                                  </div>
                                </div>

                                <div className="space-y-2 mb-4">
                                  {order.items.map((item, index) => (
                                    <div
                                      key={index}
                                      className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                                    >
                                      <div>
                                        <p className="font-medium text-gray-900">
                                          {item.title}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                          Quantity: {item.quantity}
                                        </p>
                                      </div>
                                      <p className="font-semibold text-gray-900">
                                        ₹{item.price}
                                      </p>
                                    </div>
                                  ))}
                                </div>

                                <div className="flex space-x-3">
                                  <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex items-center space-x-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition-all duration-200"
                                  >
                                    <EyeIcon className="h-4 w-4" />
                                    <span>View Details</span>
                                  </motion.button>
                                  {order.status === "delivered" && (
                                    <motion.button
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                      className="flex items-center space-x-2 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg font-medium transition-all duration-200"
                                    >
                                      <span>Reorder</span>
                                    </motion.button>
                                  )}
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}

                    {activeTab === "wishlist" && (
                      <motion.div
                        key="wishlist"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        {wishlist.length === 0 ? (
                          <div className="text-center py-12">
                            <HeartIconSolid className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h4 className="text-lg font-medium text-gray-900 mb-2">
                              Your wishlist is empty
                            </h4>
                            <p className="text-gray-600 mb-6">
                              Add books you love to your wishlist!
                            </p>
                            <Link
                              href="/shop"
                              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200"
                            >
                              Browse Books
                            </Link>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {wishlist.map((item) => (
                              <motion.div
                                key={item.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200"
                              >
                                <div className="p-4">
                                  <div className="flex items-start space-x-4">
                                    <div
                                      className={`w-16 h-20 flex items-center justify-center text-2xl rounded-lg ${
                                        item.subject === "Mathematics"
                                          ? "bg-gradient-to-br from-blue-100 to-blue-200"
                                          : "bg-gradient-to-br from-green-100 to-green-200"
                                      }`}
                                    >
                                      {item.image}
                                    </div>
                                    <div className="flex-1">
                                      <h4 className="font-semibold text-gray-900 mb-1">
                                        {item.title}
                                      </h4>
                                      <div className="flex items-center gap-2 mb-2">
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
                                      <p className="text-lg font-bold text-gray-900 mb-3">
                                        ₹{item.price}
                                      </p>
                                      <div className="flex space-x-2">
                                        <Link
                                          href={`/shop/${item.id}`}
                                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium text-center transition-all duration-200"
                                        >
                                          View Details
                                        </Link>
                                        <motion.button
                                          onClick={() =>
                                            removeFromWishlist(item.id)
                                          }
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
                                          className="px-3 py-2 border border-red-300 hover:bg-red-50 text-red-600 rounded-lg text-sm font-medium transition-all duration-200"
                                        >
                                          Remove
                                        </motion.button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}

                    {activeTab === "settings" && (
                      <motion.div
                        key="settings"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="space-y-6">
                          {/* Password Change */}
                          <div className="border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center space-x-3 mb-4">
                              <KeyIcon className="h-6 w-6 text-gray-400" />
                              <h4 className="text-lg font-semibold text-gray-900">
                                Change Password
                              </h4>
                            </div>
                            <p className="text-gray-600 mb-4">
                              Update your password to keep your account secure.
                            </p>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200"
                            >
                              Change Password
                            </motion.button>
                          </div>

                          {/* Notifications */}
                          <div className="border border-gray-200 rounded-lg p-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                              Notification Preferences
                            </h4>
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-gray-900">
                                    Order Updates
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    Get notified about your order status
                                  </p>
                                </div>
                                <input
                                  type="checkbox"
                                  defaultChecked
                                  className="h-4 w-4 text-blue-600 rounded"
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-gray-900">
                                    New Arrivals
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    Be the first to know about new books
                                  </p>
                                </div>
                                <input
                                  type="checkbox"
                                  defaultChecked
                                  className="h-4 w-4 text-blue-600 rounded"
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-gray-900">
                                    Promotional Offers
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    Receive special offers and discounts
                                  </p>
                                </div>
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 text-blue-600 rounded"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Account Actions */}
                          <div className="border border-gray-200 rounded-lg p-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                              Account Actions
                            </h4>
                            <div className="space-y-3">
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all duration-200"
                              >
                                Download Account Data
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full text-left px-4 py-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-all duration-200"
                              >
                                Delete Account
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </AuthCheck>
  );
}
