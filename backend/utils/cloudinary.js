const cloudinary = require('cloudinary').v2;
const { v4: uuidv4 } = require('uuid');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'rg-publication',
  api_key: process.env.CLOUDINARY_API_KEY || 'your-api-key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'your-api-secret'
});

// Upload image to Cloudinary
const uploadImage = async (buffer, options = {}) => {
  try {
    const {
      folder = 'rg-publication',
      transformation = {},
      public_id,
      resource_type = 'image'
    } = options;

    const uploadOptions = {
      folder,
      resource_type,
      public_id: public_id || `${folder}_${uuidv4()}`,
      transformation: {
        quality: 'auto',
        fetch_format: 'auto',
        ...transformation
      }
    };

    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve({
              id: result.public_id,
              url: result.secure_url,
              width: result.width,
              height: result.height,
              format: result.format,
              bytes: result.bytes,
              created_at: result.created_at
            });
          }
        }
      ).end(buffer);
    });
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

// Upload multiple images
const uploadMultipleImages = async (files, options = {}) => {
  try {
    const uploadPromises = files.map((file, index) => {
      const fileOptions = {
        ...options,
        public_id: options.public_id ? `${options.public_id}_${index}` : undefined
      };
      return uploadImage(file.buffer, fileOptions);
    });

    return await Promise.all(uploadPromises);
  } catch (error) {
    throw new Error(`Multiple upload failed: ${error.message}`);
  }
};

// Delete image from Cloudinary
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error(`Cloudinary delete failed: ${error.message}`);
  }
};

// Delete multiple images
const deleteMultipleImages = async (publicIds) => {
  try {
    const result = await cloudinary.api.delete_resources(publicIds);
    return result;
  } catch (error) {
    throw new Error(`Multiple delete failed: ${error.message}`);
  }
};

// Generate transformation URL
const generateTransformationUrl = (publicId, transformations) => {
  try {
    return cloudinary.url(publicId, {
      transformation: transformations,
      secure: true
    });
  } catch (error) {
    throw new Error(`URL generation failed: ${error.message}`);
  }
};

// Get image details
const getImageDetails = async (publicId) => {
  try {
    const result = await cloudinary.api.resource(publicId);
    return {
      id: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
      created_at: result.created_at
    };
  } catch (error) {
    throw new Error(`Get image details failed: ${error.message}`);
  }
};

// Upload document (PDF, DOC, etc.)
const uploadDocument = async (buffer, options = {}) => {
  try {
    const {
      folder = 'rg-publication/documents',
      public_id,
      resource_type = 'raw'
    } = options;

    const uploadOptions = {
      folder,
      resource_type,
      public_id: public_id || `doc_${uuidv4()}`
    };

    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve({
              id: result.public_id,
              url: result.secure_url,
              format: result.format,
              bytes: result.bytes,
              created_at: result.created_at
            });
          }
        }
      ).end(buffer);
    });
  } catch (error) {
    throw new Error(`Document upload failed: ${error.message}`);
  }
};

// Predefined transformations
const transformations = {
  avatar: {
    width: 200,
    height: 200,
    crop: 'fill',
    gravity: 'face',
    radius: 'max',
    quality: 'auto',
    format: 'auto'
  },
  productImage: {
    width: 800,
    height: 1200,
    crop: 'fit',
    quality: 'auto',
    format: 'auto'
  },
  thumbnail: {
    width: 300,
    height: 300,
    crop: 'fill',
    quality: 'auto',
    format: 'auto'
  },
  banner: {
    width: 1200,
    height: 400,
    crop: 'fill',
    quality: 'auto',
    format: 'auto'
  }
};

module.exports = {
  uploadImage,
  uploadMultipleImages,
  deleteImage,
  deleteMultipleImages,
  generateTransformationUrl,
  getImageDetails,
  uploadDocument,
  transformations
};
