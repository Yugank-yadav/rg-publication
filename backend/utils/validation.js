const { body, param, query, validationResult } = require("express-validator");

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("🚨 Validation errors:", errors.array());
    console.log("🚨 Request body:", req.body);
    return res.status(422).json({
      success: false,
      error: "VALIDATION_ERROR",
      message: "Invalid input data",
      details: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
        value: error.value,
      })),
      timestamp: new Date().toISOString(),
    });
  }
  next();
};

// User registration validation
const validateUserRegistration = [
  body("firstName")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("First name must be between 1 and 50 characters"),
  body("lastName")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Last name must be between 1 and 50 characters"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one lowercase letter, one uppercase letter, and one number"
    ),
  body("phone")
    .optional()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage("Please provide a valid phone number"),
  body("dateOfBirth")
    .optional()
    .isISO8601()
    .withMessage("Please provide a valid date of birth"),
  body("role")
    .optional()
    .isIn(["student", "teacher", "parent"])
    .withMessage("Role must be student, teacher, or parent"),
  handleValidationErrors,
];

// User login validation
const validateUserLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidationErrors,
];

// Product ID validation
const validateProductId = [
  param("productId")
    .matches(/^prod_[a-zA-Z0-9]+$/)
    .withMessage("Invalid product ID format"),
  handleValidationErrors,
];

// Cart item validation
const validateCartItem = [
  body("productId")
    .matches(/^prod_[a-zA-Z0-9]+$/)
    .withMessage("Invalid product ID format"),
  body("quantity")
    .isInt({ min: 1, max: 10 })
    .withMessage("Quantity must be between 1 and 10"),
  handleValidationErrors,
];

// Order creation validation
const validateOrderCreation = [
  body("items")
    .isArray({ min: 1 })
    .withMessage("Order must contain at least one item"),
  body("items.*.productId")
    .matches(/^prod_[a-zA-Z0-9]+$/)
    .withMessage("Invalid product ID format"),
  body("items.*.quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1"),
  body("items.*.unitPrice")
    .isFloat({ min: 0 })
    .withMessage("Unit price must be a positive number"),
  body("shippingAddress.firstName")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("First name is required"),
  body("shippingAddress.lastName")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Last name is required"),
  body("shippingAddress.email")
    .optional()
    .isEmail()
    .withMessage("Please provide a valid email address"),
  body("shippingAddress.phone")
    .optional()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage("Please provide a valid phone number"),
  body("shippingAddress.addressLine1")
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage("Address line 1 is required"),
  body("shippingAddress.city")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("City is required"),
  body("shippingAddress.state")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("State is required"),
  body("shippingAddress.postalCode")
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage("Postal code is required"),
  body("paymentMethod")
    .isIn(["razorpay", "cod", "bank_transfer"])
    .withMessage("Invalid payment method"),
  handleValidationErrors,
];

// Contact form validation
const validateContactForm = [
  body("name")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Name must be between 1 and 100 characters"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  body("phone")
    .optional()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage("Please provide a valid phone number"),
  body("subject")
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage("Subject must be between 1 and 200 characters"),
  body("message")
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage("Message must be between 1 and 2000 characters"),
  body("type")
    .optional()
    .isIn(["general", "support", "sales", "feedback", "complaint"])
    .withMessage("Invalid contact type"),
  handleValidationErrors,
];

// Search validation
const validateSearch = [
  query("q")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Search query must be between 1 and 100 characters"),
  query("subject")
    .optional()
    .isIn(["Mathematics", "Science", "English", "Social Science"])
    .withMessage("Invalid subject"),
  query("class")
    .optional()
    .isInt({ min: 5, max: 12 })
    .withMessage("Class must be between 5 and 12"),
  query("type")
    .optional()
    .isIn(["Textbook", "Practice Book", "Lab Manual", "Advanced Guide"])
    .withMessage("Invalid product type"),
  query("featured")
    .optional()
    .isIn(["bestseller", "trending", "new-arrival"])
    .withMessage("Invalid featured type"),
  query("priceMin")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Minimum price must be a positive number"),
  query("priceMax")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Maximum price must be a positive number"),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  handleValidationErrors,
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateProductId,
  validateCartItem,
  validateOrderCreation,
  validateContactForm,
  validateSearch,
};
