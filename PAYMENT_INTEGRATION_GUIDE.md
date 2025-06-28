# RG Publication - Payment Integration Guide

## 📋 Table of Contents

1. [Payment Gateway Analysis](#payment-gateway-analysis)
2. [Razorpay Integration Setup](#razorpay-integration-setup)
3. [Frontend Implementation](#frontend-implementation)
4. [Backend Implementation](#backend-implementation)
5. [Order Management Integration](#order-management-integration)
6. [Webhook Implementation](#webhook-implementation)
7. [Security & Compliance](#security--compliance)
8. [Testing Procedures](#testing-procedures)
9. [Error Handling](#error-handling)
10. [Refund & Cancellation](#refund--cancellation)
11. [Go-Live Checklist](#go-live-checklist)

---

## 💳 Payment Gateway Analysis

### Recommended: Razorpay (Best for Indian Market)

#### Pros

- ✅ **Indian Market Leader**: Specifically designed for Indian businesses
- ✅ **Multiple Payment Methods**: UPI, Cards, Net Banking, Wallets
- ✅ **Instant Settlements**: Same-day settlements available
- ✅ **Excellent Documentation**: Comprehensive guides and SDKs
- ✅ **Competitive Pricing**: 2% transaction fee (negotiable for higher volumes)
- ✅ **Strong Support**: 24/7 customer support in local languages
- ✅ **Regulatory Compliance**: RBI compliant, PCI DSS certified
- ✅ **Easy Integration**: Simple APIs and React SDK available

#### Cons

- ❌ **India-focused**: Limited international payment support
- ❌ **KYC Requirements**: Business verification needed

### Alternative Options

#### Stripe

**Pros**: Global reach, excellent developer experience, modern APIs
**Cons**: Higher fees in India (2.9% + ₹3), complex tax compliance
**Best for**: International customers, SaaS products

#### PayU

**Pros**: Strong in India, good local payment methods
**Cons**: Complex integration, limited documentation
**Best for**: Large enterprises with dedicated dev teams

#### Paytm

**Pros**: Popular brand, wallet integration
**Cons**: Limited payment methods, complex merchant onboarding
**Best for**: Businesses targeting Paytm wallet users

### Recommendation

**Razorpay** is the clear choice for RG Publication due to:

- Educational sector focus (many schools use Razorpay)
- Excellent UPI integration (preferred by students/parents)
- Competitive pricing for book sales volume
- Strong fraud protection for digital goods

---

## 🚀 Razorpay Integration Setup

### 1. Account Setup

#### Create Razorpay Account

1. Visit [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Sign up with business details
3. Complete KYC verification (required for live mode)
4. Get API keys from Dashboard → Settings → API Keys

#### Test vs Live Environment

```javascript
// Test Environment
const RAZORPAY_KEY_ID = "rzp_test_xxxxxxxxxx";
const RAZORPAY_KEY_SECRET = "xxxxxxxxxxxxxxxxxx";

// Live Environment (after KYC approval)
const RAZORPAY_KEY_ID = "rzp_live_xxxxxxxxxx";
const RAZORPAY_KEY_SECRET = "xxxxxxxxxxxxxxxxxx";
```

### 2. Install Dependencies

#### Frontend Dependencies

```bash
# Install Razorpay React SDK
npm install react-razorpay

# Alternative: Load via CDN in HTML
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

#### Backend Dependencies

```bash
# Install Razorpay Node.js SDK
cd backend
npm install razorpay

# Additional dependencies for payment processing
npm install crypto uuid
```

### 3. Environment Configuration

#### Frontend Environment (.env.local)

```env
# Razorpay Configuration
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
NEXT_PUBLIC_RAZORPAY_ENVIRONMENT=test
```

#### Backend Environment (.env)

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=whsec_xxxxxxxxxx

# Payment Configuration
PAYMENT_CURRENCY=INR
PAYMENT_TIMEOUT=900000
```

---

## 🎨 Frontend Implementation

### 1. Payment Context Setup

#### Create Payment Context

```jsx
// contexts/PaymentContext.js
"use client";

import React, { createContext, useContext, useState } from "react";
import { useAuth } from "./AuthContext";
import { useCart } from "./CartContext";
import { useToast } from "./ToastContext";

const PaymentContext = createContext();

export const PaymentProvider = ({ children }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const { user } = useAuth();
  const { cartItems, clearCart } = useCart();
  const { showSuccess, showError } = useToast();

  const initiatePayment = async (orderData) => {
    try {
      setIsProcessing(true);

      // Create order on backend
      const response = await fetch("/api/v1/payments/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message);
      }

      return result.data;
    } catch (error) {
      showError(error.message || "Failed to initiate payment");
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const processPayment = async (razorpayOrderId, amount, orderDetails) => {
    return new Promise((resolve, reject) => {
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount * 100, // Convert to paise
        currency: "INR",
        name: "RG Publication",
        description: "Educational Books Purchase",
        image: "/logo.png",
        order_id: razorpayOrderId,
        prefill: {
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          contact: user.phone || "",
        },
        theme: {
          color: "#a8f1ff",
        },
        modal: {
          ondismiss: () => {
            reject(new Error("Payment cancelled by user"));
          },
        },
        handler: async (response) => {
          try {
            // Verify payment on backend
            const verificationResult = await verifyPayment(
              response,
              orderDetails
            );
            if (verificationResult.success) {
              setPaymentStatus("success");
              showSuccess("Payment successful! Your order has been placed.");
              clearCart();
              resolve(verificationResult);
            } else {
              throw new Error("Payment verification failed");
            }
          } catch (error) {
            setPaymentStatus("failed");
            showError(error.message || "Payment verification failed");
            reject(error);
          }
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    });
  };

  const verifyPayment = async (paymentResponse, orderDetails) => {
    try {
      const response = await fetch("/api/v1/payments/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_order_id: paymentResponse.razorpay_order_id,
          razorpay_signature: paymentResponse.razorpay_signature,
          orderDetails,
        }),
      });

      return await response.json();
    } catch (error) {
      throw new Error("Payment verification failed");
    }
  };

  const value = {
    isProcessing,
    paymentStatus,
    initiatePayment,
    processPayment,
    verifyPayment,
  };

  return (
    <PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>
  );
};

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error("usePayment must be used within PaymentProvider");
  }
  return context;
};
```

### 2. Checkout Component

#### Create Checkout Page

```jsx
// app/checkout/page.js
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { usePayment } from "@/contexts/PaymentContext";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const { user, isAuthenticated } = useAuth();
  const { cartItems, cartSummary } = useCart();
  const { initiatePayment, processPayment, isProcessing } = usePayment();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login?redirect=/checkout");
      return;
    }

    if (cartItems.length === 0) {
      router.push("/cart");
      return;
    }

    // Pre-fill user data
    if (user) {
      setShippingAddress((prev) => ({
        ...prev,
        fullName: `${user.firstName} ${user.lastName}`,
        phone: user.phone || "",
      }));
    }
  }, [isAuthenticated, cartItems, user, router]);

  const handleAddressChange = (field, value) => {
    setShippingAddress((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateAddress = () => {
    const required = [
      "fullName",
      "address",
      "city",
      "state",
      "pincode",
      "phone",
    ];
    return required.every((field) => shippingAddress[field].trim() !== "");
  };

  const handlePayment = async () => {
    if (!validateAddress()) {
      alert("Please fill all address fields");
      return;
    }

    try {
      setIsLoading(true);

      // Prepare order data
      const orderData = {
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
        shippingAddress,
        summary: cartSummary,
      };

      // Create order and get Razorpay order ID
      const orderResult = await initiatePayment(orderData);

      // Process payment with Razorpay
      await processPayment(
        orderResult.razorpayOrderId,
        cartSummary.total,
        orderResult.orderDetails
      );

      // Redirect to success page
      router.push(`/order-success/${orderResult.orderId}`);
    } catch (error) {
      console.error("Payment failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated || cartItems.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Shipping Address Form */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Shipping Address
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={shippingAddress.fullName}
                  onChange={(e) =>
                    handleAddressChange("fullName", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  value={shippingAddress.address}
                  onChange={(e) =>
                    handleAddressChange("address", e.target.value)
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.city}
                    onChange={(e) =>
                      handleAddressChange("city", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.state}
                    onChange={(e) =>
                      handleAddressChange("state", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.pincode}
                    onChange={(e) =>
                      handleAddressChange("pincode", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={shippingAddress.phone}
                    onChange={(e) =>
                      handleAddressChange("phone", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Order Summary
            </h2>

            {/* Cart Items */}
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-4">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-16 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-500">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">
                  ₹{cartSummary.subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">
                  ₹{cartSummary.shipping.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">
                  ₹{cartSummary.tax.toFixed(2)}
                </span>
              </div>
              <div className="border-t pt-2 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>₹{cartSummary.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Button */}
            <button
              onClick={handlePayment}
              disabled={isLoading || isProcessing}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              {isLoading || isProcessing ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                `Pay ₹${cartSummary.total.toFixed(2)}`
              )}
            </button>

            {/* Payment Methods */}
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500 mb-2">
                Secure payment powered by
              </p>
              <img
                src="/razorpay-logo.png"
                alt="Razorpay"
                className="h-6 mx-auto"
              />
              <p className="text-xs text-gray-400 mt-2">
                UPI • Cards • Net Banking • Wallets
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
```

---

## ⚙️ Backend Implementation

### 1. Razorpay Configuration

#### Initialize Razorpay Instance

```javascript
// backend/config/razorpay.js
const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

module.exports = razorpay;
```

### 2. Payment Routes

#### Create Payment Routes File

```javascript
// backend/routes/payments.js
const express = require("express");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const razorpay = require("../config/razorpay");
const { authenticateToken } = require("../middleware/auth");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Cart = require("../models/Cart");

const router = express.Router();

// Create Razorpay order
router.post("/create-order", authenticateToken, async (req, res) => {
  try {
    const { items, shippingAddress, summary } = req.body;
    const userId = req.user.id;

    // Validate cart items and calculate total
    let calculatedTotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findOne({ id: item.productId });
      if (!product) {
        return res.status(400).json({
          success: false,
          error: "PRODUCT_NOT_FOUND",
          message: `Product ${item.productId} not found`,
          timestamp: new Date().toISOString(),
        });
      }

      if (!product.inStock || product.stockQuantity < item.quantity) {
        return res.status(400).json({
          success: false,
          error: "INSUFFICIENT_STOCK",
          message: `Insufficient stock for ${product.title}`,
          timestamp: new Date().toISOString(),
        });
      }

      const itemTotal = product.price * item.quantity;
      calculatedTotal += itemTotal;

      orderItems.push({
        productId: product.id,
        title: product.title,
        price: product.price,
        quantity: item.quantity,
        total: itemTotal,
      });
    }

    // Add shipping and tax
    const shipping = summary.shipping || 50; // Default shipping
    const tax = calculatedTotal * 0.18; // 18% GST
    const finalTotal = calculatedTotal + shipping + tax;

    // Create order in database
    const orderNumber = `RG${Date.now()}${Math.random()
      .toString(36)
      .substr(2, 4)
      .toUpperCase()}`;

    const order = new Order({
      id: uuidv4(),
      orderNumber,
      userId,
      items: orderItems,
      shippingAddress,
      summary: {
        subtotal: calculatedTotal,
        shipping,
        tax,
        total: finalTotal,
      },
      status: "pending",
      paymentStatus: "pending",
    });

    await order.save();

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(finalTotal * 100), // Convert to paise
      currency: "INR",
      receipt: order.orderNumber,
      notes: {
        orderId: order.id,
        userId: userId,
      },
    });

    // Update order with Razorpay order ID
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        razorpayOrderId: razorpayOrder.id,
        amount: finalTotal,
        currency: "INR",
        orderDetails: {
          orderId: order.id,
          items: orderItems,
          total: finalTotal,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to create order",
      timestamp: new Date().toISOString(),
    });
  }
});

// Verify payment
router.post("/verify", authenticateToken, async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      orderDetails,
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: "PAYMENT_VERIFICATION_FAILED",
        message: "Payment signature verification failed",
        timestamp: new Date().toISOString(),
      });
    }

    // Find and update order
    const order = await Order.findOne({
      razorpayOrderId: razorpay_order_id,
      userId: req.user.id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "ORDER_NOT_FOUND",
        message: "Order not found",
        timestamp: new Date().toISOString(),
      });
    }

    // Update order status
    order.status = "confirmed";
    order.paymentStatus = "completed";
    order.paymentDetails = {
      razorpayPaymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      razorpaySignature: razorpay_signature,
      paymentMethod: "razorpay",
      paidAt: new Date(),
    };

    await order.save();

    // Update product stock
    for (const item of order.items) {
      await Product.findOneAndUpdate(
        { id: item.productId },
        { $inc: { stockQuantity: -item.quantity } }
      );
    }

    // Clear user's cart
    await Cart.findOneAndUpdate(
      { userId: req.user.id },
      { $set: { items: [] } }
    );

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: "Payment verification failed",
      timestamp: new Date().toISOString(),
    });
  }
});

// Get payment status
router.get("/status/:orderId", authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({
      id: orderId,
      userId: req.user.id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "ORDER_NOT_FOUND",
        message: "Order not found",
        timestamp: new Date().toISOString(),
      });
    }

    res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        total: order.summary.total,
        createdAt: order.createdAt,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Get payment status error:", error);
    res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to get payment status",
      timestamp: new Date().toISOString(),
    });
  }
});

module.exports = router;
```

### 3. Update Order Model

#### Enhanced Order Schema

```javascript
// backend/models/Order.js - Add payment fields
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      required: true,
      default: () =>
        `order_${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
    },
    orderNumber: {
      type: String,
      unique: true,
      required: true,
    },
    userId: {
      type: String,
      required: true,
      ref: "User",
    },
    items: [
      {
        productId: { type: String, required: true },
        title: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        total: { type: Number, required: true },
      },
    ],
    shippingAddress: {
      fullName: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      phone: { type: String, required: true },
    },
    summary: {
      subtotal: { type: Number, required: true },
      shipping: { type: Number, required: true },
      tax: { type: Number, required: true },
      total: { type: Number, required: true },
    },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    paymentDetails: {
      razorpayPaymentId: String,
      razorpayOrderId: String,
      razorpaySignature: String,
      paymentMethod: String,
      paidAt: Date,
      refundId: String,
      refundedAt: Date,
    },
    razorpayOrderId: {
      type: String,
      unique: true,
      sparse: true,
    },
    trackingNumber: String,
    estimatedDelivery: Date,
    deliveredAt: Date,
    notes: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ razorpayOrderId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });

module.exports = mongoose.model("Order", orderSchema);
```

---

## 🔗 Order Management Integration

### 1. Update Cart Context

#### Add Checkout Integration

```jsx
// contexts/CartContext.js - Add checkout method
const proceedToCheckout = async () => {
  if (!isAuthenticated) {
    throw new Error("Please login to proceed with checkout");
  }

  if (cartItems.length === 0) {
    throw new Error("Your cart is empty");
  }

  // Validate stock availability before checkout
  for (const item of cartItems) {
    const response = await productAPI.getProduct(item.productId);
    if (!response.success) {
      throw new Error(`Product ${item.title} is no longer available`);
    }

    const product = response.data.product;
    if (!product.inStock || product.stockQuantity < item.quantity) {
      throw new Error(`Insufficient stock for ${item.title}`);
    }
  }

  return {
    items: cartItems,
    summary: cartSummary,
    isValid: true,
  };
};

// Add to context value
const value = {
  // ... existing values
  proceedToCheckout,
};
```

### 2. Order Success Page

#### Create Order Success Component

```jsx
// app/order-success/[orderId]/page.js
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function OrderSuccessPage() {
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { orderId } = useParams();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    loadOrderDetails();
  }, [orderId, isAuthenticated]);

  const loadOrderDetails = async () => {
    try {
      const response = await fetch(`/api/v1/payments/status/${orderId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        setOrder(result.data);
      } else {
        setError(result.message || "Order not found");
      }
    } catch (error) {
      setError("Failed to load order details");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push("/profile")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go to Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm p-8 text-center"
        >
          {/* Success Icon */}
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Order Placed Successfully!
          </h1>
          <p className="text-gray-600 mb-8">
            Thank you for your purchase. Your order has been confirmed and will
            be processed soon.
          </p>

          {/* Order Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <div className="grid grid-cols-2 gap-4 text-left">
              <div>
                <p className="text-sm text-gray-500">Order Number</p>
                <p className="font-semibold text-gray-900">
                  {order.orderNumber}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Order Total</p>
                <p className="font-semibold text-gray-900">
                  ₹{order.total.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Status</p>
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  {order.paymentStatus}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Order Date</p>
                <p className="font-semibold text-gray-900">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push("/profile?tab=orders")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              View Order Details
            </button>
            <button
              onClick={() => router.push("/shop")}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Continue Shopping
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-sm text-gray-500">
            <p>You will receive an email confirmation shortly.</p>
            <p>For any queries, contact us at support@rgpublication.com</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
```

---

## 🔔 Webhook Implementation

### 1. Webhook Route Setup

#### Create Webhook Handler

```javascript
// backend/routes/webhooks.js
const express = require("express");
const crypto = require("crypto");
const Order = require("../models/Order");
const Product = require("../models/Product");

const router = express.Router();

// Razorpay webhook handler
router.post(
  "/razorpay",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const webhookSignature = req.headers["x-razorpay-signature"];
      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

      // Verify webhook signature
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(req.body)
        .digest("hex");

      if (webhookSignature !== expectedSignature) {
        console.error("Webhook signature verification failed");
        return res.status(400).json({ error: "Invalid signature" });
      }

      const event = JSON.parse(req.body);
      console.log("Webhook received:", event.event);

      switch (event.event) {
        case "payment.captured":
          await handlePaymentCaptured(event.payload.payment.entity);
          break;

        case "payment.failed":
          await handlePaymentFailed(event.payload.payment.entity);
          break;

        case "order.paid":
          await handleOrderPaid(event.payload.order.entity);
          break;

        default:
          console.log("Unhandled webhook event:", event.event);
      }

      res.status(200).json({ status: "success" });
    } catch (error) {
      console.error("Webhook processing error:", error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  }
);

// Handle successful payment capture
const handlePaymentCaptured = async (payment) => {
  try {
    const order = await Order.findOne({
      razorpayOrderId: payment.order_id,
    });

    if (order && order.paymentStatus !== "completed") {
      order.paymentStatus = "completed";
      order.status = "confirmed";
      order.paymentDetails = {
        ...order.paymentDetails,
        razorpayPaymentId: payment.id,
        paymentMethod: payment.method,
        paidAt: new Date(payment.created_at * 1000),
      };

      await order.save();

      // Send confirmation email (implement as needed)
      // await sendOrderConfirmationEmail(order);

      console.log(`Payment captured for order: ${order.orderNumber}`);
    }
  } catch (error) {
    console.error("Error handling payment captured:", error);
  }
};

// Handle failed payment
const handlePaymentFailed = async (payment) => {
  try {
    const order = await Order.findOne({
      razorpayOrderId: payment.order_id,
    });

    if (order) {
      order.paymentStatus = "failed";
      order.status = "cancelled";
      order.paymentDetails = {
        ...order.paymentDetails,
        razorpayPaymentId: payment.id,
        failureReason: payment.error_description,
      };

      await order.save();

      // Restore product stock
      for (const item of order.items) {
        await Product.findOneAndUpdate(
          { id: item.productId },
          { $inc: { stockQuantity: item.quantity } }
        );
      }

      console.log(`Payment failed for order: ${order.orderNumber}`);
    }
  } catch (error) {
    console.error("Error handling payment failed:", error);
  }
};

// Handle order paid event
const handleOrderPaid = async (orderData) => {
  try {
    const order = await Order.findOne({
      razorpayOrderId: orderData.id,
    });

    if (order) {
      console.log(`Order paid webhook received for: ${order.orderNumber}`);
      // Additional processing if needed
    }
  } catch (error) {
    console.error("Error handling order paid:", error);
  }
};

module.exports = router;
```

### 2. Register Webhook Route

#### Add to Server

```javascript
// backend/server.js
app.use("/api/v1/webhooks", require("./routes/webhooks"));
```

### 3. Configure Webhook in Razorpay Dashboard

#### Webhook Setup Steps

1. Login to Razorpay Dashboard
2. Go to Settings → Webhooks
3. Click "Add New Webhook"
4. Enter webhook URL: `https://api.yourdomain.com/api/v1/webhooks/razorpay`
5. Select events:
   - `payment.captured`
   - `payment.failed`
   - `order.paid`
6. Set webhook secret and save

---

## 🔒 Security & Compliance

### 1. PCI DSS Compliance

#### Security Best Practices

```javascript
// Never store sensitive payment data
// ❌ DON'T DO THIS
const paymentData = {
  cardNumber: "4111111111111111",
  cvv: "123",
  expiryDate: "12/25",
};

// ✅ DO THIS - Let Razorpay handle sensitive data
const paymentOptions = {
  key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  amount: amount * 100,
  currency: "INR",
  order_id: razorpayOrderId,
  // Razorpay handles all sensitive payment data
};
```

#### Data Protection

```javascript
// backend/middleware/security.js
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "checkout.razorpay.com"],
        frameSrc: ["'self'", "api.razorpay.com"],
        connectSrc: ["'self'", "api.razorpay.com"],
      },
    },
  })
);

// Rate limiting for payment endpoints
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 payment requests per windowMs
  message: "Too many payment attempts, please try again later",
});

app.use("/api/v1/payments", paymentLimiter);
```

### 2. Input Validation

#### Payment Data Validation

```javascript
// backend/middleware/paymentValidation.js
const { body, validationResult } = require("express-validator");

const validateCreateOrder = [
  body("items").isArray({ min: 1 }).withMessage("Items array is required"),
  body("items.*.productId").notEmpty().withMessage("Product ID is required"),
  body("items.*.quantity")
    .isInt({ min: 1 })
    .withMessage("Valid quantity required"),
  body("shippingAddress.fullName")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Full name required"),
  body("shippingAddress.address")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Address required"),
  body("shippingAddress.pincode")
    .matches(/^[1-9][0-9]{5}$/)
    .withMessage("Valid pincode required"),
  body("shippingAddress.phone")
    .matches(/^[6-9]\d{9}$/)
    .withMessage("Valid phone number required"),
];

const validatePaymentVerification = [
  body("razorpay_payment_id").notEmpty().withMessage("Payment ID required"),
  body("razorpay_order_id").notEmpty().withMessage("Order ID required"),
  body("razorpay_signature").notEmpty().withMessage("Signature required"),
];

module.exports = {
  validateCreateOrder,
  validatePaymentVerification,
};
```

### 3. Error Handling & Logging

#### Secure Error Responses

```javascript
// Don't expose sensitive information in errors
const handlePaymentError = (error, req, res, next) => {
  // Log detailed error for debugging
  console.error("Payment Error:", {
    error: error.message,
    stack: error.stack,
    userId: req.user?.id,
    timestamp: new Date().toISOString(),
  });

  // Send generic error to client
  res.status(500).json({
    success: false,
    error: "PAYMENT_ERROR",
    message: "Payment processing failed. Please try again.",
    timestamp: new Date().toISOString(),
  });
};
```

---

## 🧪 Testing Procedures

### 1. Test Environment Setup

#### Razorpay Test Cards

```javascript
// Test card numbers for different scenarios
const testCards = {
  success: {
    number: "4111111111111111",
    cvv: "123",
    expiry: "12/25",
  },
  failure: {
    number: "4000000000000002",
    cvv: "123",
    expiry: "12/25",
  },
  insufficientFunds: {
    number: "4000000000000341",
    cvv: "123",
    expiry: "12/25",
  },
};

// Test UPI IDs
const testUPI = {
  success: "success@razorpay",
  failure: "failure@razorpay",
};
```

### 2. Automated Testing

#### Payment Flow Tests

```javascript
// __tests__/payment.test.js
const request = require("supertest");
const app = require("../server");

describe("Payment Integration", () => {
  let authToken;
  let testOrder;

  beforeEach(async () => {
    // Setup test user and auth token
    authToken = await getTestAuthToken();
  });

  test("should create payment order", async () => {
    const orderData = {
      items: [
        {
          productId: "test-product-1",
          quantity: 1,
          price: 299,
        },
      ],
      shippingAddress: {
        fullName: "Test User",
        address: "Test Address",
        city: "Test City",
        state: "Test State",
        pincode: "123456",
        phone: "9876543210",
      },
      summary: {
        subtotal: 299,
        shipping: 50,
        tax: 53.82,
        total: 402.82,
      },
    };

    const response = await request(app)
      .post("/api/v1/payments/create-order")
      .set("Authorization", `Bearer ${authToken}`)
      .send(orderData)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.razorpayOrderId).toBeDefined();
    testOrder = response.body.data;
  });

  test("should verify payment signature", async () => {
    // Mock Razorpay response
    const mockPaymentResponse = {
      razorpay_payment_id: "pay_test123",
      razorpay_order_id: testOrder.razorpayOrderId,
      razorpay_signature: generateTestSignature(),
    };

    const response = await request(app)
      .post("/api/v1/payments/verify")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        ...mockPaymentResponse,
        orderDetails: testOrder.orderDetails,
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.paymentStatus).toBe("completed");
  });
});
```

### 3. Manual Testing Checklist

#### Frontend Testing

- [ ] Payment button appears correctly
- [ ] Razorpay checkout opens properly
- [ ] All payment methods work (Cards, UPI, Net Banking)
- [ ] Payment success redirects to success page
- [ ] Payment failure shows appropriate error
- [ ] Cart clears after successful payment

#### Backend Testing

- [ ] Order creation validates all required fields
- [ ] Payment signature verification works
- [ ] Stock updates correctly after payment
- [ ] Webhook handles all event types
- [ ] Error responses don't expose sensitive data

#### Integration Testing

- [ ] End-to-end payment flow works
- [ ] Order status updates correctly
- [ ] Email notifications sent (if implemented)
- [ ] Refund process works
- [ ] Multiple concurrent payments handled

---

## ❌ Error Handling

### 1. Frontend Error Scenarios

#### Payment Error Handling

```jsx
// Enhanced error handling in PaymentContext
const processPayment = async (razorpayOrderId, amount, orderDetails) => {
  return new Promise((resolve, reject) => {
    const options = {
      // ... existing options
      handler: async (response) => {
        try {
          const verificationResult = await verifyPayment(
            response,
            orderDetails
          );
          if (verificationResult.success) {
            setPaymentStatus("success");
            showSuccess("Payment successful! Your order has been placed.");
            resolve(verificationResult);
          } else {
            throw new Error(
              verificationResult.message || "Payment verification failed"
            );
          }
        } catch (error) {
          setPaymentStatus("failed");
          handlePaymentError(error);
          reject(error);
        }
      },
      modal: {
        ondismiss: () => {
          setPaymentStatus("cancelled");
          showError("Payment was cancelled. Your order has not been placed.");
          reject(new Error("Payment cancelled by user"));
        },
      },
    };

    const razorpay = new window.Razorpay(options);

    razorpay.on("payment.failed", (response) => {
      setPaymentStatus("failed");
      handlePaymentError(response.error);
      reject(new Error(response.error.description || "Payment failed"));
    });

    razorpay.open();
  });
};

const handlePaymentError = (error) => {
  const errorMessages = {
    BAD_REQUEST_ERROR: "Invalid payment request. Please try again.",
    GATEWAY_ERROR: "Payment gateway error. Please try again.",
    NETWORK_ERROR: "Network error. Please check your connection.",
    SERVER_ERROR: "Server error. Please try again later.",
  };

  const message =
    errorMessages[error.code] ||
    error.description ||
    "Payment failed. Please try again.";
  showError(message);
};
```

### 2. Backend Error Handling

#### Comprehensive Error Responses

```javascript
// backend/utils/paymentErrors.js
class PaymentError extends Error {
  constructor(code, message, statusCode = 400) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}

const PaymentErrorCodes = {
  INVALID_AMOUNT: "INVALID_AMOUNT",
  PRODUCT_NOT_FOUND: "PRODUCT_NOT_FOUND",
  INSUFFICIENT_STOCK: "INSUFFICIENT_STOCK",
  PAYMENT_VERIFICATION_FAILED: "PAYMENT_VERIFICATION_FAILED",
  ORDER_NOT_FOUND: "ORDER_NOT_FOUND",
  DUPLICATE_PAYMENT: "DUPLICATE_PAYMENT",
};

const handlePaymentError = (error, req, res, next) => {
  if (error instanceof PaymentError) {
    return res.status(error.statusCode).json({
      success: false,
      error: error.code,
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }

  // Handle Razorpay API errors
  if (error.statusCode && error.error) {
    return res.status(error.statusCode).json({
      success: false,
      error: "RAZORPAY_ERROR",
      message: "Payment gateway error. Please try again.",
      timestamp: new Date().toISOString(),
    });
  }

  // Generic error
  console.error("Unhandled payment error:", error);
  res.status(500).json({
    success: false,
    error: "INTERNAL_SERVER_ERROR",
    message: "Payment processing failed. Please try again.",
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  PaymentError,
  PaymentErrorCodes,
  handlePaymentError,
};
```

---

## 💰 Refund & Cancellation

### 1. Refund Implementation

#### Refund API Route

```javascript
// backend/routes/payments.js - Add refund endpoint
router.post("/refund/:orderId", authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason, amount } = req.body;

    const order = await Order.findOne({
      id: orderId,
      userId: req.user.id,
      paymentStatus: "completed",
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "ORDER_NOT_FOUND",
        message: "Order not found or not eligible for refund",
        timestamp: new Date().toISOString(),
      });
    }

    // Create refund with Razorpay
    const refundAmount = amount || order.summary.total;
    const refund = await razorpay.payments.refund(
      order.paymentDetails.razorpayPaymentId,
      {
        amount: Math.round(refundAmount * 100), // Convert to paise
        notes: {
          reason: reason || "Customer request",
          orderId: order.id,
        },
      }
    );

    // Update order status
    order.paymentStatus = "refunded";
    order.status = "cancelled";
    order.paymentDetails.refundId = refund.id;
    order.paymentDetails.refundedAt = new Date();
    order.notes = reason || "Refund processed";

    await order.save();

    // Restore product stock
    for (const item of order.items) {
      await Product.findOneAndUpdate(
        { id: item.productId },
        { $inc: { stockQuantity: item.quantity } }
      );
    }

    res.status(200).json({
      success: true,
      message: "Refund processed successfully",
      data: {
        refundId: refund.id,
        amount: refundAmount,
        status: refund.status,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Refund error:", error);
    res.status(500).json({
      success: false,
      error: "REFUND_FAILED",
      message: "Failed to process refund",
      timestamp: new Date().toISOString(),
    });
  }
});
```

### 2. Frontend Refund Interface

#### Refund Request Component

```jsx
// components/RefundRequest.js
"use client";

import React, { useState } from "react";
import { useToast } from "@/contexts/ToastContext";

const RefundRequest = ({ order, onRefundSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [reason, setReason] = useState("");
  const { showSuccess, showError } = useToast();

  const handleRefundRequest = async () => {
    if (!reason.trim()) {
      showError("Please provide a reason for refund");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(`/api/v1/payments/refund/${order.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ reason }),
      });

      const result = await response.json();

      if (result.success) {
        showSuccess("Refund request submitted successfully");
        onRefundSuccess(result.data);
      } else {
        showError(result.message || "Failed to process refund");
      }
    } catch (error) {
      showError("Failed to submit refund request");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Request Refund
      </h3>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Reason for refund
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Please explain why you want to return this order..."
        />
      </div>

      <button
        onClick={handleRefundRequest}
        disabled={isLoading || !reason.trim()}
        className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
      >
        {isLoading ? "Processing..." : "Submit Refund Request"}
      </button>
    </div>
  );
};

export default RefundRequest;
```

---

## ✅ Go-Live Checklist

### 1. Pre-Launch Verification

#### Razorpay Account Setup

- [ ] KYC verification completed
- [ ] Live API keys generated
- [ ] Webhook URLs configured
- [ ] Settlement account verified
- [ ] Business details updated

#### Environment Configuration

- [ ] Production environment variables set
- [ ] Live Razorpay keys configured
- [ ] Webhook secrets updated
- [ ] SSL certificates installed
- [ ] Domain verification completed

#### Testing Completion

- [ ] All payment methods tested
- [ ] Webhook events verified
- [ ] Error scenarios handled
- [ ] Refund process tested
- [ ] Load testing completed

### 2. Security Checklist

#### Data Protection

- [ ] No sensitive payment data stored
- [ ] PCI DSS compliance verified
- [ ] Input validation implemented
- [ ] Rate limiting configured
- [ ] Error messages sanitized

#### API Security

- [ ] Authentication required for all payment endpoints
- [ ] Signature verification implemented
- [ ] HTTPS enforced
- [ ] CORS properly configured
- [ ] Security headers added

### 3. Monitoring Setup

#### Payment Monitoring

- [ ] Payment success/failure rates tracked
- [ ] Error logging implemented
- [ ] Alert system configured
- [ ] Dashboard metrics setup
- [ ] Webhook delivery monitoring

#### Business Metrics

- [ ] Revenue tracking
- [ ] Conversion rate monitoring
- [ ] Payment method analytics
- [ ] Refund rate tracking
- [ ] Customer satisfaction metrics

### 4. Documentation & Training

#### Team Preparation

- [ ] Payment flow documentation
- [ ] Error handling procedures
- [ ] Refund process guidelines
- [ ] Customer support training
- [ ] Emergency contact list

#### Customer Communication

- [ ] Payment policy updated
- [ ] Refund policy published
- [ ] FAQ section updated
- [ ] Support contact information
- [ ] Payment security information

---

**Document Version**: 1.0
**Last Updated**: January 26, 2025
**Integration Target**: Razorpay Payment Gateway
**Estimated Implementation Time**: 2-3 weeks

**Support Resources**:

- Razorpay Documentation: [razorpay.com/docs](https://razorpay.com/docs)
- Razorpay Support: Available 24/7 through dashboard
- Test Environment: Always test thoroughly before going live
- Community Forum: Active developer community for troubleshooting
