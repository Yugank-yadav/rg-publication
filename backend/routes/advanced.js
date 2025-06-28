const express = require("express");
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Review = require("../models/Review");
const Coupon = require("../models/Coupon");
const { authenticateToken, requireAdmin } = require("../middleware/auth");
const { body, query } = require("express-validator");
const { handleValidationErrors } = require("../utils/validation");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs").promises;
const path = require("path");

const router = express.Router();

// All advanced routes require admin authentication
router.use(authenticateToken);
router.use(requireAdmin);

// ===== BULK OPERATIONS =====

// Bulk Update Products
router.put(
  "/products/bulk",
  [
    body("productIds")
      .isArray({ min: 1 })
      .withMessage("Product IDs array is required"),
    body("updates").isObject().withMessage("Updates object is required"),
    handleValidationErrors,
  ],
  async (req, res) => {
    try {
      const { productIds, updates } = req.body;

      // Validate that products exist
      const existingProducts = await Product.find({ id: { $in: productIds } });
      if (existingProducts.length !== productIds.length) {
        return res.status(400).json({
          success: false,
          error: "INVALID_PRODUCTS",
          message: "One or more products not found",
          timestamp: new Date().toISOString(),
          requestId: uuidv4(),
        });
      }

      // Perform bulk update
      const result = await Product.updateMany(
        { id: { $in: productIds } },
        { $set: updates }
      );

      res.status(200).json({
        success: true,
        message: "Bulk product update completed",
        data: {
          matchedCount: result.matchedCount,
          modifiedCount: result.modifiedCount,
          updatedProducts: productIds.length,
        },
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    } catch (error) {
      console.error("Bulk update products error:", error);

      res.status(500).json({
        success: false,
        error: "BULK_UPDATE_FAILED",
        message: "Failed to perform bulk product update",
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }
  }
);

// Bulk Delete Products
router.delete(
  "/products/bulk",
  [
    body("productIds")
      .isArray({ min: 1 })
      .withMessage("Product IDs array is required"),
    handleValidationErrors,
  ],
  async (req, res) => {
    try {
      const { productIds } = req.body;

      // Check if any products have orders
      const ordersWithProducts = await Order.find({
        "items.productId": { $in: productIds },
      }).countDocuments();

      if (ordersWithProducts > 0) {
        return res.status(400).json({
          success: false,
          error: "PRODUCTS_HAVE_ORDERS",
          message: "Cannot delete products that have existing orders",
          timestamp: new Date().toISOString(),
          requestId: uuidv4(),
        });
      }

      // Perform bulk deletion
      const [productResult, reviewResult, cartResult, wishlistResult] =
        await Promise.all([
          Product.deleteMany({ id: { $in: productIds } }),
          Review.deleteMany({ productId: { $in: productIds } }),
          require("../models/Cart").updateMany(
            {},
            { $pull: { items: { productId: { $in: productIds } } } }
          ),
          require("../models/Wishlist").updateMany(
            {},
            { $pull: { items: { productId: { $in: productIds } } } }
          ),
        ]);

      res.status(200).json({
        success: true,
        message: "Bulk product deletion completed",
        data: {
          deletedProducts: productResult.deletedCount,
          deletedReviews: reviewResult.deletedCount,
          updatedCarts: cartResult.modifiedCount,
          updatedWishlists: wishlistResult.modifiedCount,
        },
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    } catch (error) {
      console.error("Bulk delete products error:", error);

      res.status(500).json({
        success: false,
        error: "BULK_DELETE_FAILED",
        message: "Failed to perform bulk product deletion",
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }
  }
);

// Bulk Update Order Status
router.put(
  "/orders/bulk-status",
  [
    body("orderIds")
      .isArray({ min: 1 })
      .withMessage("Order IDs array is required"),
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
    handleValidationErrors,
  ],
  async (req, res) => {
    try {
      const { orderIds, status, notes } = req.body;

      // Validate that orders exist
      const existingOrders = await Order.find({ id: { $in: orderIds } });
      if (existingOrders.length !== orderIds.length) {
        return res.status(400).json({
          success: false,
          error: "INVALID_ORDERS",
          message: "One or more orders not found",
          timestamp: new Date().toISOString(),
          requestId: uuidv4(),
        });
      }

      // Prepare update object
      const updateObj = { status };
      if (notes) updateObj.notes = notes;
      if (status === "delivered") updateObj.deliveredAt = new Date();

      // Perform bulk update
      const result = await Order.updateMany(
        { id: { $in: orderIds } },
        { $set: updateObj }
      );

      res.status(200).json({
        success: true,
        message: "Bulk order status update completed",
        data: {
          matchedCount: result.matchedCount,
          modifiedCount: result.modifiedCount,
          updatedOrders: orderIds.length,
          newStatus: status,
        },
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    } catch (error) {
      console.error("Bulk update order status error:", error);

      res.status(500).json({
        success: false,
        error: "BULK_UPDATE_FAILED",
        message: "Failed to perform bulk order status update",
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }
  }
);

// Bulk User Operations
router.put(
  "/users/bulk",
  [
    body("userIds")
      .isArray({ min: 1 })
      .withMessage("User IDs array is required"),
    body("action")
      .isIn(["activate", "deactivate", "verify-email", "change-role"])
      .withMessage("Invalid bulk action"),
    handleValidationErrors,
  ],
  async (req, res) => {
    try {
      const { userIds, action, role } = req.body;

      // Prevent admin from affecting themselves
      if (userIds.includes(req.user.id)) {
        return res.status(400).json({
          success: false,
          error: "CANNOT_MODIFY_SELF",
          message: "Cannot perform bulk operations on your own account",
          timestamp: new Date().toISOString(),
          requestId: uuidv4(),
        });
      }

      let updateObj = {};
      switch (action) {
        case "activate":
          updateObj = { isActive: true };
          break;
        case "deactivate":
          updateObj = { isActive: false };
          break;
        case "verify-email":
          updateObj = { isEmailVerified: true };
          break;
        case "change-role":
          if (
            !role ||
            !["student", "teacher", "parent", "admin"].includes(role)
          ) {
            return res.status(400).json({
              success: false,
              error: "INVALID_ROLE",
              message: "Valid role is required for role change action",
              timestamp: new Date().toISOString(),
              requestId: uuidv4(),
            });
          }
          updateObj = { role };
          break;
      }

      // Perform bulk update
      const result = await User.updateMany(
        { id: { $in: userIds } },
        { $set: updateObj }
      );

      res.status(200).json({
        success: true,
        message: `Bulk user ${action} completed`,
        data: {
          matchedCount: result.matchedCount,
          modifiedCount: result.modifiedCount,
          action,
          affectedUsers: userIds.length,
        },
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    } catch (error) {
      console.error("Bulk user operations error:", error);

      res.status(500).json({
        success: false,
        error: "BULK_OPERATION_FAILED",
        message: "Failed to perform bulk user operation",
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }
  }
);

// ===== DATA EXPORT/IMPORT =====

// Export Data
router.get(
  "/export/:type",
  [
    query("format")
      .optional()
      .isIn(["json", "csv"])
      .withMessage("Format must be json or csv"),
    query("startDate")
      .optional()
      .isISO8601()
      .withMessage("Start date must be valid ISO 8601 date"),
    query("endDate")
      .optional()
      .isISO8601()
      .withMessage("End date must be valid ISO 8601 date"),
    handleValidationErrors,
  ],
  async (req, res) => {
    try {
      const { type } = req.params;
      const { format = "json", startDate, endDate, limit = 1000 } = req.query;

      // Build date filter if provided
      const dateFilter = {};
      if (startDate || endDate) {
        dateFilter.createdAt = {};
        if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
        if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
      }

      let data = [];
      let filename = "";

      switch (type) {
        case "users":
          data = await User.find(dateFilter)
            .select("-password")
            .limit(parseInt(limit))
            .lean();
          filename = `users_export_${Date.now()}`;
          break;

        case "products":
          data = await Product.find(dateFilter).limit(parseInt(limit)).lean();
          filename = `products_export_${Date.now()}`;
          break;

        case "orders":
          data = await Order.find(dateFilter)
            .populate("userId", "firstName lastName email")
            .limit(parseInt(limit))
            .lean();
          filename = `orders_export_${Date.now()}`;
          break;

        case "reviews":
          data = await Review.find(dateFilter)
            .populate("userId", "firstName lastName")
            .populate("productId", "title")
            .limit(parseInt(limit))
            .lean();
          filename = `reviews_export_${Date.now()}`;
          break;

        case "analytics":
          // Export analytics summary
          const [userCount, productCount, orderCount, totalRevenue] =
            await Promise.all([
              User.countDocuments(dateFilter),
              Product.countDocuments(dateFilter),
              Order.countDocuments(dateFilter),
              Order.aggregate([
                { $match: dateFilter },
                { $group: { _id: null, total: { $sum: "$summary.total" } } },
              ]),
            ]);

          data = [
            {
              exportDate: new Date().toISOString(),
              period: { startDate, endDate },
              summary: {
                users: userCount,
                products: productCount,
                orders: orderCount,
                revenue: totalRevenue[0]?.total || 0,
              },
            },
          ];
          filename = `analytics_export_${Date.now()}`;
          break;

        default:
          return res.status(400).json({
            success: false,
            error: "INVALID_EXPORT_TYPE",
            message:
              "Invalid export type. Supported: users, products, orders, reviews, analytics",
            timestamp: new Date().toISOString(),
            requestId: uuidv4(),
          });
      }

      if (format === "csv") {
        // Convert to CSV format
        if (data.length === 0) {
          return res.status(404).json({
            success: false,
            error: "NO_DATA_FOUND",
            message: "No data found for export",
            timestamp: new Date().toISOString(),
            requestId: uuidv4(),
          });
        }

        const headers = Object.keys(data[0]);
        const csvContent = [
          headers.join(","),
          ...data.map((row) =>
            headers
              .map((header) => {
                const value = row[header];
                if (typeof value === "object" && value !== null) {
                  return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
                }
                return `"${String(value || "").replace(/"/g, '""')}"`;
              })
              .join(",")
          ),
        ].join("\n");

        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${filename}.csv"`
        );
        return res.send(csvContent);
      }

      // JSON format
      res.setHeader("Content-Type", "application/json");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}.json"`
      );

      res.status(200).json({
        success: true,
        exportInfo: {
          type,
          format,
          recordCount: data.length,
          exportDate: new Date().toISOString(),
          filters: { startDate, endDate, limit },
        },
        data,
      });
    } catch (error) {
      console.error("Data export error:", error);

      res.status(500).json({
        success: false,
        error: "EXPORT_FAILED",
        message: "Failed to export data",
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }
  }
);

// Import Data
router.post(
  "/import/:type",
  [
    body("data").isArray({ min: 1 }).withMessage("Data array is required"),
    body("mode")
      .optional()
      .isIn(["insert", "upsert", "replace"])
      .withMessage("Mode must be insert, upsert, or replace"),
    handleValidationErrors,
  ],
  async (req, res) => {
    try {
      const { type } = req.params;
      const { data, mode = "insert", validateOnly = false } = req.body;

      let Model;
      let validationErrors = [];

      // Determine model and validate data structure
      switch (type) {
        case "products":
          Model = Product;
          // Validate required fields for products
          data.forEach((item, index) => {
            if (!item.title || !item.subject || !item.class || !item.price) {
              validationErrors.push(
                `Row ${
                  index + 1
                }: Missing required fields (title, subject, class, price)`
              );
            }
          });
          break;

        case "users":
          Model = User;
          // Validate required fields for users
          data.forEach((item, index) => {
            if (!item.firstName || !item.lastName || !item.email) {
              validationErrors.push(
                `Row ${
                  index + 1
                }: Missing required fields (firstName, lastName, email)`
              );
            }
            if (item.email && !/\S+@\S+\.\S+/.test(item.email)) {
              validationErrors.push(`Row ${index + 1}: Invalid email format`);
            }
          });
          break;

        case "coupons":
          Model = Coupon;
          // Validate required fields for coupons
          data.forEach((item, index) => {
            if (
              !item.code ||
              !item.name ||
              !item.type ||
              item.value === undefined
            ) {
              validationErrors.push(
                `Row ${
                  index + 1
                }: Missing required fields (code, name, type, value)`
              );
            }
          });
          break;

        default:
          return res.status(400).json({
            success: false,
            error: "INVALID_IMPORT_TYPE",
            message: "Invalid import type. Supported: products, users, coupons",
            timestamp: new Date().toISOString(),
            requestId: uuidv4(),
          });
      }

      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          error: "VALIDATION_FAILED",
          message: "Data validation failed",
          details: validationErrors,
          timestamp: new Date().toISOString(),
          requestId: uuidv4(),
        });
      }

      // If validation only, return success
      if (validateOnly) {
        return res.status(200).json({
          success: true,
          message: "Data validation passed",
          data: {
            validRecords: data.length,
            validationErrors: [],
          },
          timestamp: new Date().toISOString(),
          requestId: uuidv4(),
        });
      }

      let result = {};

      switch (mode) {
        case "insert":
          // Insert new records only
          try {
            const insertedData = await Model.insertMany(data, {
              ordered: false,
            });
            result = {
              inserted: insertedData.length,
              updated: 0,
              errors: 0,
            };
          } catch (error) {
            if (error.name === "BulkWriteError") {
              result = {
                inserted: error.result.insertedCount || 0,
                updated: 0,
                errors: error.writeErrors?.length || 0,
                errorDetails: error.writeErrors?.map((err) => err.errmsg) || [],
              };
            } else {
              throw error;
            }
          }
          break;

        case "upsert":
          // Insert or update based on unique identifier
          let inserted = 0,
            updated = 0,
            errors = 0;
          const errorDetails = [];

          for (const item of data) {
            try {
              const identifier = item.id || item.email || item.code;
              const filter = item.id
                ? { id: item.id }
                : item.email
                ? { email: item.email }
                : { code: item.code };

              const result = await Model.updateOne(
                filter,
                { $set: item },
                { upsert: true }
              );

              if (result.upsertedCount > 0) {
                inserted++;
              } else if (result.modifiedCount > 0) {
                updated++;
              }
            } catch (error) {
              errors++;
              errorDetails.push(error.message);
            }
          }

          result = { inserted, updated, errors, errorDetails };
          break;

        case "replace":
          // Clear existing data and insert new
          await Model.deleteMany({});
          const insertedData = await Model.insertMany(data);
          result = {
            inserted: insertedData.length,
            updated: 0,
            errors: 0,
            note: "All existing records were replaced",
          };
          break;
      }

      res.status(200).json({
        success: true,
        message: "Data import completed",
        data: {
          importType: type,
          mode,
          totalRecords: data.length,
          result,
        },
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    } catch (error) {
      console.error("Data import error:", error);

      res.status(500).json({
        success: false,
        error: "IMPORT_FAILED",
        message: "Failed to import data",
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }
  }
);

// ===== ADVANCED FILTERING =====

// Advanced Product Search with Complex Filters
router.get("/search/products", async (req, res) => {
  try {
    const {
      q, // text search
      subjects,
      classes,
      types,
      authors,
      minPrice,
      maxPrice,
      minRating,
      maxRating,
      inStock,
      featured,
      tags,
      sortBy = "relevance",
      sortOrder = "desc",
      page = 1,
      limit = 20,
    } = req.query;

    // Build complex filter
    const filter = {};
    const textSearchFields = [];

    // Text search
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { author: { $regex: q, $options: "i" } },
        { tags: { $regex: q, $options: "i" } },
      ];
    }

    // Array filters
    if (subjects) {
      const subjectArray = Array.isArray(subjects)
        ? subjects
        : subjects.split(",");
      filter.subject = { $in: subjectArray };
    }

    if (classes) {
      const classArray = Array.isArray(classes)
        ? classes
        : classes.split(",").map(Number);
      filter.class = { $in: classArray };
    }

    if (types) {
      const typeArray = Array.isArray(types) ? types : types.split(",");
      filter.type = { $in: typeArray };
    }

    if (authors) {
      const authorArray = Array.isArray(authors) ? authors : authors.split(",");
      filter.author = { $in: authorArray };
    }

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(",");
      filter.tags = { $in: tagArray };
    }

    // Range filters
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    if (minRating || maxRating) {
      filter["rating.average"] = {};
      if (minRating) filter["rating.average"].$gte = parseFloat(minRating);
      if (maxRating) filter["rating.average"].$lte = parseFloat(maxRating);
    }

    // Boolean filters
    if (inStock !== undefined) {
      filter.inStock = inStock === "true";
    }

    if (featured) {
      filter.featured = featured;
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sort options
    let sortOptions = {};
    switch (sortBy) {
      case "price":
        sortOptions.price = sortOrder === "asc" ? 1 : -1;
        break;
      case "rating":
        sortOptions["rating.average"] = sortOrder === "asc" ? 1 : -1;
        break;
      case "popularity":
        sortOptions["rating.count"] = sortOrder === "asc" ? 1 : -1;
        break;
      case "newest":
        sortOptions.createdAt = -1;
        break;
      case "title":
        sortOptions.title = sortOrder === "asc" ? 1 : -1;
        break;
      default: // relevance
        if (q) {
          sortOptions = { score: { $meta: "textScore" } };
        } else {
          sortOptions.createdAt = -1;
        }
    }

    // Execute search with aggregation for better performance
    const pipeline = [
      { $match: filter },
      {
        $lookup: {
          from: "reviews",
          localField: "id",
          foreignField: "productId",
          as: "reviews",
        },
      },
      {
        $addFields: {
          reviewCount: { $size: "$reviews" },
          avgRating: { $avg: "$reviews.rating" },
        },
      },
      { $sort: sortOptions },
      { $skip: skip },
      { $limit: limitNum },
      {
        $project: {
          reviews: 0, // Exclude reviews array from final result
        },
      },
    ];

    const [products, totalItems] = await Promise.all([
      Product.aggregate(pipeline),
      Product.countDocuments(filter),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalItems / limitNum);

    // Get filter aggregations for faceted search
    const facets = await Product.aggregate([
      { $match: filter },
      {
        $facet: {
          subjects: [
            { $group: { _id: "$subject", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
          classes: [
            { $group: { _id: "$class", count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
          ],
          types: [
            { $group: { _id: "$type", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
          priceRanges: [
            {
              $bucket: {
                groupBy: "$price",
                boundaries: [0, 200, 400, 600, 800, 1000, Infinity],
                default: "Other",
                output: { count: { $sum: 1 } },
              },
            },
          ],
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems,
          itemsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPreviousPage: pageNum > 1,
        },
        facets: facets[0] || {},
        appliedFilters: {
          q,
          subjects,
          classes,
          types,
          authors,
          minPrice,
          maxPrice,
          minRating,
          maxRating,
          inStock,
          featured,
          tags,
        },
      },
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  } catch (error) {
    console.error("Advanced product search error:", error);

    res.status(500).json({
      success: false,
      error: "SEARCH_FAILED",
      message: "Failed to perform advanced product search",
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  }
});

// ===== BATCH PROCESSING =====

// Batch Job Status Tracking (In-memory for demo, use Redis/DB in production)
const batchJobs = new Map();

// Create Batch Job
router.post(
  "/batch/:operation",
  [
    body("data").isArray({ min: 1 }).withMessage("Data array is required"),
    handleValidationErrors,
  ],
  async (req, res) => {
    try {
      const { operation } = req.params;
      const { data, options = {} } = req.body;

      const jobId = `batch_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Initialize job status
      batchJobs.set(jobId, {
        id: jobId,
        operation,
        status: "queued",
        totalItems: data.length,
        processedItems: 0,
        successCount: 0,
        errorCount: 0,
        errors: [],
        startTime: new Date(),
        endTime: null,
        createdBy: req.user.id,
      });

      // Process batch job asynchronously
      processBatchJob(jobId, operation, data, options);

      res.status(202).json({
        success: true,
        message: "Batch job created and queued for processing",
        data: {
          jobId,
          operation,
          totalItems: data.length,
          status: "queued",
        },
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    } catch (error) {
      console.error("Create batch job error:", error);

      res.status(500).json({
        success: false,
        error: "BATCH_JOB_FAILED",
        message: "Failed to create batch job",
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }
  }
);

// Get Batch Job Status
router.get("/batch/:jobId", async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = batchJobs.get(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        error: "JOB_NOT_FOUND",
        message: "Batch job not found",
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }

    // Check if user can access this job
    if (job.createdBy !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "ACCESS_DENIED",
        message: "Access denied to this batch job",
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }

    res.status(200).json({
      success: true,
      data: {
        job,
      },
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  } catch (error) {
    console.error("Get batch job status error:", error);

    res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to get batch job status",
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  }
});

// Batch Job Processing Function
async function processBatchJob(jobId, operation, data, options) {
  const job = batchJobs.get(jobId);
  if (!job) return;

  try {
    job.status = "processing";
    job.startTime = new Date();

    for (let i = 0; i < data.length; i++) {
      const item = data[i];

      try {
        switch (operation) {
          case "update-products":
            await Product.updateOne({ id: item.id }, { $set: item.updates });
            break;

          case "send-notifications":
            await require("../models/Notification").createNotification({
              userId: item.userId,
              type: item.type || "system",
              title: item.title,
              message: item.message,
              ...item.options,
            });
            break;

          case "process-orders":
            await Order.updateOne(
              { id: item.orderId },
              { $set: { status: item.status, notes: item.notes } }
            );
            break;

          default:
            throw new Error(`Unknown batch operation: ${operation}`);
        }

        job.successCount++;
      } catch (error) {
        job.errorCount++;
        job.errors.push({
          item: i + 1,
          error: error.message,
          data: item,
        });
      }

      job.processedItems++;

      // Update progress every 10 items or at the end
      if (job.processedItems % 10 === 0 || job.processedItems === data.length) {
        batchJobs.set(jobId, job);
      }
    }

    job.status = "completed";
    job.endTime = new Date();
    batchJobs.set(jobId, job);

    console.log(
      `✅ Batch job ${jobId} completed: ${job.successCount} success, ${job.errorCount} errors`
    );
  } catch (error) {
    job.status = "failed";
    job.endTime = new Date();
    job.errors.push({
      item: "general",
      error: error.message,
    });
    batchJobs.set(jobId, job);

    console.error(`❌ Batch job ${jobId} failed:`, error);
  }
}

module.exports = router;
