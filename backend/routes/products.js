const express = require('express');
const Product = require('../models/Product');
const { validateProductId, validateSearch } = require('../utils/validation');
const { optionalAuth } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Get All Products with filtering and pagination
router.get('/', validateSearch, optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      subject,
      class: classLevel,
      type,
      featured,
      priceMin,
      priceMax,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      inStock
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (subject) filter.subject = subject;
    if (classLevel) filter.class = parseInt(classLevel);
    if (type) filter.type = type;
    if (featured) filter.featured = featured;
    if (inStock !== undefined) filter.inStock = inStock === 'true';
    
    // Price range filter
    if (priceMin || priceMax) {
      filter.price = {};
      if (priceMin) filter.price.$gte = parseFloat(priceMin);
      if (priceMax) filter.price.$lte = parseFloat(priceMax);
    }

    // Text search
    if (search) {
      filter.$text = { $search: search };
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sort options
    const sortOptions = {};
    if (search) {
      sortOptions.score = { $meta: 'textScore' };
    } else {
      sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
    }

    // Execute query
    const [products, totalItems] = await Promise.all([
      Product.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(filter)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalItems / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPreviousPage = pageNum > 1;

    // Get filter options for frontend
    const [subjects, classes, types, featuredTypes, priceRange] = await Promise.all([
      Product.distinct('subject'),
      Product.distinct('class'),
      Product.distinct('type'),
      Product.distinct('featured', { featured: { $ne: null } }),
      Product.aggregate([
        { $group: { _id: null, min: { $min: '$price' }, max: { $max: '$price' } } }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems,
          itemsPerPage: limitNum,
          hasNextPage,
          hasPreviousPage
        },
        filters: {
          subjects,
          classes: classes.sort((a, b) => a - b),
          types,
          featured: featuredTypes,
          priceRange: priceRange[0] || { min: 0, max: 1000 }
        }
      },
      timestamp: new Date().toISOString(),
      requestId: uuidv4()
    });

  } catch (error) {
    console.error('Get products error:', error);
    
    res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to fetch products',
      timestamp: new Date().toISOString(),
      requestId: uuidv4()
    });
  }
});

// Get Featured Products
router.get('/featured', optionalAuth, async (req, res) => {
  try {
    const { type, limit = 8 } = req.query;
    const limitNum = parseInt(limit);

    let filter = {};
    if (type) {
      filter.featured = type;
    } else {
      filter.featured = { $in: ['bestseller', 'trending', 'new-arrival'] };
    }

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .lean();

    // Group by featured type
    const groupedProducts = {
      bestsellers: [],
      trending: [],
      newArrivals: []
    };

    products.forEach(product => {
      switch (product.featured) {
        case 'bestseller':
          groupedProducts.bestsellers.push(product);
          break;
        case 'trending':
          groupedProducts.trending.push(product);
          break;
        case 'new-arrival':
          groupedProducts.newArrivals.push(product);
          break;
      }
    });

    res.status(200).json({
      success: true,
      data: groupedProducts,
      timestamp: new Date().toISOString(),
      requestId: uuidv4()
    });

  } catch (error) {
    console.error('Get featured products error:', error);
    
    res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to fetch featured products',
      timestamp: new Date().toISOString(),
      requestId: uuidv4()
    });
  }
});

// Get Product by ID
router.get('/:productId', validateProductId, optionalAuth, async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findOne({ id: productId }).lean();
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'PRODUCT_NOT_FOUND',
        message: 'Product not found',
        timestamp: new Date().toISOString(),
        requestId: uuidv4()
      });
    }

    // Get related products (same subject and class, different products)
    const relatedProducts = await Product.find({
      subject: product.subject,
      class: product.class,
      id: { $ne: productId }
    })
    .limit(4)
    .select('id title price images rating')
    .lean();

    // Add related products to response
    product.relatedProducts = relatedProducts.map(related => ({
      id: related.id,
      title: related.title,
      price: related.price,
      image: related.images?.[0]?.url || '',
      rating: related.rating?.average || 0
    }));

    res.status(200).json({
      success: true,
      data: {
        product
      },
      timestamp: new Date().toISOString(),
      requestId: uuidv4()
    });

  } catch (error) {
    console.error('Get product by ID error:', error);
    
    res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to fetch product',
      timestamp: new Date().toISOString(),
      requestId: uuidv4()
    });
  }
});

module.exports = router;
