const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { uploadSingle, uploadMultiple } = require('../middleware/upload');
const { 
  uploadImage, 
  uploadMultipleImages, 
  deleteImage, 
  uploadDocument,
  transformations 
} = require('../utils/cloudinary');
const User = require('../models/User');
const Product = require('../models/Product');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Upload User Avatar
router.post('/avatar', authenticateToken, uploadSingle('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'NO_FILE_PROVIDED',
        message: 'Please provide an avatar image',
        timestamp: new Date().toISOString(),
        requestId: uuidv4()
      });
    }

    // Upload to Cloudinary with avatar transformation
    const uploadResult = await uploadImage(req.file.buffer, {
      folder: 'rg-publication/avatars',
      transformation: transformations.avatar,
      public_id: `avatar_${req.user.id}`
    });

    // Update user avatar in database
    const user = await User.findOne({ id: req.user.id });
    if (user) {
      // Delete old avatar if exists
      if (user.avatar) {
        try {
          const oldPublicId = user.avatar.split('/').pop().split('.')[0];
          await deleteImage(`rg-publication/avatars/${oldPublicId}`);
        } catch (deleteError) {
          console.warn('Failed to delete old avatar:', deleteError.message);
        }
      }

      user.avatar = uploadResult.url;
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        avatar: {
          id: uploadResult.id,
          url: uploadResult.url,
          width: uploadResult.width,
          height: uploadResult.height
        }
      },
      timestamp: new Date().toISOString(),
      requestId: uuidv4()
    });

  } catch (error) {
    console.error('Upload avatar error:', error);
    
    res.status(500).json({
      success: false,
      error: 'UPLOAD_FAILED',
      message: 'Failed to upload avatar',
      timestamp: new Date().toISOString(),
      requestId: uuidv4()
    });
  }
});

// Upload Product Images (Admin only)
router.post('/products/:productId/images', authenticateToken, requireAdmin, uploadMultiple('images', 5), async (req, res) => {
  try {
    const { productId } = req.params;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'NO_FILES_PROVIDED',
        message: 'Please provide at least one product image',
        timestamp: new Date().toISOString(),
        requestId: uuidv4()
      });
    }

    // Check if product exists
    const product = await Product.findOne({ id: productId });
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'PRODUCT_NOT_FOUND',
        message: 'Product not found',
        timestamp: new Date().toISOString(),
        requestId: uuidv4()
      });
    }

    // Upload images to Cloudinary
    const uploadResults = await uploadMultipleImages(req.files, {
      folder: `rg-publication/products/${productId}`,
      transformation: transformations.productImage
    });

    // Update product images in database
    const newImages = uploadResults.map((result, index) => ({
      id: result.id,
      url: result.url,
      alt: `${product.title} - Image ${index + 1}`,
      type: index === 0 ? 'cover' : 'gallery'
    }));

    product.images = [...(product.images || []), ...newImages];
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product images uploaded successfully',
      data: {
        images: newImages,
        totalImages: product.images.length
      },
      timestamp: new Date().toISOString(),
      requestId: uuidv4()
    });

  } catch (error) {
    console.error('Upload product images error:', error);
    
    res.status(500).json({
      success: false,
      error: 'UPLOAD_FAILED',
      message: 'Failed to upload product images',
      timestamp: new Date().toISOString(),
      requestId: uuidv4()
    });
  }
});

// Delete Product Image (Admin only)
router.delete('/products/:productId/images/:imageId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { productId, imageId } = req.params;

    const product = await Product.findOne({ id: productId });
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'PRODUCT_NOT_FOUND',
        message: 'Product not found',
        timestamp: new Date().toISOString(),
        requestId: uuidv4()
      });
    }

    // Find image in product
    const imageIndex = product.images.findIndex(img => img.id === imageId);
    if (imageIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'IMAGE_NOT_FOUND',
        message: 'Image not found',
        timestamp: new Date().toISOString(),
        requestId: uuidv4()
      });
    }

    // Delete from Cloudinary
    try {
      await deleteImage(imageId);
    } catch (cloudinaryError) {
      console.warn('Failed to delete from Cloudinary:', cloudinaryError.message);
    }

    // Remove from product
    product.images.splice(imageIndex, 1);
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product image deleted successfully',
      data: {
        remainingImages: product.images.length
      },
      timestamp: new Date().toISOString(),
      requestId: uuidv4()
    });

  } catch (error) {
    console.error('Delete product image error:', error);
    
    res.status(500).json({
      success: false,
      error: 'DELETE_FAILED',
      message: 'Failed to delete product image',
      timestamp: new Date().toISOString(),
      requestId: uuidv4()
    });
  }
});

// Upload Document (Admin only)
router.post('/documents', authenticateToken, requireAdmin, uploadSingle('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'NO_FILE_PROVIDED',
        message: 'Please provide a document',
        timestamp: new Date().toISOString(),
        requestId: uuidv4()
      });
    }

    const { category = 'general', description } = req.body;

    // Upload to Cloudinary
    const uploadResult = await uploadDocument(req.file.buffer, {
      folder: `rg-publication/documents/${category}`,
      public_id: `doc_${Date.now()}_${req.file.originalname.split('.')[0]}`
    });

    // You could save document info to database here if needed
    // const document = new Document({ ... });

    res.status(200).json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        document: {
          id: uploadResult.id,
          url: uploadResult.url,
          originalName: req.file.originalname,
          size: uploadResult.bytes,
          category,
          description,
          uploadedBy: req.user.id,
          uploadedAt: new Date()
        }
      },
      timestamp: new Date().toISOString(),
      requestId: uuidv4()
    });

  } catch (error) {
    console.error('Upload document error:', error);
    
    res.status(500).json({
      success: false,
      error: 'UPLOAD_FAILED',
      message: 'Failed to upload document',
      timestamp: new Date().toISOString(),
      requestId: uuidv4()
    });
  }
});

// Get Upload Statistics (Admin only)
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // This would require implementing a File/Upload model to track uploads
    // For now, return basic stats from existing data
    
    const [userAvatarCount, productImageCount] = await Promise.all([
      User.countDocuments({ avatar: { $exists: true, $ne: null } }),
      Product.aggregate([
        { $unwind: '$images' },
        { $count: 'total' }
      ])
    ]);

    const stats = {
      userAvatars: userAvatarCount,
      productImages: productImageCount[0]?.total || 0,
      totalUploads: userAvatarCount + (productImageCount[0]?.total || 0)
    };

    res.status(200).json({
      success: true,
      data: {
        uploadStats: stats
      },
      timestamp: new Date().toISOString(),
      requestId: uuidv4()
    });

  } catch (error) {
    console.error('Get upload stats error:', error);
    
    res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to fetch upload statistics',
      timestamp: new Date().toISOString(),
      requestId: uuidv4()
    });
  }
});

module.exports = router;
