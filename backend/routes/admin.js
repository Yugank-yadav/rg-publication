const express = require("express");
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Contact = require("../models/Contact");
const Review = require("../models/Review");
const Coupon = require("../models/Coupon");
const { authenticateToken, requireAdmin } = require("../middleware/auth");
const { body, param, query } = require("express-validator");
const { handleValidationErrors } = require("../utils/validation");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();

// All admin routes require admin authentication
router.use(authenticateToken);
router.use(requireAdmin);

// ===== USER MANAGEMENT =====

// Get All Users
router.get("/users", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      role,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter
    const filter = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Execute query
    const [users, totalItems] = await Promise.all([
      User.find(filter).sort(sortOptions).skip(skip).limit(limitNum).lean(),
      User.countDocuments(filter),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalItems / limitNum);

    // Get user statistics
    const userStats = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
    ]);

    const stats = {
      total: totalItems,
      byRole: userStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
    };

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems,
          itemsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPreviousPage: pageNum > 1,
        },
        stats,
      },
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  } catch (error) {
    console.error("Admin get users error:", error);

    res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to fetch users",
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  }
});

// Get User Details
router.get("/users/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findOne({ id: userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "USER_NOT_FOUND",
        message: "User not found",
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }

    // Get user's orders, reviews, and other data
    const [orders, reviews, wishlist] = await Promise.all([
      Order.find({ userId }).sort({ createdAt: -1 }).limit(10),
      Review.find({ userId }).sort({ createdAt: -1 }).limit(10),
      require("../models/Wishlist").findOne({ userId }),
    ]);

    const userDetails = {
      ...user.toJSON(),
      recentOrders: orders,
      recentReviews: reviews,
      wishlistItemCount: wishlist ? wishlist.itemCount : 0,
    };

    res.status(200).json({
      success: true,
      data: {
        user: userDetails,
      },
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  } catch (error) {
    console.error("Admin get user details error:", error);

    res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to fetch user details",
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  }
});

// Update User Status/Role
router.put(
  "/users/:userId",
  [
    body("role")
      .optional()
      .isIn(["student", "teacher", "parent", "admin"])
      .withMessage("Invalid role"),
    body("isEmailVerified")
      .optional()
      .isBoolean()
      .withMessage("isEmailVerified must be boolean"),
    body("isPhoneVerified")
      .optional()
      .isBoolean()
      .withMessage("isPhoneVerified must be boolean"),
    handleValidationErrors,
  ],
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { role, isEmailVerified, isPhoneVerified } = req.body;

      const user = await User.findOne({ id: userId });
      if (!user) {
        return res.status(404).json({
          success: false,
          error: "USER_NOT_FOUND",
          message: "User not found",
          timestamp: new Date().toISOString(),
          requestId: uuidv4(),
        });
      }

      // Update user fields
      if (role !== undefined) user.role = role;
      if (isEmailVerified !== undefined) user.isEmailVerified = isEmailVerified;
      if (isPhoneVerified !== undefined) user.isPhoneVerified = isPhoneVerified;

      await user.save();

      res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: {
          user: user.toJSON(),
        },
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    } catch (error) {
      console.error("Admin update user error:", error);

      res.status(500).json({
        success: false,
        error: "INTERNAL_SERVER_ERROR",
        message: "Failed to update user",
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }
  }
);

// Delete User
router.delete("/users/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent admin from deleting themselves
    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        error: "CANNOT_DELETE_SELF",
        message: "Cannot delete your own account",
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }

    const user = await User.findOne({ id: userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "USER_NOT_FOUND",
        message: "User not found",
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }

    // Delete user and related data
    await Promise.all([
      User.deleteOne({ id: userId }),
      Order.deleteMany({ userId }),
      Review.deleteMany({ userId }),
      require("../models/Cart").deleteMany({ userId }),
      require("../models/Wishlist").deleteMany({ userId }),
      require("../models/Address").deleteMany({ userId }),
    ]);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  } catch (error) {
    console.error("Admin delete user error:", error);

    res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to delete user",
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  }
});

// ===== PRODUCT MANAGEMENT =====

// Create Product
router.post(
  "/products",
  [
    body("title")
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage("Title must be between 1 and 255 characters"),
    body("description")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Description is required"),
    body("subject")
      .isIn(["Mathematics", "Science", "English", "Social Science"])
      .withMessage("Invalid subject"),
    body("class")
      .isInt({ min: 5, max: 12 })
      .withMessage("Class must be between 5 and 12"),
    body("type")
      .isIn(["Textbook", "Practice Book", "Lab Manual", "Advanced Guide"])
      .withMessage("Invalid product type"),
    body("price")
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number"),
    body("author")
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage("Author must be between 1 and 100 characters"),
    handleValidationErrors,
  ],
  async (req, res) => {
    try {
      const productData = {
        ...req.body,
        createdBy: req.user.id,
      };

      const product = new Product(productData);
      await product.save();

      res.status(201).json({
        success: true,
        message: "Product created successfully",
        data: {
          product: product.toJSON(),
        },
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    } catch (error) {
      console.error("Admin create product error:", error);

      if (error.name === "ValidationError") {
        const details = Object.values(error.errors).map((err) => ({
          field: err.path,
          message: err.message,
        }));

        return res.status(422).json({
          success: false,
          error: "VALIDATION_ERROR",
          message: "Invalid product data",
          details,
          timestamp: new Date().toISOString(),
          requestId: uuidv4(),
        });
      }

      res.status(500).json({
        success: false,
        error: "INTERNAL_SERVER_ERROR",
        message: "Failed to create product",
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }
  }
);

// Update Product
router.put(
  "/products/:productId",
  [
    body("title")
      .optional()
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage("Title must be between 1 and 255 characters"),
    body("price")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number"),
    body("inStock")
      .optional()
      .isBoolean()
      .withMessage("inStock must be boolean"),
    body("stockQuantity")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Stock quantity must be non-negative"),
    body("featured")
      .optional()
      .isIn(["bestseller", "trending", "new-arrival", null])
      .withMessage("Invalid featured type"),
    handleValidationErrors,
  ],
  async (req, res) => {
    try {
      const { productId } = req.params;

      const product = await Product.findOne({ id: productId });
      if (!product) {
        return res.status(404).json({
          success: false,
          error: "PRODUCT_NOT_FOUND",
          message: "Product not found",
          timestamp: new Date().toISOString(),
          requestId: uuidv4(),
        });
      }

      // Update product fields
      Object.keys(req.body).forEach((key) => {
        if (req.body[key] !== undefined) {
          product[key] = req.body[key];
        }
      });

      await product.save();

      res.status(200).json({
        success: true,
        message: "Product updated successfully",
        data: {
          product: product.toJSON(),
        },
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    } catch (error) {
      console.error("Admin update product error:", error);

      res.status(500).json({
        success: false,
        error: "INTERNAL_SERVER_ERROR",
        message: "Failed to update product",
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }
  }
);

// Delete Product
router.delete("/products/:productId", async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findOne({ id: productId });
    if (!product) {
      return res.status(404).json({
        success: false,
        error: "PRODUCT_NOT_FOUND",
        message: "Product not found",
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }

    // Check if product has orders
    const orderCount = await Order.countDocuments({
      "items.productId": productId,
    });

    if (orderCount > 0) {
      return res.status(400).json({
        success: false,
        error: "PRODUCT_HAS_ORDERS",
        message: "Cannot delete product with existing orders",
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }

    // Delete product and related data
    await Promise.all([
      Product.deleteOne({ id: productId }),
      Review.deleteMany({ productId }),
      require("../models/Cart").updateMany(
        {},
        { $pull: { items: { productId } } }
      ),
      require("../models/Wishlist").updateMany(
        {},
        { $pull: { items: { productId } } }
      ),
    ]);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  } catch (error) {
    console.error("Admin delete product error:", error);

    res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to delete product",
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  }
});

// ===== ORDER MANAGEMENT =====

// Get All Orders
router.get("/orders", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      paymentStatus,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { "shippingAddress.firstName": { $regex: search, $options: "i" } },
        { "shippingAddress.lastName": { $regex: search, $options: "i" } },
      ];
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Execute query
    const [orders, totalItems] = await Promise.all([
      Order.find(filter)
        .populate("userId", "firstName lastName email")
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Order.countDocuments(filter),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalItems / limitNum);

    // Get order statistics
    const orderStats = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalValue: { $sum: "$summary.total" },
        },
      },
    ]);

    const stats = {
      total: totalItems,
      byStatus: orderStats.reduce((acc, stat) => {
        acc[stat._id] = {
          count: stat.count,
          totalValue: stat.totalValue,
        };
        return acc;
      }, {}),
    };

    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems,
          itemsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPreviousPage: pageNum > 1,
        },
        stats,
      },
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  } catch (error) {
    console.error("Admin get orders error:", error);

    res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to fetch orders",
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  }
});

// Update Order Status
router.put(
  "/orders/:orderId/status",
  [
    body("status")
      .isIn([
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ])
      .withMessage("Invalid order status"),
    body("trackingNumber")
      .optional()
      .trim()
      .isLength({ min: 1 })
      .withMessage("Tracking number cannot be empty"),
    body("carrier")
      .optional()
      .trim()
      .isLength({ min: 1 })
      .withMessage("Carrier cannot be empty"),
    handleValidationErrors,
  ],
  async (req, res) => {
    try {
      const { orderId } = req.params;
      const { status, trackingNumber, carrier, notes } = req.body;

      const order = await Order.findOne({ id: orderId });
      if (!order) {
        return res.status(404).json({
          success: false,
          error: "ORDER_NOT_FOUND",
          message: "Order not found",
          timestamp: new Date().toISOString(),
          requestId: uuidv4(),
        });
      }

      // Update order status
      order.status = status;
      if (notes) order.notes = notes;

      // Add tracking information if provided
      if (trackingNumber && carrier) {
        order.tracking = {
          trackingNumber,
          carrier,
          status: "in_transit",
        };
      }

      // Set delivered date if status is delivered
      if (status === "delivered") {
        order.deliveredAt = new Date();
      }

      await order.save();

      res.status(200).json({
        success: true,
        message: "Order status updated successfully",
        data: {
          order: order.toJSON(),
        },
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    } catch (error) {
      console.error("Admin update order status error:", error);

      res.status(500).json({
        success: false,
        error: "INTERNAL_SERVER_ERROR",
        message: "Failed to update order status",
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }
  }
);

module.exports = router;
