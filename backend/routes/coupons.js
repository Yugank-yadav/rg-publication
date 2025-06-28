const express = require('express');
const Coupon = require('../models/Coupon');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { param, body } = require('express-validator');
const { handleValidationErrors } = require('../utils/validation');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Validation middleware
const validateCouponCode = [
  param('code')
    .matches(/^[A-Z0-9]{3,20}$/)
    .withMessage('Invalid coupon code format'),
  handleValidationErrors
];

const validateCouponApplication = [
  body('code')
    .matches(/^[A-Z0-9]{3,20}$/)
    .withMessage('Invalid coupon code format'),
  handleValidationErrors
];

// Validate Coupon Code
router.get('/validate/:code', optionalAuth, validateCouponCode, async (req, res) => {
  try {
    const { code } = req.params;
    const { cartTotal, productIds } = req.query;

    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase(),
      isActive: true 
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        error: 'COUPON_NOT_FOUND',
        message: 'Coupon code not found',
        timestamp: new Date().toISOString(),
        requestId: uuidv4()
      });
    }

    // Basic validation without user context
    const now = new Date();
    let validationResult = {
      valid: true,
      message: 'Coupon is valid',
      coupon: {
        id: coupon.id,
        code: coupon.code,
        name: coupon.name,
        description: coupon.description,
        type: coupon.type,
        value: coupon.value,
        maxDiscount: coupon.maxDiscount,
        minOrderValue: coupon.minOrderValue,
        discountDisplay: coupon.discountDisplay,
        validUntil: coupon.validUntil
      }
    };

    // Check date validity
    if (now < coupon.validFrom) {
      validationResult.valid = false;
      validationResult.message = 'Coupon is not yet valid';
    } else if (now > coupon.validUntil) {
      validationResult.valid = false;
      validationResult.message = 'Coupon has expired';
    }

    // Check total usage limit
    if (coupon.usageLimit.total && coupon.usageCount.total >= coupon.usageLimit.total) {
      validationResult.valid = false;
      validationResult.message = 'Coupon usage limit exceeded';
    }

    // Check minimum order value if cart total provided
    if (cartTotal && parseFloat(cartTotal) < coupon.minOrderValue) {
      validationResult.valid = false;
      validationResult.message = `Minimum order value of ₹${coupon.minOrderValue} required`;
    }

    // Calculate potential discount if cart total provided
    if (validationResult.valid && cartTotal) {
      const total = parseFloat(cartTotal);
      const discount = coupon.calculateDiscount(total);
      validationResult.discount = discount;
      validationResult.finalTotal = total - discount;
    }

    // Check user-specific validation if authenticated
    if (req.user && validationResult.valid) {
      try {
        const userUsage = coupon.usageCount.users.find(u => u.userId === req.user.id);
        if (userUsage && userUsage.count >= coupon.usageLimit.perUser) {
          validationResult.valid = false;
          validationResult.message = 'You have already used this coupon the maximum number of times';
        }
      } catch (userError) {
        // Continue without user-specific validation
      }
    }

    res.status(200).json({
      success: true,
      data: validationResult,
      timestamp: new Date().toISOString(),
      requestId: uuidv4()
    });

  } catch (error) {
    console.error('Validate coupon error:', error);
    
    res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to validate coupon',
      timestamp: new Date().toISOString(),
      requestId: uuidv4()
    });
  }
});

// Apply Coupon to Cart
router.post('/cart/coupon', authenticateToken, validateCouponApplication, async (req, res) => {
  try {
    const { code } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ userId: req.user.id }).populate({
      path: 'items.productId',
      model: 'Product',
      select: 'id title price subject class type'
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'EMPTY_CART',
        message: 'Cart is empty',
        timestamp: new Date().toISOString(),
        requestId: uuidv4()
      });
    }

    // Find coupon
    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase(),
      isActive: true 
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        error: 'COUPON_NOT_FOUND',
        message: 'Coupon code not found',
        timestamp: new Date().toISOString(),
        requestId: uuidv4()
      });
    }

    // Calculate cart total
    const cartTotal = cart.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

    // Validate coupon for user and cart
    try {
      coupon.validateForUser(req.user.id, cartTotal, cart.items);
    } catch (validationError) {
      return res.status(400).json({
        success: false,
        error: 'COUPON_VALIDATION_FAILED',
        message: validationError.message,
        timestamp: new Date().toISOString(),
        requestId: uuidv4()
      });
    }

    // Calculate discount
    const discount = coupon.calculateDiscount(cartTotal, cart.items);

    // Apply coupon to cart
    await cart.applyCoupon(coupon.code, discount, coupon.description);

    res.status(200).json({
      success: true,
      message: 'Coupon applied successfully',
      data: {
        coupon: {
          code: coupon.code,
          name: coupon.name,
          description: coupon.description,
          discount: discount
        },
        cartSummary: cart.summary
      },
      timestamp: new Date().toISOString(),
      requestId: uuidv4()
    });

  } catch (error) {
    console.error('Apply coupon error:', error);
    
    res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to apply coupon',
      timestamp: new Date().toISOString(),
      requestId: uuidv4()
    });
  }
});

// Remove Coupon from Cart
router.delete('/cart/coupon', authenticateToken, async (req, res) => {
  try {
    // Get user's cart
    const cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        error: 'CART_NOT_FOUND',
        message: 'Cart not found',
        timestamp: new Date().toISOString(),
        requestId: uuidv4()
      });
    }

    if (!cart.appliedCoupon) {
      return res.status(400).json({
        success: false,
        error: 'NO_COUPON_APPLIED',
        message: 'No coupon is currently applied to the cart',
        timestamp: new Date().toISOString(),
        requestId: uuidv4()
      });
    }

    // Remove coupon from cart
    await cart.removeCoupon();

    res.status(200).json({
      success: true,
      message: 'Coupon removed successfully',
      data: {
        cartSummary: cart.summary
      },
      timestamp: new Date().toISOString(),
      requestId: uuidv4()
    });

  } catch (error) {
    console.error('Remove coupon error:', error);
    
    res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to remove coupon',
      timestamp: new Date().toISOString(),
      requestId: uuidv4()
    });
  }
});

// Get Available Coupons (for user)
router.get('/available', authenticateToken, async (req, res) => {
  try {
    const now = new Date();
    
    const coupons = await Coupon.find({
      isActive: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now },
      $or: [
        { 'usageLimit.total': { $exists: false } },
        { $expr: { $lt: ['$usageCount.total', '$usageLimit.total'] } }
      ]
    }).select('id code name description type value maxDiscount minOrderValue discountDisplay validUntil');

    // Filter coupons based on user eligibility
    const eligibleCoupons = coupons.filter(coupon => {
      // Check per-user usage limit
      const userUsage = coupon.usageCount.users.find(u => u.userId === req.user.id);
      if (userUsage && userUsage.count >= coupon.usageLimit.perUser) {
        return false;
      }

      // Check user eligibility criteria
      if (coupon.userEligibility.newUsersOnly) {
        // Would need to check if user is new (implementation depends on business logic)
      }

      if (coupon.userEligibility.specificUsers.length > 0) {
        return coupon.userEligibility.specificUsers.includes(req.user.id);
      }

      if (coupon.userEligibility.userRoles.length > 0) {
        return coupon.userEligibility.userRoles.includes(req.user.role);
      }

      return true;
    });

    res.status(200).json({
      success: true,
      data: {
        coupons: eligibleCoupons
      },
      timestamp: new Date().toISOString(),
      requestId: uuidv4()
    });

  } catch (error) {
    console.error('Get available coupons error:', error);
    
    res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to fetch available coupons',
      timestamp: new Date().toISOString(),
      requestId: uuidv4()
    });
  }
});

module.exports = router;
