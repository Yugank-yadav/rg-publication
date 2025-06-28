"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  PlusIcon,
  UserPlusIcon,
  DocumentPlusIcon,
  ChartBarIcon,
  CogIcon,
  BellIcon,
} from "@heroicons/react/24/outline";

const quickActions = [
  {
    name: "Add Product",
    description: "Add a new book or educational material",
    href: "/admin/products/new",
    icon: PlusIcon,
    color: "bg-blue-500 hover:bg-blue-600",
  },
  {
    name: "Add User",
    description: "Create a new user account",
    href: "/admin/users/new",
    icon: UserPlusIcon,
    color: "bg-green-500 hover:bg-green-600",
  },
  {
    name: "Create Report",
    description: "Generate sales or analytics report",
    href: "/admin/analytics/reports",
    icon: DocumentPlusIcon,
    color: "bg-purple-500 hover:bg-purple-600",
  },
  {
    name: "View Analytics",
    description: "Check detailed performance metrics",
    href: "/admin/analytics",
    icon: ChartBarIcon,
    color: "bg-yellow-500 hover:bg-yellow-600",
  },
  {
    name: "System Settings",
    description: "Configure system preferences",
    href: "/admin/settings",
    icon: CogIcon,
    color: "bg-gray-500 hover:bg-gray-600",
  },
  {
    name: "Notifications",
    description: "Manage system notifications",
    href: "/admin/notifications",
    icon: BellIcon,
    color: "bg-red-500 hover:bg-red-600",
  },
];

export default function QuickActions() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickActions.map((action, index) => (
          <motion.div
            key={action.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -2 }}
            className="group"
          >
            <Link
              href={action.href}
              className="block p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${action.color} transition-colors`}>
                  <action.icon className="h-5 w-5 text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
                    {action.name}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {action.description}
                  </p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
