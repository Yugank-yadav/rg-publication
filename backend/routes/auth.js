const express = require("express");
const User = require("../models/User");
const { generateToken, authenticateToken } = require("../middleware/auth");
const {
  validateUserRegistration,
  validateUserLogin,
} = require("../utils/validation");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();

// User Registration
router.post("/register", validateUserRegistration, async (req, res) => {
  try {
    console.log("🔐 Registration attempt with data:", req.body);
    const { firstName, lastName, email, password, phone, dateOfBirth, role } =
      req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("🔐 Registration failed: Email already exists for", email);
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

    // Create new user
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      phone,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      role: role || "student",
    });

    await user.save();

    // Generate tokens
    const accessToken = generateToken(user.id);
    const refreshToken = generateToken(user.id); // Same token for simplicity since they don't expire

    // Prepare response
    const userResponse = user.toJSON();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: userResponse,
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: null,
        },
      },
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  } catch (error) {
    console.error("Registration error:", error);

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
      message: "Registration failed",
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  }
});

// User Login
router.post("/login", validateUserLogin, async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    // Find user by email and include password for comparison
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "INVALID_CREDENTIALS",
        message: "Invalid email or password",
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: "INVALID_CREDENTIALS",
        message: "Invalid email or password",
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }

    // Generate tokens
    const accessToken = generateToken(user.id);
    const refreshToken = generateToken(user.id);

    // Prepare response
    const userResponse = user.toJSON();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: userResponse,
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: null,
        },
      },
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: "Login failed",
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  }
});

// Token Refresh (Optional - since tokens don't expire)
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: "MISSING_REFRESH_TOKEN",
        message: "Refresh token is required",
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }

    // Verify refresh token
    const jwt = require("jsonwebtoken");
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    // Generate new access token
    const newAccessToken = generateToken(decoded.userId);

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        accessToken: newAccessToken,
        expiresIn: null,
      },
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  } catch (error) {
    console.error("Token refresh error:", error);

    res.status(401).json({
      success: false,
      error: "INVALID_REFRESH_TOKEN",
      message: "Invalid or expired refresh token",
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  }
});

// Logout
router.post("/logout", authenticateToken, async (req, res) => {
  try {
    // Since we're using stateless JWT tokens that don't expire,
    // logout is handled on the client side by removing the token
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  } catch (error) {
    console.error("Logout error:", error);

    res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: "Logout failed",
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  }
});

module.exports = router;
