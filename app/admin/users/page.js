"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/contexts/ToastContext";
import DataTable from "@/components/admin/DataTable";
import { Avatar } from "@/components/avatar";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

// Mock user data
const mockUsers = [
  {
    id: "user_001",
    firstName: "Rahul",
    lastName: "Sharma",
    email: "rahul.sharma@email.com",
    role: "student",
    phone: "+91 9876543210",
    isEmailVerified: true,
    createdAt: "2024-01-15",
    stats: { totalOrders: 5, totalSpent: 2500 },
  },
  {
    id: "user_002",
    firstName: "Priya",
    lastName: "Patel",
    email: "priya.patel@email.com",
    role: "teacher",
    phone: "+91 9876543211",
    isEmailVerified: true,
    createdAt: "2024-01-20",
    stats: { totalOrders: 12, totalSpent: 8900 },
  },
  {
    id: "user_003",
    firstName: "Amit",
    lastName: "Kumar",
    email: "amit.kumar@email.com",
    role: "parent",
    phone: "+91 9876543212",
    isEmailVerified: false,
    createdAt: "2024-02-01",
    stats: { totalOrders: 3, totalSpent: 1200 },
  },
  {
    id: "user_004",
    firstName: "Sneha",
    lastName: "Singh",
    email: "sneha.singh@email.com",
    role: "student",
    phone: "+91 9876543213",
    isEmailVerified: true,
    createdAt: "2024-02-10",
    stats: { totalOrders: 8, totalSpent: 4500 },
  },
  {
    id: "user_005",
    firstName: "Admin",
    lastName: "User",
    email: "admin@rgpublication.com",
    role: "admin",
    phone: "+91 9876543214",
    isEmailVerified: true,
    createdAt: "2024-01-01",
    stats: { totalOrders: 0, totalSpent: 0 },
  },
];

const roleColors = {
  student: "bg-blue-100 text-blue-800",
  teacher: "bg-green-100 text-green-800",
  parent: "bg-purple-100 text-purple-800",
  admin: "bg-red-100 text-red-800",
};

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setUsers(mockUsers);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleDeleteUser = (userId) => {
    if (confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter(user => user.id !== userId));
      showSuccess("User deleted successfully");
    }
  };

  const handleToggleStatus = (userId) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, isEmailVerified: !user.isEmailVerified }
        : user
    ));
    showSuccess("User status updated");
  };

  const columns = [
    {
      key: "user",
      label: "User",
      render: (_, user) => (
        <div className="flex items-center space-x-3">
          <Avatar
            initials={user.firstName[0] + user.lastName[0]}
            size="sm"
            className="ring-2 ring-gray-200"
          />
          <div>
            <p className="font-medium text-gray-900">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (role) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${roleColors[role]}`}>
          {role.charAt(0).toUpperCase() + role.slice(1)}
        </span>
      ),
    },
    {
      key: "phone",
      label: "Phone",
    },
    {
      key: "isEmailVerified",
      label: "Status",
      render: (isVerified) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          isVerified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
        }`}>
          {isVerified ? "Verified" : "Pending"}
        </span>
      ),
    },
    {
      key: "stats",
      label: "Orders",
      render: (stats) => (
        <div className="text-sm">
          <p className="font-medium text-gray-900">{stats.totalOrders}</p>
          <p className="text-gray-500">₹{stats.totalSpent.toLocaleString()}</p>
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Joined",
      render: (date) => new Date(date).toLocaleDateString(),
    },
  ];

  const actions = (user) => [
    <button
      key="view"
      onClick={(e) => {
        e.stopPropagation();
        setSelectedUser(user);
      }}
      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
      title="View Details"
    >
      <EyeIcon className="h-4 w-4" />
    </button>,
    <button
      key="edit"
      onClick={(e) => {
        e.stopPropagation();
        showSuccess("Edit functionality coming soon");
      }}
      className="p-1 text-gray-400 hover:text-green-600 transition-colors"
      title="Edit User"
    >
      <PencilIcon className="h-4 w-4" />
    </button>,
    <button
      key="delete"
      onClick={(e) => {
        e.stopPropagation();
        handleDeleteUser(user.id);
      }}
      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
      title="Delete User"
      disabled={user.role === "admin"}
    >
      <TrashIcon className="h-4 w-4" />
    </button>,
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">
            Manage user accounts, roles, and permissions
          </p>
        </div>
        
        <button
          onClick={() => showSuccess("Add user functionality coming soon")}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Add User</span>
        </button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <UserIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 font-semibold text-sm">S</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Students</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.role === "student").length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 font-semibold text-sm">T</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Teachers</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.role === "teacher").length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-yellow-600 font-semibold text-sm">P</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Parents</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.role === "parent").length}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <DataTable
          data={users}
          columns={columns}
          isLoading={isLoading}
          actions={actions}
          onRowClick={(user) => setSelectedUser(user)}
        />
      </motion.div>

      {/* User Details Modal */}
      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onToggleStatus={handleToggleStatus}
        />
      )}
    </div>
  );
}

// User Details Modal Component
function UserDetailsModal({ user, onClose, onToggleStatus }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">User Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Avatar
              initials={user.firstName[0] + user.lastName[0]}
              size="lg"
              className="ring-2 ring-gray-200"
            />
            <div>
              <h4 className="font-medium text-gray-900">
                {user.firstName} {user.lastName}
              </h4>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Role</p>
              <p className="font-medium">{user.role}</p>
            </div>
            <div>
              <p className="text-gray-600">Phone</p>
              <p className="font-medium">{user.phone}</p>
            </div>
            <div>
              <p className="text-gray-600">Total Orders</p>
              <p className="font-medium">{user.stats.totalOrders}</p>
            </div>
            <div>
              <p className="text-gray-600">Total Spent</p>
              <p className="font-medium">₹{user.stats.totalSpent.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              onClick={() => onToggleStatus(user.id)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {user.isEmailVerified ? "Suspend" : "Verify"}
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
