"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ClockIcon,
  ExclamationTriangleIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-green-100 text-green-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function RecentActivity({ recentOrders, lowStockProducts }) {
  return (
    <div className="space-y-6">
      {/* Recent Orders */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
          <Link
            href="/admin/orders"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View all
          </Link>
        </div>
        
        <div className="space-y-3">
          {recentOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <p className="font-medium text-gray-900">{order.id}</p>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      statusColors[order.status]
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{order.customer}</p>
              </div>
              
              <div className="text-right">
                <p className="font-medium text-gray-900">₹{order.amount}</p>
                <p className="text-xs text-gray-500">{order.date}</p>
              </div>
              
              <Link
                href={`/admin/orders/${order.id}`}
                className="ml-3 p-1 text-gray-400 hover:text-gray-600"
              >
                <EyeIcon className="h-4 w-4" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Low Stock Alert */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-900">Low Stock Alert</h3>
          </div>
          <Link
            href="/admin/products"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Manage inventory
          </Link>
        </div>
        
        <div className="space-y-3">
          {lowStockProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200"
            >
              <div className="flex-1">
                <p className="font-medium text-gray-900">{product.name}</p>
                <p className="text-sm text-gray-600">
                  Only {product.stock} left in stock
                </p>
              </div>
              
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{
                        width: `${(product.stock / product.threshold) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {product.stock}/{product.threshold}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
