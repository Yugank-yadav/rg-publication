const express = require("express");
const Review = require("../models/Review");
const Product = require("../models/Product");
const Order = require("../models/Order");
const { authenticateToken, optionalAuth } = require("../middleware/auth");
const { body, param, query } = require("express-validator");
const { handleValidationErrors } = require("../utils/validation");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();

// Validation middleware for reviews
const validateReview = [
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  body("title")
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage("Review title must be between 1 and 200 characters"),
  body("comment")
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage("Review comment must be between 1 and 2000 characters"),
  body("pros").optional().isArray().withMessage("Pros must be an array"),
  body("pros.*")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Each pro cannot exceed 100 characters"),
  body("cons").optional().isArray().withMessage("Cons must be an array"),
  body("cons.*")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Each con cannot exceed 100 characters"),
  body("orderId")
    .optional()
    .matches(/^ord_[a-zA-Z0-9]+$/)
    .withMessage("Invalid order ID format"),
  handleValidationErrors,
];

const validateProductId = [
  param("productId")
    .matches(/^prod_[a-zA-Z0-9]+$/)
    .withMessage("Invalid product ID format"),
  handleValidationErrors,
];

const validateReviewId = [
  param("reviewId")
    .matches(/^review_[a-zA-Z0-9]+$/)
    .withMessage("Invalid review ID format"),
  handleValidationErrors,
];

// Get Product Reviews
router.get(
  "/products/:productId/reviews",
  validateProductId,
  optionalAuth,
  async (req, res) => {
    try {
      const { productId } = req.params;
      const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
        rating,
        verified,
      } = req.query;

      // Check if product exists
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

      // Build filter
      const filter = {
        productId,
        status: "approved",
      };

      if (rating) filter.rating = parseInt(rating);
      if (verified !== undefined) filter.verified = verified === "true";

      // Pagination
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      // Sort options
      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

      // Execute query
      const [reviews, totalItems] = await Promise.all([
        Review.find(filter)
          .populate("userId", "firstName lastName avatar")
          .sort(sortOptions)
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Review.countDocuments(filter),
      ]);

      // Calculate pagination info
      const totalPages = Math.ceil(totalItems / limitNum);

      // Get rating distribution
      const ratingDistribution = await Review.aggregate([
        { $match: { productId, status: "approved" } },
        { $group: { _id: "$rating", count: { $sum: 1 } } },
        { $sort: { _id: -1 } },
      ]);

      const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      ratingDistribution.forEach((item) => {
        distribution[item._id] = item.count;
      });

      // Transform reviews to include user info
      const transformedReviews = reviews.map((review) => ({
        ...review,
        user: {
          name: review.userId
            ? `${review.userId.firstName} ${review.userId.lastName}`
            : "Anonymous",
          avatar: review.userId?.avatar || null,
        },
      }));

      res.status(200).json({
        success: true,
        data: {
          reviews: transformedReviews,
          pagination: {
            currentPage: pageNum,
            totalPages,
            totalItems,
            itemsPerPage: limitNum,
            hasNextPage: pageNum < totalPages,
            hasPreviousPage: pageNum > 1,
          },
          summary: {
            averageRating: product.rating.average,
            totalReviews: product.rating.count,
            ratingDistribution: distribution,
          },
        },
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    } catch (error) {
      console.error("Get product reviews error:", error);

      res.status(500).json({
        success: false,
        error: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch product reviews",
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }
  }
);

// Add Product Review
router.post(
  "/products/:productId/reviews",
  authenticateToken,
  validateProductId,
  validateReview,
  async (req, res) => {
    try {
      const { productId } = req.params;
      const { rating, title, comment, pros, cons, orderId } = req.body;

      // Check if product exists
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

      // Check if user has already reviewed this product
      const existingReview = await Review.findOne({
        productId,
        userId: req.user.id,
      });

      if (existingReview) {
        return res.status(400).json({
          success: false,
          error: "REVIEW_ALREADY_EXISTS",
          message: "You have already reviewed this product",
          timestamp: new Date().toISOString(),
          requestId: uuidv4(),
        });
      }

      // Verify order if provided
      let verified = false;
      if (orderId) {
        const order = await Order.findOne({
          id: orderId,
          userId: req.user.id,
          status: "delivered",
        });

        if (order) {
          const orderItem = order.items.find(
            (item) => item.productId === productId
          );
          if (orderItem) {
            verified = true;
          }
        }
      }

      // Create review
      const review = new Review({
        productId,
        userId: req.user.id,
        orderId,
        rating,
        title,
        comment,
        pros: pros || [],
        cons: cons || [],
        verified,
        status: "approved", // Auto-approve for now, can be changed to 'pending' for moderation
      });

      await review.save();

      // Populate user info for response
      await review.populate("userId", "firstName lastName avatar");

      const reviewResponse = {
        ...review.toJSON(),
        user: {
          name: `${review.userId.firstName} ${review.userId.lastName}`,
          avatar: review.userId.avatar || null,
        },
      };

      res.status(201).json({
        success: true,
        message: "Review added successfully",
        data: {
          review: reviewResponse,
        },
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    } catch (error) {
      console.error("Add product review error:", error);

      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          error: "REVIEW_ALREADY_EXISTS",
          message: "You have already reviewed this product",
          timestamp: new Date().toISOString(),
          requestId: uuidv4(),
        });
      }

      if (error.name === "ValidationError") {
        const details = Object.values(error.errors).map((err) => ({
          field: err.path,
          message: err.message,
        }));

        return res.status(422).json({
          success: false,
          error: "VALIDATION_ERROR",
          message: "Invalid review data",
          details,
          timestamp: new Date().toISOString(),
          requestId: uuidv4(),
        });
      }

      res.status(500).json({
        success: false,
        error: "INTERNAL_SERVER_ERROR",
        message: "Failed to add review",
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }
  }
);

// Update Review
router.put(
  "/:reviewId",
  authenticateToken,
  validateReviewId,
  validateReview,
  async (req, res) => {
    try {
      const { reviewId } = req.params;
      const { rating, title, comment, pros, cons } = req.body;

      const review = await Review.findOne({
        id: reviewId,
        userId: req.user.id,
      });

      if (!review) {
        return res.status(404).json({
          success: false,
          error: "REVIEW_NOT_FOUND",
          message: "Review not found or you do not have permission to edit it",
          timestamp: new Date().toISOString(),
          requestId: uuidv4(),
        });
      }

      // Update review fields
      review.rating = rating;
      review.title = title;
      review.comment = comment;
      review.pros = pros || [];
      review.cons = cons || [];
      review.status = "approved"; // Reset to approved after edit

      await review.save();

      // Populate user info for response
      await review.populate("userId", "firstName lastName avatar");

      const reviewResponse = {
        ...review.toJSON(),
        user: {
          name: `${review.userId.firstName} ${review.userId.lastName}`,
          avatar: review.userId.avatar || null,
        },
      };

      res.status(200).json({
        success: true,
        message: "Review updated successfully",
        data: {
          review: reviewResponse,
        },
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    } catch (error) {
      console.error("Update review error:", error);

      if (error.name === "ValidationError") {
        const details = Object.values(error.errors).map((err) => ({
          field: err.path,
          message: err.message,
        }));

        return res.status(422).json({
          success: false,
          error: "VALIDATION_ERROR",
          message: "Invalid review data",
          details,
          timestamp: new Date().toISOString(),
          requestId: uuidv4(),
        });
      }

      res.status(500).json({
        success: false,
        error: "INTERNAL_SERVER_ERROR",
        message: "Failed to update review",
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }
  }
);

// Delete Review
router.delete(
  "/:reviewId",
  authenticateToken,
  validateReviewId,
  async (req, res) => {
    try {
      const { reviewId } = req.params;

      const review = await Review.findOne({
        id: reviewId,
        userId: req.user.id,
      });

      if (!review) {
        return res.status(404).json({
          success: false,
          error: "REVIEW_NOT_FOUND",
          message:
            "Review not found or you do not have permission to delete it",
          timestamp: new Date().toISOString(),
          requestId: uuidv4(),
        });
      }

      await Review.deleteOne({ id: reviewId, userId: req.user.id });

      res.status(200).json({
        success: true,
        message: "Review deleted successfully",
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    } catch (error) {
      console.error("Delete review error:", error);

      res.status(500).json({
        success: false,
        error: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete review",
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }
  }
);

// Mark Review as Helpful
router.post(
  "/:reviewId/helpful",
  authenticateToken,
  validateReviewId,
  async (req, res) => {
    try {
      const { reviewId } = req.params;

      const review = await Review.findOne({ id: reviewId });

      if (!review) {
        return res.status(404).json({
          success: false,
          error: "REVIEW_NOT_FOUND",
          message: "Review not found",
          timestamp: new Date().toISOString(),
          requestId: uuidv4(),
        });
      }

      try {
        await review.markHelpful(req.user.id);
      } catch (helpfulError) {
        return res.status(400).json({
          success: false,
          error: "ALREADY_MARKED_HELPFUL",
          message: helpfulError.message,
          timestamp: new Date().toISOString(),
          requestId: uuidv4(),
        });
      }

      res.status(200).json({
        success: true,
        message: "Review marked as helpful",
        data: {
          helpfulCount: review.helpful.count,
        },
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    } catch (error) {
      console.error("Mark review helpful error:", error);

      res.status(500).json({
        success: false,
        error: "INTERNAL_SERVER_ERROR",
        message: "Failed to mark review as helpful",
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }
  }
);

module.exports = router;
