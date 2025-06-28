const express = require("express");
const Notification = require("../models/Notification");
const User = require("../models/User");
const { authenticateToken, requireAdmin } = require("../middleware/auth");
const { body, param, query } = require("express-validator");
const { handleValidationErrors } = require("../utils/validation");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();

// Validation middleware
const validateNotification = [
  body("type")
    .isIn(["order", "product", "promotion", "system", "review", "wishlist"])
    .withMessage("Invalid notification type"),
  body("title")
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage("Title must be between 1 and 200 characters"),
  body("message")
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage("Message must be between 1 and 1000 characters"),
  body("priority")
    .optional()
    .isIn(["low", "medium", "high", "urgent"])
    .withMessage("Invalid priority level"),
  body("channels.email.enabled")
    .optional()
    .isBoolean()
    .withMessage("Email enabled must be boolean"),
  body("channels.push.enabled")
    .optional()
    .isBoolean()
    .withMessage("Push enabled must be boolean"),
  handleValidationErrors,
];

// Get User Notifications
router.get("/", authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      read,
      priority,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter
    const filter = { userId: req.user.id };
    if (type) filter.type = type;
    if (read !== undefined) filter["channels.inApp.read"] = read === "true";
    if (priority) filter.priority = priority;

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Execute query
    const [notifications, totalItems, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Notification.countDocuments(filter),
      Notification.countDocuments({
        userId: req.user.id,
        "channels.inApp.read": false,
      }),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalItems / limitNum);

    res.status(200).json({
      success: true,
      data: {
        notifications,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems,
          itemsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPreviousPage: pageNum > 1,
        },
        unreadCount,
      },
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  } catch (error) {
    console.error("Get notifications error:", error);

    res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to fetch notifications",
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  }
});

// Mark Notification as Read
router.put("/:notificationId/read", authenticateToken, async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findOne({
      id: notificationId,
      userId: req.user.id,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: "NOTIFICATION_NOT_FOUND",
        message: "Notification not found",
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }

    await notification.markAsRead();

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: {
        notification: notification.toJSON(),
      },
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  } catch (error) {
    console.error("Mark notification read error:", error);

    res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to mark notification as read",
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  }
});

// Mark All Notifications as Read
router.put("/read-all", authenticateToken, async (req, res) => {
  try {
    const result = await Notification.updateMany(
      {
        userId: req.user.id,
        "channels.inApp.read": false,
      },
      {
        "channels.inApp.read": true,
        "channels.inApp.readAt": new Date(),
      }
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      data: {
        updatedCount: result.modifiedCount,
      },
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  } catch (error) {
    console.error("Mark all notifications read error:", error);

    res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to mark all notifications as read",
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  }
});

// Delete Notification
router.delete("/:notificationId", authenticateToken, async (req, res) => {
  try {
    const { notificationId } = req.params;

    const result = await Notification.deleteOne({
      id: notificationId,
      userId: req.user.id,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: "NOTIFICATION_NOT_FOUND",
        message: "Notification not found",
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  } catch (error) {
    console.error("Delete notification error:", error);

    res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to delete notification",
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  }
});

// Get Notification Preferences
router.get("/preferences", authenticateToken, async (req, res) => {
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

    const preferences = user.preferences.notifications || {
      email: true,
      sms: false,
      push: true,
    };

    res.status(200).json({
      success: true,
      data: {
        preferences,
      },
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  } catch (error) {
    console.error("Get notification preferences error:", error);

    res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to fetch notification preferences",
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  }
});

// Update Notification Preferences
router.put(
  "/preferences",
  authenticateToken,
  [
    body("email")
      .optional()
      .isBoolean()
      .withMessage("Email preference must be boolean"),
    body("sms")
      .optional()
      .isBoolean()
      .withMessage("SMS preference must be boolean"),
    body("push")
      .optional()
      .isBoolean()
      .withMessage("Push preference must be boolean"),
    handleValidationErrors,
  ],
  async (req, res) => {
    try {
      const { email, sms, push } = req.body;

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

      // Update preferences
      if (email !== undefined) user.preferences.notifications.email = email;
      if (sms !== undefined) user.preferences.notifications.sms = sms;
      if (push !== undefined) user.preferences.notifications.push = push;

      await user.save();

      res.status(200).json({
        success: true,
        message: "Notification preferences updated successfully",
        data: {
          preferences: user.preferences.notifications,
        },
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    } catch (error) {
      console.error("Update notification preferences error:", error);

      res.status(500).json({
        success: false,
        error: "INTERNAL_SERVER_ERROR",
        message: "Failed to update notification preferences",
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }
  }
);

// ===== ADMIN NOTIFICATION MANAGEMENT =====

// Send Notification to User(s) (Admin only)
router.post(
  "/send",
  authenticateToken,
  requireAdmin,
  validateNotification,
  async (req, res) => {
    try {
      const {
        userIds,
        type,
        title,
        message,
        data = {},
        channels = {
          email: { enabled: false },
          push: { enabled: false },
          inApp: { enabled: true },
        },
        priority = "medium",
        scheduledFor,
        expiresAt,
        actionUrl,
        actionText,
        metadata = {},
      } = req.body;

      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({
          success: false,
          error: "INVALID_USER_IDS",
          message: "Please provide valid user IDs array",
          timestamp: new Date().toISOString(),
          requestId: uuidv4(),
        });
      }

      // Validate users exist
      const users = await User.find({ id: { $in: userIds } });
      if (users.length !== userIds.length) {
        return res.status(400).json({
          success: false,
          error: "INVALID_USERS",
          message: "One or more users not found",
          timestamp: new Date().toISOString(),
          requestId: uuidv4(),
        });
      }

      // Create notifications for each user
      const notifications = [];
      for (const userId of userIds) {
        const notification = await Notification.createNotification({
          userId,
          type,
          title,
          message,
          data,
          channels,
          priority,
          scheduledFor: scheduledFor ? new Date(scheduledFor) : new Date(),
          expiresAt: expiresAt ? new Date(expiresAt) : undefined,
          actionUrl,
          actionText,
          metadata: {
            ...metadata,
            sentBy: req.user.id,
            source: "admin",
          },
        });
        notifications.push(notification);
      }

      res.status(201).json({
        success: true,
        message: `Notifications sent to ${notifications.length} users`,
        data: {
          notificationCount: notifications.length,
          notifications: notifications.map((n) => n.toJSON()),
        },
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    } catch (error) {
      console.error("Send notification error:", error);

      res.status(500).json({
        success: false,
        error: "INTERNAL_SERVER_ERROR",
        message: "Failed to send notifications",
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }
  }
);

// Broadcast Notification to All Users (Admin only)
router.post(
  "/broadcast",
  authenticateToken,
  requireAdmin,
  validateNotification,
  async (req, res) => {
    try {
      const {
        type,
        title,
        message,
        data = {},
        channels = {
          email: { enabled: false },
          push: { enabled: false },
          inApp: { enabled: true },
        },
        priority = "medium",
        scheduledFor,
        expiresAt,
        actionUrl,
        actionText,
        metadata = {},
        userFilter = {},
      } = req.body;

      // Get all users based on filter
      const users = await User.find(userFilter).select("id");

      if (users.length === 0) {
        return res.status(400).json({
          success: false,
          error: "NO_USERS_FOUND",
          message: "No users found matching the filter criteria",
          timestamp: new Date().toISOString(),
          requestId: uuidv4(),
        });
      }

      // Create notifications for all users
      const notifications = [];
      for (const user of users) {
        const notification = await Notification.createNotification({
          userId: user.id,
          type,
          title,
          message,
          data,
          channels,
          priority,
          scheduledFor: scheduledFor ? new Date(scheduledFor) : new Date(),
          expiresAt: expiresAt ? new Date(expiresAt) : undefined,
          actionUrl,
          actionText,
          metadata: {
            ...metadata,
            sentBy: req.user.id,
            source: "broadcast",
          },
        });
        notifications.push(notification);
      }

      res.status(201).json({
        success: true,
        message: `Broadcast notification sent to ${notifications.length} users`,
        data: {
          notificationCount: notifications.length,
          userCount: users.length,
        },
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    } catch (error) {
      console.error("Broadcast notification error:", error);

      res.status(500).json({
        success: false,
        error: "INTERNAL_SERVER_ERROR",
        message: "Failed to broadcast notification",
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }
  }
);

// Get Notification Analytics (Admin only)
router.get("/analytics", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Calculate date range
    const now = new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate ? new Date(endDate) : now;

    // Get notification statistics
    const [
      totalNotifications,
      notificationsByType,
      notificationsByChannel,
      deliveryStats,
      readStats,
    ] = await Promise.all([
      Notification.countDocuments({ createdAt: { $gte: start, $lte: end } }),

      Notification.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        { $group: { _id: "$type", count: { $sum: 1 } } },
      ]),

      Notification.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        {
          $group: {
            _id: null,
            emailEnabled: {
              $sum: { $cond: ["$channels.email.enabled", 1, 0] },
            },
            pushEnabled: { $sum: { $cond: ["$channels.push.enabled", 1, 0] } },
            inAppEnabled: {
              $sum: { $cond: ["$channels.inApp.enabled", 1, 0] },
            },
          },
        },
      ]),

      Notification.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        {
          $group: {
            _id: null,
            emailSent: { $sum: { $cond: ["$channels.email.sent", 1, 0] } },
            pushSent: { $sum: { $cond: ["$channels.push.sent", 1, 0] } },
            emailFailed: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      "$channels.email.enabled",
                      { $not: "$channels.email.sent" },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            pushFailed: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      "$channels.push.enabled",
                      { $not: "$channels.push.sent" },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),

      Notification.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        {
          $group: {
            _id: null,
            totalRead: { $sum: { $cond: ["$channels.inApp.read", 1, 0] } },
            totalUnread: {
              $sum: { $cond: [{ $not: "$channels.inApp.read" }, 1, 0] },
            },
          },
        },
      ]),
    ]);

    const analytics = {
      period: { startDate: start, endDate: end },
      overview: {
        totalNotifications,
        readRate: readStats[0]
          ? ((readStats[0].totalRead / totalNotifications) * 100).toFixed(2)
          : 0,
      },
      byType: notificationsByType.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      channels: notificationsByChannel[0] || {
        emailEnabled: 0,
        pushEnabled: 0,
        inAppEnabled: 0,
      },
      delivery: deliveryStats[0] || {
        emailSent: 0,
        pushSent: 0,
        emailFailed: 0,
        pushFailed: 0,
      },
      engagement: readStats[0] || { totalRead: 0, totalUnread: 0 },
    };

    res.status(200).json({
      success: true,
      data: {
        analytics,
      },
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  } catch (error) {
    console.error("Notification analytics error:", error);

    res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to fetch notification analytics",
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  }
});

module.exports = router;
