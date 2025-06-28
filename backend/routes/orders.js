const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const { authenticateToken } = require('../middleware/auth');
const { validateOrderCreation } = require('../utils/validation');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Create Order
router.post('/', authenticateToken, validateOrderCreation, async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      billingAddress,
      paymentMethod,
      couponCode
    } = req.body;

    // Validate all products exist and are in stock
    const productIds = items.map(item => item.productId);
    const products = await Product.find({ id: { $in: productIds } });
    
    if (products.length !== productIds.length) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_PRODUCTS',
        message: 'One or more products not found',
        timestamp: new Date().toISOString(),
        requestId: uuidv4()
      });
    }

    // Check stock availability and calculate totals
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      
      if (!product.inStock || product.stockQuantity < item.quantity) {
        return res.status(400).json({
          success: false,
          error: 'INSUFFICIENT_STOCK',
          message: `Insufficient stock for product: ${product.title}`,
          timestamp: new Date().toISOString(),
          requestId: uuidv4()
        });
      }

      const totalPrice = item.unitPrice * item.quantity;
      subtotal += totalPrice;

      orderItems.push({
        productId: item.productId,
        title: product.title,
        image: product.images?.[0]?.url || '',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: Math.round(totalPrice * 100) / 100
      });
    }

    // Calculate shipping (free for orders above ₹500)
    const shipping = subtotal >= 500 ? 0 : 50;

    // Apply coupon discount if provided
    let discount = 0;
    if (couponCode) {
      // Simple coupon logic - in production, this would check a coupons collection
      if (couponCode === 'SAVE10' && subtotal >= 500) {
        discount = Math.min(subtotal * 0.1, 100); // 10% off, max ₹100
      }
    }

    // Calculate tax (18% GST)
    const taxableAmount = subtotal - discount;
    const tax = Math.round(taxableAmount * 0.18 * 100) / 100;

    // Calculate total
    const total = subtotal - discount + shipping + tax;

    // Create order
    const order = new Order({
      userId: req.user.id,
      items: orderItems,
      summary: {
        subtotal: Math.round(subtotal * 100) / 100,
        shipping: Math.round(shipping * 100) / 100,
        tax: Math.round(tax * 100) / 100,
        discount: Math.round(discount * 100) / 100,
        total: Math.round(total * 100) / 100
      },
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      paymentMethod
    });

    await order.save();

    // Update product stock quantities
    for (const item of items) {
      await Product.findOneAndUpdate(
        { id: item.productId },
        { $inc: { stockQuantity: -item.quantity } }
      );
    }

    // Clear user's cart
    await Cart.findOneAndUpdate(
      { userId: req.user.id },
      { $set: { items: [] } }
    );

    // Prepare payment details for response
    let paymentDetails = {};
    if (paymentMethod === 'razorpay') {
      // In production, integrate with Razorpay API
      paymentDetails = {
        razorpayOrderId: `order_razorpay_${Date.now()}`,
        amount: Math.round(total * 100), // Razorpay expects amount in paise
        currency: 'INR'
      };
    }

    // Set estimated delivery date (5 business days)
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);
    order.estimatedDelivery = estimatedDelivery;
    await order.save();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        order: order.toJSON(),
        paymentDetails
      },
      timestamp: new Date().toISOString(),
      requestId: uuidv4()
    });

  } catch (error) {
    console.error('Create order error:', error);
    
    if (error.name === 'ValidationError') {
      const details = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(422).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid order data',
        details,
        timestamp: new Date().toISOString(),
        requestId: uuidv4()
      });
    }

    res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to create order',
      timestamp: new Date().toISOString(),
      requestId: uuidv4()
    });
  }
});

// Get Order by ID
router.get('/:orderId', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ 
      id: orderId,
      userId: req.user.id 
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'ORDER_NOT_FOUND',
        message: 'Order not found',
        timestamp: new Date().toISOString(),
        requestId: uuidv4()
      });
    }

    res.status(200).json({
      success: true,
      data: {
        order: order.toJSON()
      },
      timestamp: new Date().toISOString(),
      requestId: uuidv4()
    });

  } catch (error) {
    console.error('Get order error:', error);
    
    res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to fetch order',
      timestamp: new Date().toISOString(),
      requestId: uuidv4()
    });
  }
});

// Get User Orders
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const filter = { userId: req.user.id };
    if (status) {
      filter.status = status;
    }

    const [orders, totalItems] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Order.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalItems / limitNum);

    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems,
          itemsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPreviousPage: pageNum > 1
        }
      },
      timestamp: new Date().toISOString(),
      requestId: uuidv4()
    });

  } catch (error) {
    console.error('Get user orders error:', error);
    
    res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to fetch orders',
      timestamp: new Date().toISOString(),
      requestId: uuidv4()
    });
  }
});

module.exports = router;
