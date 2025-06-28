const express = require("express");
const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");
const { authenticateToken } = require("../middleware/auth");
const { body, param } = require("express-validator");
const { handleValidationErrors } = require("../utils/validation");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();

// Validation middleware for wishlist items
const validateWishlistItem = [
  body("productId")
    .matches(/^prod_[a-zA-Z0-9]+$/)
    .withMessage("Invalid product ID format"),
  handleValidationErrors,
];

const validateWishlistItemId = [
  param("itemId")
    .matches(/^wishlist_item_[a-zA-Z0-9]+$/)
    .withMessage("Invalid wishlist item ID format"),
  handleValidationErrors,
];

// Get User's Wishlist
router.get("/", authenticateToken, async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ userId: req.user.id });

    if (!wishlist) {
      // Create empty wishlist if it doesn't exist
      wishlist = new Wishlist({ userId: req.user.id });
      await wishlist.save();
    }

    // Manually fetch products for wishlist items
    const productIds = wishlist.items.map((item) => item.productId);
    const products = await Product.find({ id: { $in: productIds } });

    // Create a map for quick product lookup
    const productMap = {};
    products.forEach((product) => {
      productMap[product.id] = product;
    });

    // Transform wishlist items to include product details
    const transformedItems = wishlist.items
      .map((item) => {
        const product = productMap[item.productId];
        if (!product) {
          console.warn(
            `Product not found for wishlist item: ${item.productId}`
          );
          return null;
        }

        return {
          id: item.id,
          productId: item.productId,
          product: {
            id: product.id,
            title: product.title,
            price: product.price,
            originalPrice: product.originalPrice,
            discount: product.discount,
            image: product.images?.[0]?.url || "",
            subject: product.subject,
            class: product.class,
            inStock: product.inStock,
            stockQuantity: product.stockQuantity,
            rating: product.rating?.average || 0,
            featured: product.featured,
          },
          addedAt: item.addedAt,
        };
      })
      .filter((item) => item !== null); // Remove null items

    const response = {
      id: wishlist.id,
      userId: wishlist.userId,
      items: transformedItems,
      itemCount: wishlist.itemCount,
      createdAt: wishlist.createdAt,
      updatedAt: wishlist.updatedAt,
    };

    res.status(200).json({
      success: true,
      data: {
        wishlist: response,
      },
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  } catch (error) {
    console.error("Get wishlist error:", error);

    res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to fetch wishlist",
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  }
});

// Add Item to Wishlist
router.post(
  "/items",
  authenticateToken,
  validateWishlistItem,
  async (req, res) => {
    try {
      const { productId } = req.body;

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

      // Find or create wishlist
      let wishlist = await Wishlist.findOne({ userId: req.user.id });
      if (!wishlist) {
        wishlist = new Wishlist({ userId: req.user.id });
      }

      // Check if item already exists in wishlist
      if (wishlist.hasProduct(productId)) {
        return res.status(400).json({
          success: false,
          error: "PRODUCT_ALREADY_IN_WISHLIST",
          message: "Product is already in your wishlist",
          timestamp: new Date().toISOString(),
          requestId: uuidv4(),
        });
      }

      // Add item to wishlist
      await wishlist.addItem(productId);

      const addedItem = wishlist.items[wishlist.items.length - 1];

      res.status(201).json({
        success: true,
        message: "Item added to wishlist successfully",
        data: {
          wishlistItem: {
            id: addedItem.id,
            productId: addedItem.productId,
            addedAt: addedItem.addedAt,
          },
          itemCount: wishlist.itemCount,
        },
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    } catch (error) {
      console.error("Add to wishlist error:", error);

      if (error.message === "Product already in wishlist") {
        return res.status(400).json({
          success: false,
          error: "PRODUCT_ALREADY_IN_WISHLIST",
          message: error.message,
          timestamp: new Date().toISOString(),
          requestId: uuidv4(),
        });
      }

      res.status(500).json({
        success: false,
        error: "INTERNAL_SERVER_ERROR",
        message: "Failed to add item to wishlist",
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }
  }
);

// Remove Item from Wishlist
router.delete(
  "/items/:itemId",
  authenticateToken,
  validateWishlistItemId,
  async (req, res) => {
    try {
      const { itemId } = req.params;

      const wishlist = await Wishlist.findOne({ userId: req.user.id });
      if (!wishlist) {
        return res.status(404).json({
          success: false,
          error: "WISHLIST_NOT_FOUND",
          message: "Wishlist not found",
          timestamp: new Date().toISOString(),
          requestId: uuidv4(),
        });
      }

      // Remove item from wishlist
      try {
        await wishlist.removeItem(itemId);
      } catch (itemError) {
        return res.status(404).json({
          success: false,
          error: "WISHLIST_ITEM_NOT_FOUND",
          message: "Wishlist item not found",
          timestamp: new Date().toISOString(),
          requestId: uuidv4(),
        });
      }

      res.status(200).json({
        success: true,
        message: "Item removed from wishlist successfully",
        data: {
          itemCount: wishlist.itemCount,
        },
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    } catch (error) {
      console.error("Remove from wishlist error:", error);

      res.status(500).json({
        success: false,
        error: "INTERNAL_SERVER_ERROR",
        message: "Failed to remove item from wishlist",
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }
  }
);

// Check if Product is in Wishlist
router.get("/check/:productId", authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ userId: req.user.id });
    const inWishlist = wishlist ? wishlist.hasProduct(productId) : false;

    res.status(200).json({
      success: true,
      data: {
        productId,
        inWishlist,
      },
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  } catch (error) {
    console.error("Check wishlist error:", error);

    res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to check wishlist status",
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  }
});

// Clear Wishlist
router.delete("/", authenticateToken, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user.id });
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        error: "WISHLIST_NOT_FOUND",
        message: "Wishlist not found",
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }

    await wishlist.clear();

    res.status(200).json({
      success: true,
      message: "Wishlist cleared successfully",
      data: {
        itemCount: 0,
      },
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  } catch (error) {
    console.error("Clear wishlist error:", error);

    res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to clear wishlist",
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  }
});

module.exports = router;
