"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/contexts/ToastContext";
import DataTable from "@/components/admin/DataTable";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";

// Mock product data
const mockProducts = [
  {
    id: "prod_001",
    title: "Class 10 Mathematics Textbook",
    subject: "Mathematics",
    class: 10,
    type: "Textbook",
    price: 450,
    originalPrice: 500,
    author: "Dr. R.K. Sharma",
    publisher: "RG Publication",
    inStock: true,
    stockQuantity: 25,
    featured: "bestseller",
    rating: { average: 4.5, count: 128 },
    createdAt: "2024-01-15",
    images: ["https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300"],
  },
  {
    id: "prod_002",
    title: "Class 12 Physics Lab Manual",
    subject: "Science",
    class: 12,
    type: "Lab Manual",
    price: 320,
    originalPrice: 350,
    author: "Prof. A.K. Singh",
    publisher: "RG Publication",
    inStock: true,
    stockQuantity: 8,
    featured: "trending",
    rating: { average: 4.2, count: 89 },
    createdAt: "2024-01-20",
    images: ["https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300"],
  },
  {
    id: "prod_003",
    title: "Class 9 English Grammar",
    subject: "English",
    class: 9,
    type: "Practice Book",
    price: 280,
    originalPrice: 300,
    author: "Ms. P. Gupta",
    publisher: "RG Publication",
    inStock: false,
    stockQuantity: 0,
    featured: null,
    rating: { average: 4.0, count: 45 },
    createdAt: "2024-02-01",
    images: ["https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300"],
  },
  {
    id: "prod_004",
    title: "Class 11 Chemistry Advanced Guide",
    subject: "Science",
    class: 11,
    type: "Advanced Guide",
    price: 520,
    originalPrice: 580,
    author: "Dr. M. Patel",
    publisher: "RG Publication",
    inStock: true,
    stockQuantity: 15,
    featured: "new-arrival",
    rating: { average: 4.7, count: 67 },
    createdAt: "2024-02-10",
    images: ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300"],
  },
];

const subjectColors = {
  Mathematics: "bg-blue-100 text-blue-800",
  Science: "bg-green-100 text-green-800",
  English: "bg-purple-100 text-purple-800",
  "Social Science": "bg-yellow-100 text-yellow-800",
};

const featuredColors = {
  bestseller: "bg-red-100 text-red-800",
  trending: "bg-orange-100 text-orange-800",
  "new-arrival": "bg-green-100 text-green-800",
};

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setProducts(mockProducts);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleDeleteProduct = (productId) => {
    if (confirm("Are you sure you want to delete this product?")) {
      setProducts(products.filter(product => product.id !== productId));
      showSuccess("Product deleted successfully");
    }
  };

  const handleToggleStock = (productId) => {
    setProducts(products.map(product => 
      product.id === productId 
        ? { ...product, inStock: !product.inStock }
        : product
    ));
    showSuccess("Stock status updated");
  };

  const columns = [
    {
      key: "product",
      label: "Product",
      render: (_, product) => (
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
            {product.images?.[0] ? (
              <img
                src={product.images[0]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <PhotoIcon className="h-6 w-6 text-gray-400" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-gray-900 truncate">{product.title}</p>
            <p className="text-sm text-gray-500">{product.author}</p>
          </div>
        </div>
      ),
    },
    {
      key: "subject",
      label: "Subject",
      render: (subject) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${subjectColors[subject]}`}>
          {subject}
        </span>
      ),
    },
    {
      key: "class",
      label: "Class",
      render: (classNum) => (
        <span className="font-medium text-gray-900">Class {classNum}</span>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (type) => (
        <span className="text-sm text-gray-600">{type}</span>
      ),
    },
    {
      key: "price",
      label: "Price",
      render: (price, product) => (
        <div className="text-sm">
          <p className="font-medium text-gray-900">₹{price}</p>
          {product.originalPrice > price && (
            <p className="text-gray-500 line-through">₹{product.originalPrice}</p>
          )}
        </div>
      ),
    },
    {
      key: "stock",
      label: "Stock",
      render: (_, product) => (
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            product.inStock ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}>
            {product.inStock ? "In Stock" : "Out of Stock"}
          </span>
          {product.stockQuantity <= 10 && product.inStock && (
            <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" title="Low Stock" />
          )}
          <span className="text-sm text-gray-600">({product.stockQuantity})</span>
        </div>
      ),
    },
    {
      key: "featured",
      label: "Featured",
      render: (featured) => featured ? (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${featuredColors[featured]}`}>
          {featured.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
        </span>
      ) : (
        <span className="text-gray-400">-</span>
      ),
    },
    {
      key: "rating",
      label: "Rating",
      render: (rating) => (
        <div className="text-sm">
          <p className="font-medium text-gray-900">⭐ {rating.average}</p>
          <p className="text-gray-500">({rating.count} reviews)</p>
        </div>
      ),
    },
  ];

  const actions = (product) => [
    <button
      key="view"
      onClick={(e) => {
        e.stopPropagation();
        setSelectedProduct(product);
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
      title="Edit Product"
    >
      <PencilIcon className="h-4 w-4" />
    </button>,
    <button
      key="delete"
      onClick={(e) => {
        e.stopPropagation();
        handleDeleteProduct(product.id);
      }}
      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
      title="Delete Product"
    >
      <TrashIcon className="h-4 w-4" />
    </button>,
  ];

  const lowStockCount = products.filter(p => p.stockQuantity <= 10 && p.inStock).length;
  const outOfStockCount = products.filter(p => !p.inStock).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
          <p className="text-gray-600 mt-1">
            Manage your educational books and materials inventory
          </p>
        </div>
        
        <button
          onClick={() => showSuccess("Add product functionality coming soon")}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Add Product</span>
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
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-sm">📚</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 font-semibold text-sm">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Stock</p>
              <p className="text-2xl font-bold text-gray-900">
                {products.filter(p => p.inStock).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-gray-900">{lowStockCount}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-red-600 font-semibold text-sm">❌</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-gray-900">{outOfStockCount}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Products Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <DataTable
          data={products}
          columns={columns}
          isLoading={isLoading}
          actions={actions}
          onRowClick={(product) => setSelectedProduct(product)}
        />
      </motion.div>

      {/* Product Details Modal */}
      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onToggleStock={handleToggleStock}
        />
      )}
    </div>
  );
}

// Product Details Modal Component
function ProductDetailsModal({ product, onClose, onToggleStock }) {
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
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Product Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Image */}
          <div>
            <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
              {product.images?.[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <PhotoIcon className="h-16 w-16 text-gray-400" />
              )}
            </div>
          </div>
          
          {/* Product Info */}
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 text-lg">{product.title}</h4>
              <p className="text-gray-600">{product.author}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Subject</p>
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${subjectColors[product.subject]}`}>
                  {product.subject}
                </span>
              </div>
              <div>
                <p className="text-gray-600">Class</p>
                <p className="font-medium">Class {product.class}</p>
              </div>
              <div>
                <p className="text-gray-600">Type</p>
                <p className="font-medium">{product.type}</p>
              </div>
              <div>
                <p className="text-gray-600">Publisher</p>
                <p className="font-medium">{product.publisher}</p>
              </div>
              <div>
                <p className="text-gray-600">Price</p>
                <div>
                  <p className="font-medium">₹{product.price}</p>
                  {product.originalPrice > product.price && (
                    <p className="text-gray-500 line-through text-sm">₹{product.originalPrice}</p>
                  )}
                </div>
              </div>
              <div>
                <p className="text-gray-600">Stock</p>
                <p className="font-medium">{product.stockQuantity} units</p>
              </div>
              <div>
                <p className="text-gray-600">Rating</p>
                <p className="font-medium">⭐ {product.rating.average} ({product.rating.count})</p>
              </div>
              <div>
                <p className="text-gray-600">Featured</p>
                {product.featured ? (
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${featuredColors[product.featured]}`}>
                    {product.featured.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                ) : (
                  <p className="text-gray-400">Not featured</p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-3 pt-6 mt-6 border-t border-gray-200">
          <button
            onClick={() => onToggleStock(product.id)}
            className={`flex-1 font-medium py-2 px-4 rounded-lg transition-colors ${
              product.inStock
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-green-600 hover:bg-green-700 text-white"
            }`}
          >
            {product.inStock ? "Mark Out of Stock" : "Mark In Stock"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
