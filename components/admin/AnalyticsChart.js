"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function AnalyticsChart({ title, data, type = "revenue" }) {
  const [activeTab, setActiveTab] = useState(type);
  
  const maxValue = Math.max(...data.map(d => 
    activeTab === "revenue" ? d.revenue : d.orders
  ));

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        
        {/* Tab Switcher */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("revenue")}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
              activeTab === "revenue"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Revenue
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
              activeTab === "orders"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Orders
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="space-y-4">
        {data.map((item, index) => {
          const value = activeTab === "revenue" ? item.revenue : item.orders;
          const percentage = (value / maxValue) * 100;
          
          return (
            <div key={item.month} className="flex items-center space-x-4">
              <div className="w-8 text-sm font-medium text-gray-600">
                {item.month}
              </div>
              
              <div className="flex-1 bg-gray-100 rounded-full h-3 relative overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ delay: index * 0.1, duration: 0.8 }}
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                />
              </div>
              
              <div className="w-20 text-sm font-medium text-gray-900 text-right">
                {activeTab === "revenue" 
                  ? `₹${(value / 1000).toFixed(0)}k`
                  : value
                }
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-lg font-semibold text-gray-900">
              ₹{data.reduce((sum, d) => sum + d.revenue, 0).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Orders</p>
            <p className="text-lg font-semibold text-gray-900">
              {data.reduce((sum, d) => sum + d.orders, 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
