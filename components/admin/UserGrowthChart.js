"use client";

import { motion } from "framer-motion";

export default function UserGrowthChart({ title, data }) {
  const maxUsers = Math.max(...data.map(d => d.users));
  const totalGrowth = data[data.length - 1].users - data[0].users;
  const growthPercentage = ((totalGrowth / data[0].users) * 100).toFixed(1);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="text-right">
          <p className="text-sm text-gray-600">Growth Rate</p>
          <p className="text-lg font-semibold text-green-600">+{growthPercentage}%</p>
        </div>
      </div>

      {/* Chart */}
      <div className="space-y-4">
        {data.map((item, index) => {
          const percentage = (item.users / maxUsers) * 100;
          const prevUsers = index > 0 ? data[index - 1].users : item.users;
          const growth = item.users - prevUsers;
          
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
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                />
              </div>
              
              <div className="w-16 text-sm font-medium text-gray-900 text-right">
                {item.users.toLocaleString()}
              </div>
              
              {index > 0 && (
                <div className="w-12 text-xs text-right">
                  <span className={`${growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {growth > 0 ? '+' : ''}{growth}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Current Users</p>
            <p className="text-lg font-semibold text-gray-900">
              {data[data.length - 1].users.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Growth</p>
            <p className="text-lg font-semibold text-green-600">
              +{totalGrowth.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Avg Monthly</p>
            <p className="text-lg font-semibold text-gray-900">
              +{Math.round(totalGrowth / (data.length - 1))}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
