"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/contexts/ToastContext";
import DataTable from "@/components/admin/DataTable";
import {
  EyeIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

// Mock order data
const mockOrders = [
  {
    id: "ORD-001",
    orderNumber: "RG2024001",
    userId: "user_001",
    customerName: "Rahul Sharma",
    customerEmail: "rahul.sharma@email.com",
    status: "pending",
    items: [
      { productId: "prod_001", title: "Class 10 Mathematics", quantity: 2, price: 450 },
      { productId: "prod_002", title: "Class 12 Physics Lab Manual", quantity: 1, price: 320 },
    ],
    summary: {
      subtotal: 1220,
      shipping: 50,
      tax: 122,
      discount: 0,
      total: 1392,
    },
    shippingAddress: {
      street: "123 Main Street",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      phone: "+91 9876543210",
    },
    paymentMethod: "razorpay",
    createdAt: "2025-01-26T10:30:00Z",
    updatedAt: "2025-01-26T10:30:00Z",
  },
  {
    id: "ORD-002",
    orderNumber: "RG2024002",
    userId: "user_002",
    customerName: "Priya Patel",
    customerEmail: "priya.patel@email.com",
    status: "confirmed",
    items: [
      { productId: "prod_003", title: "Class 9 English Grammar", quantity: 1, price: 280 },
    ],
    summary: {
      subtotal: 280,
      shipping: 0,
      tax: 28,
      discount: 30,
      total: 278,
    },
    shippingAddress: {
      street: "456 Park Avenue",
      city: "Delhi",
      state: "Delhi",
      pincode: "110001",
      phone: "+91 9876543211",
    },
    paymentMethod: "cod",
    createdAt: "2025-01-25T14:20:00Z",
    updatedAt: "2025-01-26T09:15:00Z",
  },
  {
    id: "ORD-003",
    orderNumber: "RG2024003",
    userId: "user_003",
    customerName: "Amit Kumar",
    customerEmail: "amit.kumar@email.com",
    status: "shipped",
    items: [
      { productId: "prod_004", title: "Class 11 Chemistry Advanced Guide", quantity: 1, price: 520 },
      { productId: "prod_001", title: "Class 10 Mathematics", quantity: 1, price: 450 },
    ],
    summary: {
      subtotal: 970,
      shipping: 50,
      tax: 97,
      discount: 100,
      total: 1017,
    },
    shippingAddress: {
      street: "789 Garden Road",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560001",
      phone: "+91 9876543212",
    },
    paymentMethod: "razorpay",
    createdAt: "2025-01-24T16:45:00Z",
    updatedAt: "2025-01-25T11:30:00Z",
  },
];

const statusColors = {
  pending: { bg: "bg-yellow-100", text: "text-yellow-800", icon: ClockIcon },
  confirmed: { bg: "bg-blue-100", text: "text-blue-800", icon: CheckCircleIcon },
  processing: { bg: "bg-purple-100", text: "text-purple-800", icon: ClockIcon },
  shipped: { bg: "bg-green-100", text: "text-green-800", icon: TruckIcon },
  delivered: { bg: "bg-green-100", text: "text-green-800", icon: CheckCircleIcon },
  cancelled: { bg: "bg-red-100", text: "text-red-800", icon: XCircleIcon },
};

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setOrders(mockOrders);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleStatusUpdate = (orderId, newStatus) => {
    setOrders(orders.map(order => 
      order.id === orderId 
        ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
        : order
    ));
    showSuccess(`Order status updated to ${newStatus}`);
  };

  const columns = [
    {
      key: "orderNumber",
      label: "Order #",
      render: (orderNumber) => (
        <span className="font-mono text-sm font-medium text-gray-900">{orderNumber}</span>
      ),
    },
    {
      key: "customer",
      label: "Customer",
      render: (_, order) => (
        <div>
          <p className="font-medium text-gray-900">{order.customerName}</p>
          <p className="text-sm text-gray-500">{order.customerEmail}</p>
        </div>
      ),
    },
    {
      key: "items",
      label: "Items",
      render: (items) => (
        <div>
          <p className="font-medium text-gray-900">{items.length} item(s)</p>
          <p className="text-sm text-gray-500 truncate max-w-32">
            {items[0]?.title}
            {items.length > 1 && ` +${items.length - 1} more`}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (status) => {
        const config = statusColors[status];
        const Icon = config.icon;
        return (
          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
            <Icon className="h-3 w-3 mr-1" />
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      },
    },
    {
      key: "summary",
      label: "Total",
      render: (summary) => (
        <span className="font-medium text-gray-900">₹{summary.total.toLocaleString()}</span>
      ),
    },
    {
      key: "paymentMethod",
      label: "Payment",
      render: (method) => (
        <span className="text-sm text-gray-600 capitalize">
          {method === "cod" ? "Cash on Delivery" : "Online Payment"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Date",
      render: (date) => (
        <div className="text-sm">
          <p className="text-gray-900">{new Date(date).toLocaleDateString()}</p>
          <p className="text-gray-500">{new Date(date).toLocaleTimeString()}</p>
        </div>
      ),
    },
  ];

  const actions = (order) => [
    <button
      key="view"
      onClick={(e) => {
        e.stopPropagation();
        setSelectedOrder(order);
      }}
      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
      title="View Details"
    >
      <EyeIcon className="h-4 w-4" />
    </button>,
    <select
      key="status"
      value={order.status}
      onChange={(e) => {
        e.stopPropagation();
        handleStatusUpdate(order.id, e.target.value);
      }}
      className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      onClick={(e) => e.stopPropagation()}
    >
      {statusOptions.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>,
  ];

  const getStatusCounts = () => {
    const counts = {};
    statusOptions.forEach(status => {
      counts[status.value] = orders.filter(order => order.status === status.value).length;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();
  const totalRevenue = orders.reduce((sum, order) => sum + order.summary.total, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-600 mt-1">
            Track and manage customer orders and deliveries
          </p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-sm">📦</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <ClockIcon className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{statusCounts.pending || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <TruckIcon className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Shipped</p>
              <p className="text-2xl font-bold text-gray-900">{statusCounts.shipped || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 font-semibold text-sm">₹</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹{totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Orders Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <DataTable
          data={orders}
          columns={columns}
          isLoading={isLoading}
          actions={actions}
          onRowClick={(order) => setSelectedOrder(order)}
        />
      </motion.div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
}

// Order Details Modal Component
function OrderDetailsModal({ order, onClose, onStatusUpdate }) {
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
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Order Details</h3>
            <p className="text-sm text-gray-500">Order #{order.orderNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Info */}
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Customer Information</h4>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p><span className="font-medium">Name:</span> {order.customerName}</p>
                <p><span className="font-medium">Email:</span> {order.customerEmail}</p>
                <p><span className="font-medium">Phone:</span> {order.shippingAddress.phone}</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Shipping Address</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                <p>{order.shippingAddress.pincode}</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Order Status</h4>
              <div className="flex items-center space-x-3">
                <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${statusColors[order.status].bg} ${statusColors[order.status].text}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
                <select
                  value={order.status}
                  onChange={(e) => onStatusUpdate(order.id, e.target.value)}
                  className="text-sm border border-gray-300 rounded px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {/* Order Items */}
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Order Summary</h4>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{order.summary.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>₹{order.summary.shipping.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>₹{order.summary.tax.toLocaleString()}</span>
                </div>
                {order.summary.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-₹{order.summary.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>₹{order.summary.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Payment Method</h4>
              <p className="text-sm text-gray-600 capitalize">
                {order.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
