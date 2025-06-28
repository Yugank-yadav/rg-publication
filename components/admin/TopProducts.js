"use client";

import { motion } from "framer-motion";
import { TrophyIcon, ArrowTrendingUpIcon } from "@heroicons/react/24/outline";

export default function TopProducts({ title, data }) {
  const maxRevenue = Math.max(...data.map(item => item.revenue));

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <TrophyIcon className="h-5 w-5 text-yellow-500" />
      </div>

      <div className="space-y-4">
        {data.map((product, index) => {
          const percentage = (product.revenue / maxRevenue) * 100;
          
          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {/* Rank */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                index === 0 ? 'bg-yellow-100 text-yellow-800' :
                index === 1 ? 'bg-gray-100 text-gray-800' :
                index === 2 ? 'bg-orange-100 text-orange-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {index + 1}
              </div>
              
              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{product.name}</p>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-sm text-gray-600">{product.sales} sales</span>
                  <span className="text-sm font-medium text-gray-900">
                    ₹{product.revenue.toLocaleString()}
                  </span>
                </div>
              </div>
              
              {/* Performance Bar */}
              <div className="w-24">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ delay: index * 0.1, duration: 0.8 }}
                    className={`h-2 rounded-full ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-500' :
                      index === 2 ? 'bg-orange-500' :
                      'bg-blue-500'
                    }`}
                  />
                </div>
              </div>
              
              {/* Trend Icon */}
              <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
            </motion.div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total Sales</p>
            <p className="text-lg font-semibold text-gray-900">
              {data.reduce((sum, item) => sum + item.sales, 0)} units
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-lg font-semibold text-gray-900">
              ₹{data.reduce((sum, item) => sum + item.revenue, 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
