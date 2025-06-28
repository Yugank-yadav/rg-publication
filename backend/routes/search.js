const express = require('express');
const Product = require('../models/Product');
const { validateSearch } = require('../utils/validation');
const { optionalAuth } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Search Products
router.get('/products', validateSearch, optionalAuth, async (req, res) => {
  try {
    const startTime = Date.now();
    
    const {
      q: searchQuery,
      subject,
      class: classLevel,
      type,
      featured,
      priceMin,
      priceMax,
      page = 1,
      limit = 20,
      sortBy = 'relevance',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (subject) filter.subject = subject;
    if (classLevel) filter.class = parseInt(classLevel);
    if (type) filter.type = type;
    if (featured) filter.featured = featured;
    
    // Price range filter
    if (priceMin || priceMax) {
      filter.price = {};
      if (priceMin) filter.price.$gte = parseFloat(priceMin);
      if (priceMax) filter.price.$lte = parseFloat(priceMax);
    }

    // Text search
    if (searchQuery) {
      filter.$text = { $search: searchQuery };
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sort options
    const sortOptions = {};
    if (searchQuery && sortBy === 'relevance') {
      sortOptions.score = { $meta: 'textScore' };
    } else {
      const sortField = sortBy === 'relevance' ? 'createdAt' : sortBy;
      sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;
    }

    // Execute search query
    const [products, totalItems] = await Promise.all([
      Product.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(filter)
    ]);

    // Add relevance score and matched fields for text search
    const resultsWithRelevance = products.map(product => {
      const result = { ...product };
      
      if (searchQuery) {
        // Calculate relevance score (simplified)
        let relevanceScore = 0;
        const matchedFields = [];
        
        const query = searchQuery.toLowerCase();
        
        if (product.title.toLowerCase().includes(query)) {
          relevanceScore += 0.5;
          matchedFields.push('title');
        }
        
        if (product.description.toLowerCase().includes(query)) {
          relevanceScore += 0.3;
          matchedFields.push('description');
        }
        
        if (product.tags && product.tags.some(tag => tag.toLowerCase().includes(query))) {
          relevanceScore += 0.2;
          matchedFields.push('tags');
        }
        
        result.relevanceScore = Math.min(relevanceScore, 1);
        result.matchedFields = matchedFields;
      }
      
      return result;
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalItems / limitNum);

    // Generate search suggestions
    const suggestions = {};
    if (searchQuery && products.length === 0) {
      // Simple "did you mean" logic
      const commonTerms = ['mathematics', 'science', 'english', 'social science'];
      const closestMatch = commonTerms.find(term => 
        term.includes(searchQuery.toLowerCase()) || 
        searchQuery.toLowerCase().includes(term)
      );
      
      if (closestMatch) {
        suggestions.didYouMean = `${closestMatch} class ${classLevel || '10'}`;
      }
      
      suggestions.relatedQueries = [
        `${searchQuery} textbook`,
        `${searchQuery} practice book`,
        `${searchQuery} solutions`
      ];
    }

    // Get filter counts for active filters
    const filterCounts = await Promise.all([
      // Subject counts
      Product.aggregate([
        { $match: { ...filter, subject: { $exists: true } } },
        { $group: { _id: '$subject', count: { $sum: 1 } } }
      ]),
      // Class counts
      Product.aggregate([
        { $match: { ...filter, class: { $exists: true } } },
        { $group: { _id: '$class', count: { $sum: 1 } } }
      ]),
      // Type counts
      Product.aggregate([
        { $match: { ...filter, type: { $exists: true } } },
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]),
      // Featured counts
      Product.aggregate([
        { $match: { ...filter, featured: { $exists: true, $ne: null } } },
        { $group: { _id: '$featured', count: { $sum: 1 } } }
      ])
    ]);

    const filters = {
      subjects: filterCounts[0].map(item => ({
        value: item._id,
        count: item.count,
        selected: subject === item._id
      })),
      classes: filterCounts[1].map(item => ({
        value: item._id,
        count: item.count,
        selected: parseInt(classLevel) === item._id
      })).sort((a, b) => a.value - b.value),
      types: filterCounts[2].map(item => ({
        value: item._id,
        count: item.count,
        selected: type === item._id
      })),
      featured: filterCounts[3].map(item => ({
        value: item._id,
        count: item.count,
        selected: featured === item._id
      }))
    };

    const searchTime = (Date.now() - startTime) / 1000;

    res.status(200).json({
      success: true,
      data: {
        query: searchQuery || '',
        results: resultsWithRelevance,
        suggestions,
        filters,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems,
          itemsPerPage: limitNum
        },
        searchTime
      },
      timestamp: new Date().toISOString(),
      requestId: uuidv4()
    });

  } catch (error) {
    console.error('Search products error:', error);
    
    res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Search failed',
      timestamp: new Date().toISOString(),
      requestId: uuidv4()
    });
  }
});

// Get Search Suggestions
router.get('/suggestions', optionalAuth, async (req, res) => {
  try {
    const { q: query, limit = 5 } = req.query;

    if (!query || query.length < 2) {
      return res.status(200).json({
        success: true,
        data: {
          suggestions: []
        },
        timestamp: new Date().toISOString(),
        requestId: uuidv4()
      });
    }

    // Get product title suggestions
    const titleSuggestions = await Product.find({
      title: { $regex: query, $options: 'i' }
    })
    .select('title')
    .limit(parseInt(limit))
    .lean();

    // Get tag suggestions
    const tagSuggestions = await Product.find({
      tags: { $regex: query, $options: 'i' }
    })
    .select('tags')
    .limit(parseInt(limit))
    .lean();

    // Combine and deduplicate suggestions
    const suggestions = [];
    
    titleSuggestions.forEach(product => {
      if (!suggestions.includes(product.title)) {
        suggestions.push(product.title);
      }
    });

    tagSuggestions.forEach(product => {
      product.tags.forEach(tag => {
        if (tag.toLowerCase().includes(query.toLowerCase()) && 
            !suggestions.includes(tag) && 
            suggestions.length < parseInt(limit)) {
          suggestions.push(tag);
        }
      });
    });

    res.status(200).json({
      success: true,
      data: {
        suggestions: suggestions.slice(0, parseInt(limit))
      },
      timestamp: new Date().toISOString(),
      requestId: uuidv4()
    });

  } catch (error) {
    console.error('Get suggestions error:', error);
    
    res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to get suggestions',
      timestamp: new Date().toISOString(),
      requestId: uuidv4()
    });
  }
});

module.exports = router;
