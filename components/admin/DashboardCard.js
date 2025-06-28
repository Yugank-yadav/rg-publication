"use client";

import { motion } from "framer-motion";
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from "@heroicons/react/24/outline";

const colorVariants = {
  blue: {
    bg: "bg-blue-50",
    icon: "text-blue-600",
    border: "border-blue-200",
  },
  green: {
    bg: "bg-green-50",
    icon: "text-green-600",
    border: "border-green-200",
  },
  yellow: {
    bg: "bg-yellow-50",
    icon: "text-yellow-600",
    border: "border-yellow-200",
  },
  purple: {
    bg: "bg-purple-50",
    icon: "text-purple-600",
    border: "border-purple-200",
  },
  red: {
    bg: "bg-red-50",
    icon: "text-red-600",
    border: "border-red-200",
  },
};

export default function DashboardCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  color = "blue",
  className = "",
}) {
  const colors = colorVariants[color];
  const isPositive = trend === "up";

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`
        bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-200
        ${className}
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>

          {change !== undefined && (
            <div className="flex items-center mt-2">
              {isPositive ? (
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
              )}

              <span
                className={`text-sm font-medium ${
                  isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                {Math.abs(change)}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs last month</span>
            </div>
          )}
        </div>

        <div className={`p-3 rounded-lg ${colors.bg} ${colors.border} border`}>
          <Icon className={`h-6 w-6 ${colors.icon}`} />
        </div>
      </div>
    </motion.div>
  );
}
