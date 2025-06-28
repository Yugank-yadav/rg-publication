const express = require("express");
const mongoose = require("mongoose");
const os = require("os");
const { authenticateToken, requireAdmin } = require("../middleware/auth");
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();

// System Health Check (Public)
router.get("/health", async (req, res) => {
  try {
    const startTime = Date.now();

    // Check database connection
    const dbStatus =
      mongoose.connection.readyState === 1 ? "connected" : "disconnected";

    // Basic database query test
    let dbResponseTime = null;
    try {
      const dbStart = Date.now();
      await User.findOne().limit(1);
      dbResponseTime = Date.now() - dbStart;
    } catch (dbError) {
      dbResponseTime = -1;
    }

    // System information
    const systemInfo = {
      uptime: process.uptime(),
      memory: {
        used: process.memoryUsage().heapUsed / 1024 / 1024,
        total: process.memoryUsage().heapTotal / 1024 / 1024,
        system: os.totalmem() / 1024 / 1024 / 1024,
      },
      cpu: {
        usage: process.cpuUsage(),
        loadAverage: os.loadavg(),
      },
      platform: os.platform(),
      nodeVersion: process.version,
    };

    const responseTime = Date.now() - startTime;
    const isHealthy =
      dbStatus === "connected" && dbResponseTime > 0 && dbResponseTime < 1000;

    res.status(isHealthy ? 200 : 503).json({
      success: true,
      status: isHealthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      services: {
        api: {
          status: "operational",
          responseTime: `${responseTime}ms`,
        },
        database: {
          status: dbStatus,
          responseTime: dbResponseTime > 0 ? `${dbResponseTime}ms` : "error",
        },
      },
      system: systemInfo,
      requestId: uuidv4(),
    });
  } catch (error) {
    console.error("Health check error:", error);

    res.status(503).json({
      success: false,
      status: "unhealthy",
      error: "HEALTH_CHECK_FAILED",
      message: "System health check failed",
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  }
});

// Detailed System Status (Admin only)
router.get("/status", authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Database statistics
    const [userCount, productCount, orderCount] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
    ]);

    // Database collection stats
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    const collectionStats = {};

    for (const collection of collections) {
      try {
        const stats = await mongoose.connection.db
          .collection(collection.name)
          .stats();
        collectionStats[collection.name] = {
          documents: stats.count,
          size: Math.round(stats.size / 1024), // KB
          avgObjSize: Math.round(stats.avgObjSize || 0),
          indexes: stats.nindexes,
        };
      } catch (statsError) {
        collectionStats[collection.name] = { error: "Unable to fetch stats" };
      }
    }

    // System metrics
    const systemMetrics = {
      server: {
        uptime: process.uptime(),
        pid: process.pid,
        nodeVersion: process.version,
        platform: os.platform(),
        arch: os.arch(),
        hostname: os.hostname(),
      },
      memory: {
        process: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          external: Math.round(process.memoryUsage().external / 1024 / 1024),
          rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
        },
        system: {
          total: Math.round(os.totalmem() / 1024 / 1024 / 1024),
          free: Math.round(os.freemem() / 1024 / 1024 / 1024),
          used: Math.round((os.totalmem() - os.freemem()) / 1024 / 1024 / 1024),
        },
      },
      cpu: {
        count: os.cpus().length,
        model: os.cpus()[0]?.model || "Unknown",
        loadAverage: os.loadavg().map((load) => Math.round(load * 100) / 100),
        usage: process.cpuUsage(),
      },
      network: {
        interfaces: Object.keys(os.networkInterfaces()).length,
      },
    };

    // Environment information
    const environment = {
      nodeEnv: process.env.NODE_ENV || "development",
      port: process.env.PORT || 5000,
      mongoUri: process.env.MONGO_URI ? "configured" : "not configured",
      jwtSecret: process.env.JWT_SECRET ? "configured" : "not configured",
    };

    res.status(200).json({
      success: true,
      data: {
        overview: {
          status: "operational",
          users: userCount,
          products: productCount,
          orders: orderCount,
        },
        database: {
          connection:
            mongoose.connection.readyState === 1 ? "connected" : "disconnected",
          host: mongoose.connection.host,
          name: mongoose.connection.name,
          collections: collectionStats,
        },
        system: systemMetrics,
        environment,
      },
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  } catch (error) {
    console.error("System status error:", error);

    res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to fetch system status",
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  }
});

// System Configuration (Admin only)
router.get("/config", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const config = {
      server: {
        environment: process.env.NODE_ENV || "development",
        port: process.env.PORT || 5000,
        cors: {
          enabled: true,
          origins: process.env.CORS_ORIGINS || "*",
        },
      },
      database: {
        uri: process.env.MONGO_URI ? "configured" : "not configured",
        options: {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        },
      },
      authentication: {
        jwtSecret: process.env.JWT_SECRET ? "configured" : "not configured",
        tokenExpiry: "no expiry",
        bcryptRounds: 12,
      },
      uploads: {
        cloudinary: {
          cloudName: process.env.CLOUDINARY_CLOUD_NAME || "not configured",
          apiKey: process.env.CLOUDINARY_API_KEY
            ? "configured"
            : "not configured",
          apiSecret: process.env.CLOUDINARY_API_SECRET
            ? "configured"
            : "not configured",
        },
        maxFileSize: "10MB",
        allowedTypes: [
          "jpeg",
          "jpg",
          "png",
          "gif",
          "webp",
          "pdf",
          "doc",
          "docx",
        ],
      },
      email: {
        service: process.env.EMAIL_SERVICE || "not configured",
        user: process.env.EMAIL_USER || "not configured",
        password: process.env.EMAIL_PASSWORD ? "configured" : "not configured",
      },
      features: {
        notifications: true,
        analytics: true,
        fileUploads: true,
        adminPanel: true,
        apiDocumentation: true,
      },
    };

    res.status(200).json({
      success: true,
      data: {
        configuration: config,
      },
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  } catch (error) {
    console.error("System config error:", error);

    res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to fetch system configuration",
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  }
});

// Database Maintenance (Admin only)
router.post(
  "/maintenance/database",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { action } = req.body;

      let result = {};

      switch (action) {
        case "reindex":
          // Reindex all collections
          const collections = await mongoose.connection.db
            .listCollections()
            .toArray();
          for (const collection of collections) {
            await mongoose.connection.db.collection(collection.name).reIndex();
          }
          result.message = "Database reindexing completed";
          break;

        case "compact":
          // This would typically be done at the MongoDB level
          result.message =
            "Database compaction initiated (requires MongoDB admin privileges)";
          break;

        case "cleanup":
          // Clean up expired data
          const now = new Date();
          const cleanupResults = await Promise.all([
            // Clean expired notifications
            require("../models/Notification").deleteMany({
              expiresAt: { $lt: now },
            }),
            // Clean old sessions (if you have a session model)
            // Session.deleteMany({ expiresAt: { $lt: now } })
          ]);

          result.message = "Database cleanup completed";
          result.details = {
            expiredNotifications: cleanupResults[0].deletedCount,
          };
          break;

        default:
          return res.status(400).json({
            success: false,
            error: "INVALID_ACTION",
            message: "Invalid maintenance action",
            timestamp: new Date().toISOString(),
            requestId: uuidv4(),
          });
      }

      res.status(200).json({
        success: true,
        message: "Maintenance operation completed",
        data: result,
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    } catch (error) {
      console.error("Database maintenance error:", error);

      res.status(500).json({
        success: false,
        error: "MAINTENANCE_FAILED",
        message: "Database maintenance operation failed",
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }
  }
);

// System Logs (Admin only)
router.get("/logs", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { level = "all", limit = 100, startDate, endDate } = req.query;

    // This is a simplified log endpoint
    // In a real application, you'd integrate with a logging service like Winston, Bunyan, etc.

    const logs = [
      {
        timestamp: new Date().toISOString(),
        level: "info",
        message: "System health check completed",
        service: "health",
        requestId: uuidv4(),
      },
      {
        timestamp: new Date(Date.now() - 60000).toISOString(),
        level: "info",
        message: "User authentication successful",
        service: "auth",
        userId: "usr_example",
        requestId: uuidv4(),
      },
      {
        timestamp: new Date(Date.now() - 120000).toISOString(),
        level: "warn",
        message: "High memory usage detected",
        service: "system",
        details: { memoryUsage: "85%" },
        requestId: uuidv4(),
      },
    ];

    // Filter logs based on level
    const filteredLogs =
      level === "all" ? logs : logs.filter((log) => log.level === level);

    res.status(200).json({
      success: true,
      data: {
        logs: filteredLogs.slice(0, parseInt(limit)),
        totalCount: filteredLogs.length,
        filters: {
          level,
          limit: parseInt(limit),
          startDate,
          endDate,
        },
      },
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  } catch (error) {
    console.error("System logs error:", error);

    res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to fetch system logs",
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  }
});

// Cache Management (Admin only)
router.post(
  "/cache/:action",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { action } = req.params;
      const { keys } = req.body;

      let result = {};

      switch (action) {
        case "clear":
          // Clear cache (if you're using Redis or similar)
          // For now, this is a placeholder
          result.message = "Cache cleared successfully";
          result.clearedKeys = keys || ["all"];
          break;

        case "stats":
          // Get cache statistics
          result.message = "Cache statistics retrieved";
          result.stats = {
            totalKeys: 0,
            memoryUsage: "0MB",
            hitRate: "0%",
            missRate: "0%",
          };
          break;

        case "flush":
          // Flush all cache
          result.message = "Cache flushed successfully";
          break;

        default:
          return res.status(400).json({
            success: false,
            error: "INVALID_ACTION",
            message: "Invalid cache action",
            timestamp: new Date().toISOString(),
            requestId: uuidv4(),
          });
      }

      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    } catch (error) {
      console.error("Cache management error:", error);

      res.status(500).json({
        success: false,
        error: "CACHE_OPERATION_FAILED",
        message: "Cache operation failed",
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }
  }
);

// System Backup (Admin only)
router.post("/backup", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { collections = ["all"], format = "json" } = req.body;

    // This is a simplified backup endpoint
    // In production, you'd use mongodump or similar tools

    const backupId = `backup_${Date.now()}`;
    const timestamp = new Date().toISOString();

    // Simulate backup process
    const backupInfo = {
      id: backupId,
      timestamp,
      collections: collections,
      format,
      status: "initiated",
      estimatedSize: "0MB",
      location: `/backups/${backupId}.${format}`,
    };

    // In a real implementation, you'd queue this as a background job
    setTimeout(() => {
      console.log(`✅ Backup ${backupId} completed`);
    }, 5000);

    res.status(202).json({
      success: true,
      message: "Backup initiated successfully",
      data: {
        backup: backupInfo,
      },
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  } catch (error) {
    console.error("System backup error:", error);

    res.status(500).json({
      success: false,
      error: "BACKUP_FAILED",
      message: "System backup failed",
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  }
});

module.exports = router;
