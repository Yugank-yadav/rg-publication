"use client";

import React, { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useToast } from "@/contexts/ToastContext";
import logger from "@/lib/logger";
import { userAPI, orderAPI } from "@/lib/api";
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
  CalendarIcon,
  PlusIcon,
  TrashIcon,
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
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
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
              href="/auth/login"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 inline-block"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
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
function ProfilePageContent() {
  const searchParams = useSearchParams();
  const { user: authUser, updateUser } = useAuth();
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { showSuccess, showError } = useToast();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [activeTab, setActiveTab] = useState("personal");
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
  });
  const [addressForm, setAddressForm] = useState({
    type: "home",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    landmark: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    deliveryInstructions: "",
    isDefault: false,
  });
  const [error, setError] = useState(null);

  // Handle URL tab parameter
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (
      tab &&
      ["personal", "orders", "wishlist", "addresses", "settings"].includes(tab)
    ) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Load user profile
        const profileResponse = await userAPI.getProfile();
        if (profileResponse.success) {
          const userData = profileResponse.data.user;
          setUser(userData);
          setEditForm({
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            email: userData.email || "",
            phone: userData.phone || "",
            dateOfBirth: userData.dateOfBirth
              ? userData.dateOfBirth.split("T")[0]
              : "",
          });
        }

        // Load order history
        const ordersResponse = await orderAPI.getOrderHistory();
        if (ordersResponse.success) {
          setOrders(ordersResponse.data.orders || []);
        }

        // Load addresses
        const addressesResponse = await userAPI.getAddresses();
        if (addressesResponse.success) {
          setAddresses(addressesResponse.data.addresses || []);
        }

        setIsLoading(false);
      } catch (err) {
        logger.error("Error loading user data:", err);
        setError(err.message);

        // Fall back to auth user data
        if (authUser) {
          setUser(authUser);
          setEditForm({
            firstName: authUser.firstName || "",
            lastName: authUser.lastName || "",
            email: authUser.email || "",
            phone: authUser.phone || "",
            dateOfBirth: authUser.dateOfBirth
              ? authUser.dateOfBirth.split("T")[0]
              : "",
          });
        }

        setIsLoading(false);
      }
    };

    if (authUser) {
      loadUserData();
    }
  }, [authUser]);

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
    if (!isEditing && user) {
      setEditForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split("T")[0] : "",
      });
    }
  };

  const handleSave = async () => {
    try {
      const response = await userAPI.updateProfile(editForm);
      if (response.success) {
        setUser(response.data.user);
        updateUser(response.data.user);
        setIsEditing(false);
        showSuccess("Profile updated successfully!");
        setError(null);
      } else {
        const errorMessage = response.message || "Failed to update profile";
        setError(errorMessage);
        showError(errorMessage);
      }
    } catch (err) {
      logger.error("Error updating profile:", err);
      const errorMessage = err.message || "Failed to update profile";
      setError(errorMessage);
      showError(errorMessage);
    }
  };

  const handleInputChange = (field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRemoveFromWishlist = async (itemId) => {
    try {
      await removeFromWishlist(itemId);
    } catch (error) {
      logger.error("Error removing from wishlist:", error);
    }
  };

  // Address management functions
  const handleAddressInputChange = (field, value) => {
    setAddressForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddAddress = () => {
    setIsAddingAddress(true);
    setEditingAddressId(null);
    setAddressForm({
      type: "home",
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      addressLine1: "",
      addressLine2: "",
      landmark: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",
      deliveryInstructions: "",
      isDefault: addresses.length === 0,
    });
  };

  const handleEditAddress = (address) => {
    setIsAddingAddress(false);
    setEditingAddressId(address.id);
    setAddressForm({
      type: address.type || "home",
      firstName: address.firstName || "",
      lastName: address.lastName || "",
      email: address.email || "",
      phone: address.phone || "",
      addressLine1: address.addressLine1 || "",
      addressLine2: address.addressLine2 || "",
      landmark: address.landmark || "",
      city: address.city || "",
      state: address.state || "",
      postalCode: address.postalCode || "",
      country: address.country || "India",
      deliveryInstructions: address.deliveryInstructions || "",
      isDefault: address.isDefault || false,
    });
  };

  const handleSaveAddress = async () => {
    try {
      let response;
      if (editingAddressId) {
        response = await userAPI.updateAddress(editingAddressId, addressForm);
      } else {
        response = await userAPI.addAddress(addressForm);
      }

      if (response.success) {
        showSuccess(
          editingAddressId
            ? "Address updated successfully!"
            : "Address added successfully!"
        );

        // Reload addresses
        const addressesResponse = await userAPI.getAddresses();
        if (addressesResponse.success) {
          setAddresses(addressesResponse.data.addresses || []);
        }

        setIsAddingAddress(false);
        setEditingAddressId(null);
      } else {
        showError(response.message || "Failed to save address");
      }
    } catch (error) {
      logger.error("Error saving address:", error);
      showError("Failed to save address");
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!confirm("Are you sure you want to delete this address?")) {
      return;
    }

    try {
      const response = await userAPI.deleteAddress(addressId);
      if (response.success) {
        showSuccess("Address deleted successfully!");

        // Reload addresses
        const addressesResponse = await userAPI.getAddresses();
        if (addressesResponse.success) {
          setAddresses(addressesResponse.data.addresses || []);
        }
      } else {
        showError(response.message || "Failed to delete address");
      }
    } catch (error) {
      logger.error("Error deleting address:", error);
      showError("Failed to delete address");
    }
  };

  const handleCancelAddressEdit = () => {
    setIsAddingAddress(false);
    setEditingAddressId(null);
  };

  const tabs = [
    { id: "personal", label: "Personal Info", icon: UserIcon },
    { id: "orders", label: "Order History", icon: ShoppingBagIcon },
    { id: "wishlist", label: "Wishlist", icon: HeartIcon },
    { id: "addresses", label: "Addresses", icon: MapPinIcon },
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
                        {tab.id === "wishlist" && wishlistItems.length > 0 && (
                          <span className="ml-auto bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                            {wishlistItems.length}
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
                    {activeTab === "addresses" && "My Addresses"}
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
                          {/* First Name */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              First Name
                            </label>
                            {isEditing ? (
                              <input
                                type="text"
                                value={editForm.firstName}
                                onChange={(e) =>
                                  handleInputChange("firstName", e.target.value)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            ) : (
                              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                                <UserIcon className="h-5 w-5 text-gray-400" />
                                <span className="text-gray-900">
                                  {user?.firstName || "Not provided"}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Last Name */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Last Name
                            </label>
                            {isEditing ? (
                              <input
                                type="text"
                                value={editForm.lastName}
                                onChange={(e) =>
                                  handleInputChange("lastName", e.target.value)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            ) : (
                              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                                <UserIcon className="h-5 w-5 text-gray-400" />
                                <span className="text-gray-900">
                                  {user?.lastName || "Not provided"}
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
                                  {user?.email || "Not provided"}
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
                                  {user?.phone || "Not provided"}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Date of Birth */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Date of Birth
                            </label>
                            {isEditing ? (
                              <input
                                type="date"
                                value={editForm.dateOfBirth}
                                onChange={(e) =>
                                  handleInputChange(
                                    "dateOfBirth",
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            ) : (
                              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                                <CalendarIcon className="h-5 w-5 text-gray-400" />
                                <span className="text-gray-900">
                                  {user?.dateOfBirth
                                    ? new Date(
                                        user.dateOfBirth
                                      ).toLocaleDateString()
                                    : "Not provided"}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Member Since */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Member Since
                            </label>
                            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                              <ClockIcon className="h-5 w-5 text-gray-400" />
                              <span className="text-gray-900">
                                {user?.createdAt
                                  ? new Date(
                                      user.createdAt
                                    ).toLocaleDateString()
                                  : "Not available"}
                              </span>
                            </div>
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
                        {wishlistItems.length === 0 ? (
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
                            {wishlistItems.map((item) => (
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
                                            handleRemoveFromWishlist(item.id)
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

                    {activeTab === "addresses" && (
                      <motion.div
                        key="addresses"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                      >
                        <div className="flex justify-between items-center">
                          <p className="text-gray-600">
                            Manage your delivery addresses
                          </p>
                          <motion.button
                            onClick={handleAddAddress}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
                          >
                            <PlusIcon className="h-4 w-4" />
                            <span>Add New Address</span>
                          </motion.button>
                        </div>

                        {/* Address Form */}
                        {(isAddingAddress || editingAddressId) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-gray-50 rounded-lg p-6"
                          >
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                              {editingAddressId
                                ? "Edit Address"
                                : "Add New Address"}
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Address Type
                                </label>
                                <select
                                  value={addressForm.type}
                                  onChange={(e) =>
                                    handleAddressInputChange(
                                      "type",
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                  <option value="home">Home</option>
                                  <option value="work">Work</option>
                                  <option value="other">Other</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  First Name
                                </label>
                                <input
                                  type="text"
                                  value={addressForm.firstName}
                                  onChange={(e) =>
                                    handleAddressInputChange(
                                      "firstName",
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Last Name
                                </label>
                                <input
                                  type="text"
                                  value={addressForm.lastName}
                                  onChange={(e) =>
                                    handleAddressInputChange(
                                      "lastName",
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Phone Number
                                </label>
                                <input
                                  type="tel"
                                  value={addressForm.phone}
                                  onChange={(e) =>
                                    handleAddressInputChange(
                                      "phone",
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>

                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Address Line 1
                                </label>
                                <input
                                  type="text"
                                  value={addressForm.addressLine1}
                                  onChange={(e) =>
                                    handleAddressInputChange(
                                      "addressLine1",
                                      e.target.value
                                    )
                                  }
                                  placeholder="House/Flat No., Building Name, Street"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>

                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Address Line 2 (Optional)
                                </label>
                                <input
                                  type="text"
                                  value={addressForm.addressLine2}
                                  onChange={(e) =>
                                    handleAddressInputChange(
                                      "addressLine2",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Area, Locality"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Landmark (Optional)
                                </label>
                                <input
                                  type="text"
                                  value={addressForm.landmark}
                                  onChange={(e) =>
                                    handleAddressInputChange(
                                      "landmark",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Near landmark"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  City
                                </label>
                                <input
                                  type="text"
                                  value={addressForm.city}
                                  onChange={(e) =>
                                    handleAddressInputChange(
                                      "city",
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  State
                                </label>
                                <input
                                  type="text"
                                  value={addressForm.state}
                                  onChange={(e) =>
                                    handleAddressInputChange(
                                      "state",
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Postal Code
                                </label>
                                <input
                                  type="text"
                                  value={addressForm.postalCode}
                                  onChange={(e) =>
                                    handleAddressInputChange(
                                      "postalCode",
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>

                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Delivery Instructions (Optional)
                                </label>
                                <textarea
                                  value={addressForm.deliveryInstructions}
                                  onChange={(e) =>
                                    handleAddressInputChange(
                                      "deliveryInstructions",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Any special delivery instructions"
                                  rows={3}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>

                              <div className="md:col-span-2">
                                <label className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    checked={addressForm.isDefault}
                                    onChange={(e) =>
                                      handleAddressInputChange(
                                        "isDefault",
                                        e.target.checked
                                      )
                                    }
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="text-sm text-gray-700">
                                    Set as default address
                                  </span>
                                </label>
                              </div>
                            </div>

                            <div className="flex space-x-3 mt-6">
                              <motion.button
                                onClick={handleSaveAddress}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200"
                              >
                                {editingAddressId
                                  ? "Update Address"
                                  : "Save Address"}
                              </motion.button>
                              <motion.button
                                onClick={handleCancelAddressEdit}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium transition-all duration-200"
                              >
                                Cancel
                              </motion.button>
                            </div>
                          </motion.div>
                        )}

                        {/* Address List */}
                        <div className="space-y-4">
                          {addresses.length === 0 ? (
                            <div className="text-center py-8">
                              <MapPinIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                              <p className="text-gray-500">
                                No addresses added yet
                              </p>
                              <p className="text-sm text-gray-400">
                                Add your first address to get started
                              </p>
                            </div>
                          ) : (
                            addresses.map((address) => (
                              <motion.div
                                key={address.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white border border-gray-200 rounded-lg p-4"
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium capitalize">
                                        {address.type}
                                      </span>
                                      {address.isDefault && (
                                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                          Default
                                        </span>
                                      )}
                                    </div>
                                    <h4 className="font-semibold text-gray-900">
                                      {address.firstName} {address.lastName}
                                    </h4>
                                    <p className="text-gray-600 text-sm mt-1">
                                      {address.addressLine1}
                                      {address.addressLine2 &&
                                        `, ${address.addressLine2}`}
                                      {address.landmark &&
                                        `, Near ${address.landmark}`}
                                    </p>
                                    <p className="text-gray-600 text-sm">
                                      {address.city}, {address.state} -{" "}
                                      {address.postalCode}
                                    </p>
                                    <p className="text-gray-600 text-sm">
                                      Phone: {address.phone}
                                    </p>
                                    {address.deliveryInstructions && (
                                      <p className="text-gray-500 text-sm mt-1">
                                        Instructions:{" "}
                                        {address.deliveryInstructions}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex space-x-2 ml-4">
                                    <motion.button
                                      onClick={() => handleEditAddress(address)}
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                                    >
                                      <PencilIcon className="h-4 w-4" />
                                    </motion.button>
                                    <motion.button
                                      onClick={() =>
                                        handleDeleteAddress(address.id)
                                      }
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                                    >
                                      <TrashIcon className="h-4 w-4" />
                                    </motion.button>
                                  </div>
                                </div>
                              </motion.div>
                            ))
                          )}
                        </div>
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

// Wrapper component with Suspense boundary
export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileLoading />}>
      <ProfilePageContent />
    </Suspense>
  );
}
