"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardCard from "@/components/admin/DashboardCard";
import AnalyticsChart from "@/components/admin/AnalyticsChart";
import TopProducts from "@/components/admin/TopProducts";
import UserGrowthChart from "@/components/admin/UserGrowthChart";
import {
  CurrencyDollarIcon,
  UsersIcon,
  ShoppingBagIcon,
  ArrowTrendingUpIcon,
  CalendarDaysIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";

// Mock analytics data
const mockAnalytics = {
  overview: {
    totalRevenue: { value: 125000, change: 15.2, trend: "up" },
    totalUsers: { value: 1247, change: 8.5, trend: "up" },
    totalOrders: { value: 342, change: -2.1, trend: "down" },
    avgOrderValue: { value: 365, change: 12.8, trend: "up" },
  },
  salesData: [
    { month: "Jan", revenue: 45000, orders: 120 },
    { month: "Feb", revenue: 52000, orders: 135 },
    { month: "Mar", revenue: 48000, orders: 128 },
    { month: "Apr", revenue: 65000, orders: 165 },
    { month: "May", revenue: 72000, orders: 180 },
    { month: "Jun", revenue: 68000, orders: 172 },
  ],
  userGrowth: [
    { month: "Jan", users: 850 },
    { month: "Feb", users: 920 },
    { month: "Mar", users: 980 },
    { month: "Apr", users: 1050 },
    { month: "May", users: 1150 },
    { month: "Jun", users: 1247 },
  ],
  topProducts: [
    { id: 1, name: "Class 10 Mathematics", sales: 145, revenue: 65250 },
    { id: 2, name: "Class 12 Physics Lab Manual", sales: 89, revenue: 28480 },
    { id: 3, name: "Class 11 Chemistry Guide", sales: 67, revenue: 34840 },
    { id: 4, name: "Class 9 English Grammar", sales: 56, revenue: 15680 },
    { id: 5, name: "Class 12 Biology Textbook", sales: 45, revenue: 22500 },
  ],
  subjectPerformance: [
    { subject: "Mathematics", sales: 245, percentage: 35 },
    { subject: "Science", sales: 189, percentage: 27 },
    { subject: "English", sales: 134, percentage: 19 },
    { subject: "Social Science", sales: 132, percentage: 19 },
  ],
};

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("6months");
  const [analytics, setAnalytics] = useState(mockAnalytics);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setAnalytics(mockAnalytics);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeRange]);

  const handleExportReport = () => {
    // Simulate report export
    const reportData = {
      generatedAt: new Date().toISOString(),
      timeRange,
      ...analytics,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-report-${timeRange}-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
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
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Track performance metrics and business insights
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="1month">Last Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
          </select>

          {/* Export Button */}
          <button
            onClick={handleExportReport}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <DocumentArrowDownIcon className="h-4 w-4" />
            <span>Export Report</span>
          </button>
        </div>
      </motion.div>

      {/* Overview Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <DashboardCard
          title="Total Revenue"
          value={`₹${analytics.overview.totalRevenue.value.toLocaleString()}`}
          change={analytics.overview.totalRevenue.change}
          trend={analytics.overview.totalRevenue.trend}
          icon={CurrencyDollarIcon}
          color="green"
        />
        <DashboardCard
          title="Total Users"
          value={analytics.overview.totalUsers.value.toLocaleString()}
          change={analytics.overview.totalUsers.change}
          trend={analytics.overview.totalUsers.trend}
          icon={UsersIcon}
          color="blue"
        />
        <DashboardCard
          title="Total Orders"
          value={analytics.overview.totalOrders.value.toLocaleString()}
          change={analytics.overview.totalOrders.change}
          trend={analytics.overview.totalOrders.trend}
          icon={ShoppingBagIcon}
          color="purple"
        />
        <DashboardCard
          title="Avg Order Value"
          value={`₹${analytics.overview.avgOrderValue.value}`}
          change={analytics.overview.avgOrderValue.change}
          trend={analytics.overview.avgOrderValue.trend}
          icon={ArrowTrendingUpIcon}
          color="yellow"
        />
      </motion.div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <AnalyticsChart
            title="Sales Analytics"
            data={analytics.salesData}
            type="revenue"
          />
        </motion.div>

        {/* User Growth */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <UserGrowthChart title="User Growth" data={analytics.userGrowth} />
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <TopProducts
            title="Top Selling Products"
            data={analytics.topProducts}
          />
        </motion.div>

        {/* Subject Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <SubjectPerformance
            title="Subject Performance"
            data={analytics.subjectPerformance}
          />
        </motion.div>
      </div>

      {/* Additional Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-lg border border-gray-200 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Key Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <ArrowTrendingUpIcon className="h-6 w-6 text-green-600" />
            </div>
            <h4 className="font-medium text-gray-900">Revenue Growth</h4>
            <p className="text-sm text-gray-600 mt-1">
              15.2% increase in revenue compared to last period
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <UsersIcon className="h-6 w-6 text-blue-600" />
            </div>
            <h4 className="font-medium text-gray-900">User Acquisition</h4>
            <p className="text-sm text-gray-600 mt-1">
              8.5% growth in new user registrations
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <ShoppingBagIcon className="h-6 w-6 text-purple-600" />
            </div>
            <h4 className="font-medium text-gray-900">Best Category</h4>
            <p className="text-sm text-gray-600 mt-1">
              Mathematics books lead with 35% of total sales
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Subject Performance Component
function SubjectPerformance({ title, data }) {
  const maxSales = Math.max(...data.map((item) => item.sales));

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>

      <div className="space-y-4">
        {data.map((item, index) => (
          <motion.div
            key={item.subject}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center space-x-3 flex-1">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="font-medium text-gray-900">{item.subject}</span>
            </div>

            <div className="flex items-center space-x-4 flex-1">
              <div className="flex-1 bg-gray-100 rounded-full h-2 relative overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.sales / maxSales) * 100}%` }}
                  transition={{ delay: index * 0.1, duration: 0.8 }}
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                />
              </div>

              <div className="text-right min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {item.sales}
                </p>
                <p className="text-xs text-gray-500">{item.percentage}%</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Total sales across all subjects:{" "}
          {data.reduce((sum, item) => sum + item.sales, 0)} units
        </p>
      </div>
    </div>
  );
}
