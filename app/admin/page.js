"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardCard from "@/components/admin/DashboardCard";
import QuickActions from "@/components/admin/QuickActions";
import RecentActivity from "@/components/admin/RecentActivity";
import SalesChart from "@/components/admin/SalesChart";
import {
  UsersIcon,
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
} from "@heroicons/react/24/outline";

// Mock data for dashboard metrics
const mockMetrics = {
  totalUsers: { value: 1247, change: 12.5, trend: "up" },
  totalProducts: { value: 89, change: 3.2, trend: "up" },
  totalOrders: { value: 342, change: -2.1, trend: "down" },
  totalRevenue: { value: 45678, change: 8.7, trend: "up" },
};

const mockRecentOrders = [
  {
    id: "ORD-001",
    customer: "Rahul Sharma",
    amount: 1250,
    status: "pending",
    date: "2025-01-26",
  },
  {
    id: "ORD-002",
    customer: "Priya Patel",
    amount: 890,
    status: "confirmed",
    date: "2025-01-26",
  },
  {
    id: "ORD-003",
    customer: "Amit Kumar",
    amount: 2100,
    status: "shipped",
    date: "2025-01-25",
  },
];

const mockLowStockProducts = [
  { id: 1, name: "Class 10 Mathematics", stock: 5, threshold: 10 },
  { id: 2, name: "Class 12 Physics", stock: 3, threshold: 10 },
  { id: 3, name: "Class 9 Chemistry", stock: 7, threshold: 15 },
];

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-200 rounded-lg h-96"></div>
            <div className="bg-gray-200 rounded-lg h-96"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here&apos;s what&apos;s happening with your store.
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </motion.div>

      {/* Metrics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <DashboardCard
          title="Total Users"
          value={mockMetrics.totalUsers.value.toLocaleString()}
          change={mockMetrics.totalUsers.change}
          trend={mockMetrics.totalUsers.trend}
          icon={UsersIcon}
          color="blue"
        />
        <DashboardCard
          title="Total Products"
          value={mockMetrics.totalProducts.value.toLocaleString()}
          change={mockMetrics.totalProducts.change}
          trend={mockMetrics.totalProducts.trend}
          icon={ShoppingBagIcon}
          color="green"
        />
        <DashboardCard
          title="Total Orders"
          value={mockMetrics.totalOrders.value.toLocaleString()}
          change={mockMetrics.totalOrders.change}
          trend={mockMetrics.totalOrders.trend}
          icon={ClipboardDocumentListIcon}
          color="yellow"
        />
        <DashboardCard
          title="Total Revenue"
          value={`₹${mockMetrics.totalRevenue.value.toLocaleString()}`}
          change={mockMetrics.totalRevenue.change}
          trend={mockMetrics.totalRevenue.trend}
          icon={CurrencyDollarIcon}
          color="purple"
        />
      </motion.div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <SalesChart />
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <RecentActivity
            recentOrders={mockRecentOrders}
            lowStockProducts={mockLowStockProducts}
          />
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <QuickActions />
      </motion.div>
    </div>
  );
}
