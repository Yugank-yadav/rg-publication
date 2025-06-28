const express = require("express");
const User = require("../models/User");
const { authenticateToken } = require("../middleware/auth");
const { body } = require("express-validator");
const { handleValidationErrors } = require("../utils/validation");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");

const router = express.Router();

// Validation middleware for profile update
const validateProfileUpdate = [
  body("firstName")
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("First name must be between 1 and 50 characters"),
  body("lastName")
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Last name must be between 1 and 50 characters"),
  body("email")
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  body("phone")
    .optional()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage("Please provide a valid phone number"),
  body("dateOfBirth")
    .optional()
    .isISO8601()
    .withMessage("Please provide a valid date of birth"),
  body("preferences.subjects")
    .optional()
    .isArray()
    .withMessage("Subjects must be an array"),
  body("preferences.subjects.*")
    .optional()
    .isIn(["Mathematics", "Science", "English", "Social Science"])
    .withMessage("Invalid subject"),
  body("preferences.classes")
    .optional()
    .isArray()
    .withMessage("Classes must be an array"),
  body("preferences.classes.*")
    .optional()
    .isInt({ min: 5, max: 12 })
    .withMessage("Class must be between 5 and 12"),
  body("preferences.language")
    .optional()
    .isIn(["en", "hi"])
    .withMessage("Language must be en or hi"),
  body("preferences.notifications.email")
    .optional()
    .isBoolean()
    .withMessage("Email notification preference must be boolean"),
  body("preferences.notifications.sms")
    .optional()
    .isBoolean()
    .withMessage("SMS notification preference must be boolean"),
  body("preferences.notifications.push")
    .optional()
    .isBoolean()
    .withMessage("Push notification preference must be boolean"),
  handleValidationErrors,
];

// Validation middleware for password change
const validatePasswordChange = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "New password must contain at least one lowercase letter, one uppercase letter, and one number"
    ),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error("Password confirmation does not match new password");
    }
    return true;
  }),
  handleValidationErrors,
];

// Get User Profile
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ id: req.user.id });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "USER_NOT_FOUND",
        message: "User not found",
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }

    // Get user statistics
    const Order = require("../models/Order");
    const Wishlist = require("../models/Wishlist");
    const Review = require("../models/Review");

    const [orders, wishlist, reviews] = await Promise.all([
      Order.find({ userId: user.id }),
      Wishlist.findOne({ userId: user.id }),
      Review.find({ userId: user.id, status: "approved" }),
    ]);

    // Calculate statistics
    const totalSpent = orders.reduce(
      (sum, order) => sum + order.summary.total,
      0
    );
    const wishlistItems = wishlist ? wishlist.itemCount : 0;

    // Update user stats
    user.stats.totalOrders = orders.length;
    user.stats.totalSpent = totalSpent;
    user.stats.wishlistItems = wishlistItems;
    user.stats.reviewsWritten = reviews.length;
    await user.save();

    const userProfile = user.toJSON();

    res.status(200).json({
      success: true,
      data: {
        user: userProfile,
      },
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  } catch (error) {
    console.error("Get user profile error:", error);

    res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to fetch user profile",
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  }
});

// Update User Profile
router.put(
  "/profile",
  authenticateToken,
  validateProfileUpdate,
  async (req, res) => {
    try {
      const { firstName, lastName, email, phone, dateOfBirth, preferences } =
        req.body;

      const user = await User.findOne({ id: req.user.id });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: "USER_NOT_FOUND",
          message: "User not found",
          timestamp: new Date().toISOString(),
          requestId: uuidv4(),
        });
      }

      // Check if email is being changed and if it's already taken
      if (email && email !== user.email) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(400).json({
            success: false,
            error: "VALIDATION_ERROR",
            message: "Invalid input data",
            details: [
              {
                field: "email",
                message: "Email already exists",
              },
            ],
            timestamp: new Date().toISOString(),
            requestId: uuidv4(),
          });
        }
      }

      // Update user fields
      if (firstName !== undefined) user.firstName = firstName;
      if (lastName !== undefined) user.lastName = lastName;
      if (email !== undefined) {
        user.email = email;
        user.isEmailVerified = false; // Reset email verification
      }
      if (phone !== undefined) user.phone = phone;
      if (dateOfBirth !== undefined) user.dateOfBirth = new Date(dateOfBirth);

      // Update preferences
      if (preferences) {
        if (preferences.subjects !== undefined)
          user.preferences.subjects = preferences.subjects;
        if (preferences.classes !== undefined)
          user.preferences.classes = preferences.classes;
        if (preferences.language !== undefined)
          user.preferences.language = preferences.language;

        if (preferences.notifications) {
          if (preferences.notifications.email !== undefined) {
            user.preferences.notifications.email =
              preferences.notifications.email;
          }
          if (preferences.notifications.sms !== undefined) {
            user.preferences.notifications.sms = preferences.notifications.sms;
          }
          if (preferences.notifications.push !== undefined) {
            user.preferences.notifications.push =
              preferences.notifications.push;
          }
        }
      }

      await user.save();

      const updatedUser = user.toJSON();

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: {
          user: updatedUser,
        },
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    } catch (error) {
      console.error("Update user profile error:", error);

      if (error.name === "ValidationError") {
        const details = Object.values(error.errors).map((err) => ({
          field: err.path,
          message: err.message,
        }));

        return res.status(422).json({
          success: false,
          error: "VALIDATION_ERROR",
          message: "Invalid input data",
          details,
          timestamp: new Date().toISOString(),
          requestId: uuidv4(),
        });
      }

      res.status(500).json({
        success: false,
        error: "INTERNAL_SERVER_ERROR",
        message: "Failed to update user profile",
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }
  }
);

// Change Password
router.put(
  "/password",
  authenticateToken,
  validatePasswordChange,
  async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      const user = await User.findOne({ id: req.user.id }).select("+password");

      if (!user) {
        return res.status(404).json({
          success: false,
          error: "USER_NOT_FOUND",
          message: "User not found",
          timestamp: new Date().toISOString(),
          requestId: uuidv4(),
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(
        currentPassword
      );
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          error: "INVALID_CURRENT_PASSWORD",
          message: "Current password is incorrect",
          timestamp: new Date().toISOString(),
          requestId: uuidv4(),
        });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      res.status(200).json({
        success: true,
        message: "Password changed successfully",
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    } catch (error) {
      console.error("Change password error:", error);

      res.status(500).json({
        success: false,
        error: "INTERNAL_SERVER_ERROR",
        message: "Failed to change password",
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }
  }
);

// Address Management APIs

const Address = require("../models/Address");

// Validation middleware for address
const validateAddress = [
  body("type")
    .optional()
    .isIn(["home", "work", "other"])
    .withMessage("Address type must be home, work, or other"),
  body("firstName")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("First name must be between 1 and 50 characters"),
  body("lastName")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Last name must be between 1 and 50 characters"),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Please provide a valid email address"),
  body("phone")
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage("Please provide a valid phone number"),
  body("addressLine1")
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage("Address line 1 is required and cannot exceed 255 characters"),
  body("addressLine2")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Address line 2 cannot exceed 255 characters"),
  body("landmark")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Landmark cannot exceed 100 characters"),
  body("city")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("City is required and cannot exceed 100 characters"),
  body("state")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("State is required and cannot exceed 100 characters"),
  body("postalCode")
    .matches(/^\d{6}$/)
    .withMessage("Please enter a valid 6-digit postal code"),
  body("country")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Country cannot exceed 100 characters"),
  body("isDefault")
    .optional()
    .isBoolean()
    .withMessage("isDefault must be a boolean"),
  body("deliveryInstructions")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Delivery instructions cannot exceed 500 characters"),
  handleValidationErrors,
];

// Get User Addresses
router.get("/addresses", authenticateToken, async (req, res) => {
  try {
    const addresses = await Address.find({ userId: req.user.id }).sort({
      isDefault: -1,
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      data: {
        addresses,
      },
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  } catch (error) {
    console.error("Get addresses error:", error);

    res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to fetch addresses",
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  }
});

// Add New Address
router.post(
  "/addresses",
  authenticateToken,
  validateAddress,
  async (req, res) => {
    try {
      const addressData = {
        ...req.body,
        userId: req.user.id,
      };

      const address = new Address(addressData);
      await address.save();

      res.status(201).json({
        success: true,
        message: "Address added successfully",
        data: {
          address: address.toJSON(),
        },
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    } catch (error) {
      console.error("Add address error:", error);

      if (error.name === "ValidationError") {
        const details = Object.values(error.errors).map((err) => ({
          field: err.path,
          message: err.message,
        }));

        return res.status(422).json({
          success: false,
          error: "VALIDATION_ERROR",
          message: "Invalid address data",
          details,
          timestamp: new Date().toISOString(),
          requestId: uuidv4(),
        });
      }

      res.status(500).json({
        success: false,
        error: "INTERNAL_SERVER_ERROR",
        message: "Failed to add address",
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }
  }
);

// Update Address
router.put(
  "/addresses/:addressId",
  authenticateToken,
  validateAddress,
  async (req, res) => {
    try {
      const { addressId } = req.params;

      const address = await Address.findOne({
        id: addressId,
        userId: req.user.id,
      });

      if (!address) {
        return res.status(404).json({
          success: false,
          error: "ADDRESS_NOT_FOUND",
          message: "Address not found",
          timestamp: new Date().toISOString(),
          requestId: uuidv4(),
        });
      }

      // Update address fields
      Object.keys(req.body).forEach((key) => {
        if (req.body[key] !== undefined) {
          address[key] = req.body[key];
        }
      });

      await address.save();

      res.status(200).json({
        success: true,
        message: "Address updated successfully",
        data: {
          address: address.toJSON(),
        },
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    } catch (error) {
      console.error("Update address error:", error);

      if (error.name === "ValidationError") {
        const details = Object.values(error.errors).map((err) => ({
          field: err.path,
          message: err.message,
        }));

        return res.status(422).json({
          success: false,
          error: "VALIDATION_ERROR",
          message: "Invalid address data",
          details,
          timestamp: new Date().toISOString(),
          requestId: uuidv4(),
        });
      }

      res.status(500).json({
        success: false,
        error: "INTERNAL_SERVER_ERROR",
        message: "Failed to update address",
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }
  }
);

// Delete Address
router.delete("/addresses/:addressId", authenticateToken, async (req, res) => {
  try {
    const { addressId } = req.params;

    const address = await Address.findOne({
      id: addressId,
      userId: req.user.id,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        error: "ADDRESS_NOT_FOUND",
        message: "Address not found",
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }

    // If deleting default address, set another address as default
    if (address.isDefault) {
      const otherAddress = await Address.findOne({
        userId: req.user.id,
        id: { $ne: addressId },
      });

      if (otherAddress) {
        otherAddress.isDefault = true;
        await otherAddress.save();
      }
    }

    await Address.deleteOne({ id: addressId, userId: req.user.id });

    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  } catch (error) {
    console.error("Delete address error:", error);

    res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to delete address",
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  }
});

module.exports = router;
