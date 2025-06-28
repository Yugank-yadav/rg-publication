const express = require("express");
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Review = require("../models/Review");
const { authenticateToken, requireAdmin } = require("../middleware/auth");
const { query } = require("express-validator");
const { handleValidationErrors } = require("../utils/validation");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();

// All analytics routes require admin authentication
router.use(authenticateToken);
router.use(requireAdmin);

// Validation for date range queries
const validateDateRange = [
  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid ISO 8601 date"),
  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid ISO 8601 date"),
  query("period")
    .optional()
    .isIn(["day", "week", "month", "quarter", "year"])
    .withMessage("Period must be one of: day, week, month, quarter, year"),
  handleValidationErrors,
];

// Dashboard Overview
router.get("/dashboard", validateDateRange, async (req, res) => {
  try {
    const { startDate, endDate, period = "month" } = req.query;

    // Calculate date range
    const now = new Date();
    let start, end;

    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      end = now;
      switch (period) {
        case "day":
          start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case "week":
          start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "quarter":
          const quarter = Math.floor(now.getMonth() / 3);
          start = new Date(now.getFullYear(), quarter * 3, 1);
          break;
        case "year":
          start = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          start = new Date(now.getFullYear(), now.getMonth(), 1);
      }
    }

    // Get overview statistics
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      newUsers,
      newOrders,
      recentRevenue,
      topProducts,
      ordersByStatus,
    ] = await Promise.all([
      // Total counts
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $group: { _id: null, total: { $sum: "$summary.total" } } },
      ]),

      // Period-specific data
      User.countDocuments({ createdAt: { $gte: start, $lte: end } }),
      Order.countDocuments({ createdAt: { $gte: start, $lte: end } }),
      Order.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        { $group: { _id: null, total: { $sum: "$summary.total" } } },
      ]),

      // Top products by sales
      Order.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.productId",
            title: { $first: "$items.title" },
            totalSold: { $sum: "$items.quantity" },
            totalRevenue: { $sum: "$items.totalPrice" },
          },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
      ]),

      // Orders by status
      Order.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            revenue: { $sum: "$summary.total" },
          },
        },
      ]),
    ]);

    const overview = {
      totals: {
        users: totalUsers,
        products: totalProducts,
        orders: totalOrders,
        revenue: totalRevenue[0]?.total || 0,
      },
      period: {
        name: period,
        startDate: start,
        endDate: end,
        newUsers,
        newOrders,
        revenue: recentRevenue[0]?.total || 0,
      },
      topProducts,
      ordersByStatus: ordersByStatus.reduce((acc, item) => {
        acc[item._id] = {
          count: item.count,
          revenue: item.revenue,
        };
        return acc;
      }, {}),
    };

    res.status(200).json({
      success: true,
      data: {
        overview,
      },
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  } catch (error) {
    console.error("Analytics dashboard error:", error);

    res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to fetch dashboard analytics",
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  }
});

// Sales Reports
router.get("/sales", validateDateRange, async (req, res) => {
  try {
    const { startDate, endDate, period = "month", groupBy = "day" } = req.query;

    // Calculate date range
    const now = new Date();
    let start, end;

    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      end = now;
      switch (period) {
        case "week":
          start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "quarter":
          const quarter = Math.floor(now.getMonth() / 3);
          start = new Date(now.getFullYear(), quarter * 3, 1);
          break;
        case "year":
          start = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          start = new Date(now.getFullYear(), now.getMonth(), 1);
      }
    }

    // Group by format
    let groupFormat;
    switch (groupBy) {
      case "hour":
        groupFormat = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
          hour: { $hour: "$createdAt" },
        };
        break;
      case "day":
        groupFormat = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        };
        break;
      case "week":
        groupFormat = {
          year: { $year: "$createdAt" },
          week: { $week: "$createdAt" },
        };
        break;
      case "month":
        groupFormat = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        };
        break;
      default:
        groupFormat = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        };
    }

    // Sales data aggregation
    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: { $in: ["confirmed", "processing", "shipped", "delivered"] },
        },
      },
      {
        $group: {
          _id: groupFormat,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$summary.total" },
          averageOrderValue: { $avg: "$summary.total" },
          totalItems: { $sum: { $size: "$items" } },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.hour": 1 } },
    ]);

    // Product performance
    const productPerformance = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: { $in: ["confirmed", "processing", "shipped", "delivered"] },
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          title: { $first: "$items.title" },
          totalSold: { $sum: "$items.quantity" },
          totalRevenue: { $sum: "$items.totalPrice" },
          averagePrice: { $avg: "$items.unitPrice" },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
    ]);

    // Payment method breakdown
    const paymentMethods = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: { $in: ["confirmed", "processing", "shipped", "delivered"] },
        },
      },
      {
        $group: {
          _id: "$paymentMethod",
          count: { $sum: 1 },
          revenue: { $sum: "$summary.total" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        period: {
          startDate: start,
          endDate: end,
          groupBy,
        },
        salesData,
        productPerformance,
        paymentMethods,
      },
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  } catch (error) {
    console.error("Sales analytics error:", error);

    res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to fetch sales analytics",
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  }
});

// User Analytics
router.get("/users", validateDateRange, async (req, res) => {
  try {
    const { startDate, endDate, period = "month" } = req.query;

    // Calculate date range
    const now = new Date();
    let start, end;

    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      end = now;
      switch (period) {
        case "week":
          start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "year":
          start = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          start = new Date(now.getFullYear(), now.getMonth(), 1);
      }
    }

    // User registration trends
    const userRegistrations = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    // User demographics
    const userDemographics = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
    ]);

    // Active users (users who placed orders)
    const activeUsers = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: "$userId",
          orderCount: { $sum: 1 },
          totalSpent: { $sum: "$summary.total" },
        },
      },
      {
        $group: {
          _id: null,
          activeUserCount: { $sum: 1 },
          averageOrdersPerUser: { $avg: "$orderCount" },
          averageSpentPerUser: { $avg: "$totalSpent" },
        },
      },
    ]);

    // Top customers
    const topCustomers = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: "$userId",
          orderCount: { $sum: 1 },
          totalSpent: { $sum: "$summary.total" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          userId: "$_id",
          name: { $concat: ["$user.firstName", " ", "$user.lastName"] },
          email: "$user.email",
          orderCount: 1,
          totalSpent: 1,
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 },
    ]);

    res.status(200).json({
      success: true,
      data: {
        period: {
          startDate: start,
          endDate: end,
        },
        userRegistrations,
        userDemographics,
        activeUsers: activeUsers[0] || {
          activeUserCount: 0,
          averageOrdersPerUser: 0,
          averageSpentPerUser: 0,
        },
        topCustomers,
      },
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  } catch (error) {
    console.error("User analytics error:", error);

    res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to fetch user analytics",
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  }
});

// Product Analytics
router.get("/products", validateDateRange, async (req, res) => {
  try {
    const { startDate, endDate, period = "month" } = req.query;

    // Calculate date range
    const now = new Date();
    let start, end;

    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      end = now;
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Product performance metrics
    const productMetrics = await Product.aggregate([
      {
        $lookup: {
          from: "orders",
          let: { productId: "$id" },
          pipeline: [
            { $unwind: "$items" },
            {
              $match: {
                $expr: { $eq: ["$items.productId", "$$productId"] },
                createdAt: { $gte: start, $lte: end },
                status: {
                  $in: ["confirmed", "processing", "shipped", "delivered"],
                },
              },
            },
          ],
          as: "orderItems",
        },
      },
      {
        $lookup: {
          from: "reviews",
          localField: "id",
          foreignField: "productId",
          as: "reviews",
        },
      },
      {
        $lookup: {
          from: "wishlists",
          let: { productId: "$id" },
          pipeline: [
            { $unwind: "$items" },
            { $match: { $expr: { $eq: ["$items.productId", "$$productId"] } } },
          ],
          as: "wishlistItems",
        },
      },
      {
        $project: {
          id: 1,
          title: 1,
          subject: 1,
          class: 1,
          type: 1,
          price: 1,
          inStock: 1,
          totalSold: { $sum: "$orderItems.items.quantity" },
          totalRevenue: { $sum: "$orderItems.items.totalPrice" },
          averageRating: "$rating.average",
          reviewCount: { $size: "$reviews" },
          wishlistCount: { $size: "$wishlistItems" },
          viewCount: { $ifNull: ["$viewCount", 0] },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    // Category performance
    const categoryPerformance = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: { $in: ["confirmed", "processing", "shipped", "delivered"] },
        },
      },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $group: {
          _id: {
            subject: "$product.subject",
            class: "$product.class",
          },
          totalSold: { $sum: "$items.quantity" },
          totalRevenue: { $sum: "$items.totalPrice" },
          uniqueProducts: { $addToSet: "$items.productId" },
        },
      },
      {
        $project: {
          subject: "$_id.subject",
          class: "$_id.class",
          totalSold: 1,
          totalRevenue: 1,
          uniqueProductCount: { $size: "$uniqueProducts" },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    // Low stock alerts
    const lowStockProducts = await Product.find({
      $or: [{ stockQuantity: { $lte: 5 } }, { inStock: false }],
    })
      .select("id title stockQuantity inStock price")
      .limit(20);

    res.status(200).json({
      success: true,
      data: {
        period: {
          startDate: start,
          endDate: end,
        },
        productMetrics,
        categoryPerformance,
        lowStockProducts,
      },
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  } catch (error) {
    console.error("Product analytics error:", error);

    res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to fetch product analytics",
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  }
});

module.exports = router;
