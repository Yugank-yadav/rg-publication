const express = require("express");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { authenticateToken } = require("../middleware/auth");
const { validateCartItem } = require("../utils/validation");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();

// Get Cart
router.get("/", authenticateToken, async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      // Create empty cart if it doesn't exist
      cart = new Cart({ userId: req.user.id });
      await cart.save();
    }

    // Manually fetch products for cart items
    const productIds = cart.items.map((item) => item.productId);
    const products = await Product.find({ id: { $in: productIds } });

    // Create a map for quick product lookup
    const productMap = {};
    products.forEach((product) => {
      productMap[product.id] = product;
    });

    // Transform cart items to include product details
    const transformedItems = cart.items
      .map((item) => {
        const product = productMap[item.productId];
        if (!product) {
          console.warn(`Product not found for cart item: ${item.productId}`);
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
            image: product.images?.[0]?.url || "",
            subject: product.subject,
            class: product.class,
            inStock: product.inStock,
            stockQuantity: product.stockQuantity,
          },
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: Math.round(item.unitPrice * item.quantity * 100) / 100,
          addedAt: item.addedAt,
        };
      })
      .filter((item) => item !== null); // Remove null items

    const response = {
      id: cart.id,
      userId: cart.userId,
      items: transformedItems,
      summary: cart.summary,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };

    res.status(200).json({
      success: true,
      data: {
        cart: response,
      },
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  } catch (error) {
    console.error("Get cart error:", error);

    res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to fetch cart",
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  }
});

// Add Item to Cart
router.post("/items", authenticateToken, validateCartItem, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // Check if product exists and is in stock
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

    if (!product.inStock || product.stockQuantity < quantity) {
      return res.status(400).json({
        success: false,
        error: "INSUFFICIENT_STOCK",
        message: "Product is out of stock or insufficient quantity available",
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }

    // Find or create cart
    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      cart = new Cart({ userId: req.user.id });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId === productId
    );

    if (existingItemIndex > -1) {
      // Update existing item
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;

      if (newQuantity > product.stockQuantity) {
        return res.status(400).json({
          success: false,
          error: "INSUFFICIENT_STOCK",
          message: "Cannot add more items than available in stock",
          timestamp: new Date().toISOString(),
          requestId: uuidv4(),
        });
      }

      cart.items[existingItemIndex].quantity = newQuantity;
      cart.items[existingItemIndex].unitPrice = product.price;
    } else {
      // Add new item
      cart.items.push({
        productId,
        quantity,
        unitPrice: product.price,
      });
    }

    await cart.save();

    const addedItem = cart.items[cart.items.length - 1];

    res.status(201).json({
      success: true,
      message: "Item added to cart successfully",
      data: {
        cartItem: {
          id: addedItem.id,
          productId: addedItem.productId,
          quantity: addedItem.quantity,
          unitPrice: addedItem.unitPrice,
          totalPrice:
            Math.round(addedItem.unitPrice * addedItem.quantity * 100) / 100,
          addedAt: addedItem.addedAt,
        },
        cartSummary: cart.summary,
      },
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  } catch (error) {
    console.error("Add to cart error:", error);

    res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to add item to cart",
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  }
});

// Update Cart Item
router.put("/items/:cartItemId", authenticateToken, async (req, res) => {
  try {
    const { cartItemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        error: "INVALID_QUANTITY",
        message: "Quantity must be at least 1",
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: "CART_NOT_FOUND",
        message: "Cart not found",
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }

    const item = cart.items.find((item) => item.id === cartItemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        error: "CART_ITEM_NOT_FOUND",
        message: "Cart item not found",
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }

    // Check stock availability
    const product = await Product.findOne({ id: item.productId });
    if (!product || !product.inStock || product.stockQuantity < quantity) {
      return res.status(400).json({
        success: false,
        error: "INSUFFICIENT_STOCK",
        message: "Insufficient stock available",
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }

    // Update quantity
    item.quantity = quantity;
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart item updated successfully",
      data: {
        cartItem: {
          id: item.id,
          quantity: item.quantity,
          totalPrice: Math.round(item.unitPrice * item.quantity * 100) / 100,
        },
        cartSummary: cart.summary,
      },
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  } catch (error) {
    console.error("Update cart item error:", error);

    res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to update cart item",
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  }
});

// Remove Cart Item
router.delete("/items/:cartItemId", authenticateToken, async (req, res) => {
  try {
    const { cartItemId } = req.params;

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: "CART_NOT_FOUND",
        message: "Cart not found",
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }

    const itemIndex = cart.items.findIndex((item) => item.id === cartItemId);
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "CART_ITEM_NOT_FOUND",
        message: "Cart item not found",
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }

    // Remove item
    cart.items.splice(itemIndex, 1);
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Item removed from cart successfully",
      data: {
        cartSummary: cart.summary,
      },
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  } catch (error) {
    console.error("Remove cart item error:", error);

    res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to remove cart item",
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  }
});

// Sync Cart (for localStorage integration)
router.post("/sync", authenticateToken, async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        error: "INVALID_INPUT",
        message: "Items must be an array",
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }

    // Find or create cart
    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      cart = new Cart({ userId: req.user.id });
    }

    // Validate all products exist and are in stock
    const productIds = items.map((item) => item.productId);
    const products = await Product.find({ id: { $in: productIds } });

    if (products.length !== productIds.length) {
      return res.status(400).json({
        success: false,
        error: "INVALID_PRODUCTS",
        message: "One or more products not found",
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }

    // Clear existing cart items
    cart.items = [];

    // Add items from localStorage
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);

      if (
        product &&
        product.inStock &&
        product.stockQuantity >= item.quantity
      ) {
        cart.items.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: product.price,
        });
      }
    }

    await cart.save();

    // Manually fetch products for cart items
    const syncProductIds = cart.items.map((item) => item.productId);
    const syncProducts = await Product.find({ id: { $in: syncProductIds } });

    // Create a map for quick product lookup
    const syncProductMap = {};
    syncProducts.forEach((product) => {
      syncProductMap[product.id] = product;
    });

    const transformedItems = cart.items.map((item) => {
      const product = syncProductMap[item.productId];
      return {
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: Math.round(item.unitPrice * item.quantity * 100) / 100,
      };
    });

    res.status(200).json({
      success: true,
      message: "Cart synchronized successfully",
      data: {
        cart: {
          id: cart.id,
          items: transformedItems,
          summary: cart.summary,
        },
      },
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  } catch (error) {
    console.error("Sync cart error:", error);

    res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to sync cart",
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  }
});

// Apply Coupon to Cart (Alternative endpoint)
router.post("/coupon", authenticateToken, async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: "MISSING_COUPON_CODE",
        message: "Coupon code is required",
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }

    // Get user's cart
    const cart = await Cart.findOne({ userId: req.user.id }).populate({
      path: "items.productId",
      model: "Product",
      select: "id title price subject class type",
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        error: "EMPTY_CART",
        message: "Cart is empty",
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }

    // Find coupon
    const Coupon = require("../models/Coupon");
    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        error: "COUPON_NOT_FOUND",
        message: "Coupon code not found",
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }

    // Calculate cart total
    const cartTotal = cart.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );

    // Validate coupon for user and cart
    try {
      coupon.validateForUser(req.user.id, cartTotal, cart.items);
    } catch (validationError) {
      return res.status(400).json({
        success: false,
        error: "COUPON_VALIDATION_FAILED",
        message: validationError.message,
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }

    // Calculate discount
    const discount = coupon.calculateDiscount(cartTotal, cart.items);

    // Apply coupon to cart
    await cart.applyCoupon(coupon.code, discount, coupon.description);

    res.status(200).json({
      success: true,
      message: "Coupon applied successfully",
      data: {
        coupon: {
          code: coupon.code,
          name: coupon.name,
          description: coupon.description,
          discount: discount,
        },
        cartSummary: cart.summary,
      },
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  } catch (error) {
    console.error("Apply coupon to cart error:", error);

    res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to apply coupon",
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  }
});

// Remove Coupon from Cart (Alternative endpoint)
router.delete("/coupon", authenticateToken, async (req, res) => {
  try {
    // Get user's cart
    const cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        error: "CART_NOT_FOUND",
        message: "Cart not found",
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }

    if (!cart.appliedCoupon) {
      return res.status(400).json({
        success: false,
        error: "NO_COUPON_APPLIED",
        message: "No coupon is currently applied to the cart",
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }

    // Remove coupon from cart
    await cart.removeCoupon();

    res.status(200).json({
      success: true,
      message: "Coupon removed successfully",
      data: {
        cartSummary: cart.summary,
      },
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  } catch (error) {
    console.error("Remove coupon from cart error:", error);

    res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to remove coupon",
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  }
});

// Clear Cart (for logout scenarios)
router.delete("/clear", authenticateToken, async (req, res) => {
  try {
    // Get user's cart
    let cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      return res.status(200).json({
        success: true,
        message: "Cart is already empty",
        data: {
          cartSummary: {
            itemCount: 0,
            subtotal: 0,
            shipping: 0,
            tax: 0,
            discount: 0,
            total: 0,
            currency: "INR",
          },
        },
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }

    // Clear cart
    await cart.clear();

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      data: {
        cartSummary: cart.summary,
      },
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  } catch (error) {
    console.error("Clear cart error:", error);

    res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to clear cart",
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  }
});

// Merge Cart (for login scenarios - merge localStorage cart with database cart)
router.post("/merge", authenticateToken, async (req, res) => {
  try {
    const { localCartItems } = req.body;

    if (!Array.isArray(localCartItems)) {
      return res.status(400).json({
        success: false,
        error: "INVALID_INPUT",
        message: "localCartItems must be an array",
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }

    // Find or create user's cart
    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      cart = new Cart({ userId: req.user.id });
    }

    // Get existing cart items for comparison
    const existingItems = cart.items || [];

    // Process each local cart item
    for (const localItem of localCartItems) {
      if (!localItem.id || !localItem.quantity) {
        continue; // Skip invalid items
      }

      // Check if product exists
      const product = await Product.findOne({ id: localItem.id });
      if (!product || !product.inStock) {
        continue; // Skip unavailable products
      }

      // Check if item already exists in database cart
      const existingItemIndex = existingItems.findIndex(
        (item) => item.productId === localItem.id
      );

      if (existingItemIndex > -1) {
        // Merge quantities (take the higher quantity)
        const existingQuantity = existingItems[existingItemIndex].quantity;
        const newQuantity = Math.max(existingQuantity, localItem.quantity);
        existingItems[existingItemIndex].quantity = newQuantity;
        existingItems[existingItemIndex].unitPrice = product.price; // Update price
      } else {
        // Add new item from localStorage
        cart.items.push({
          productId: localItem.id,
          quantity: localItem.quantity,
          unitPrice: product.price,
        });
      }
    }

    // Save the merged cart
    await cart.save();

    // Fetch complete cart data with product details
    const populatedCart = await Cart.findOne({ userId: req.user.id });
    const productIds = populatedCart.items.map((item) => item.productId);
    const products = await Product.find({ id: { $in: productIds } });

    // Create product map for quick lookup
    const productMap = {};
    products.forEach((product) => {
      productMap[product.id] = product;
    });

    // Transform cart items with product details
    const cartItemsWithDetails = populatedCart.items
      .map((item) => {
        const product = productMap[item.productId];
        return {
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: Math.round(item.unitPrice * item.quantity * 100) / 100,
          addedAt: item.addedAt,
          product: product
            ? {
                id: product.id,
                title: product.title,
                author: product.author,
                subject: product.subject,
                class: product.class,
                type: product.type,
                coverImage: product.coverImage,
                inStock: product.inStock,
              }
            : null,
        };
      })
      .filter((item) => item.product); // Remove items without valid products

    res.status(200).json({
      success: true,
      message: "Cart merged successfully",
      data: {
        cart: {
          id: populatedCart.id,
          userId: populatedCart.userId,
          items: cartItemsWithDetails,
          appliedCoupon: populatedCart.appliedCoupon,
          summary: populatedCart.summary,
          createdAt: populatedCart.createdAt,
          updatedAt: populatedCart.updatedAt,
        },
      },
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  } catch (error) {
    console.error("Merge cart error:", error);

    res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to merge cart",
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  }
});

module.exports = router;
