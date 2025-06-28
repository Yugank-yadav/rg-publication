const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Configure multer for file uploads
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images (JPEG, PNG, GIF, WebP) and documents (PDF, DOC, DOCX) are allowed.'));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files per request
  },
  fileFilter: fileFilter
});

// Middleware for single file upload
const uploadSingle = (fieldName) => {
  return (req, res, next) => {
    const singleUpload = upload.single(fieldName);
    
    singleUpload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            error: 'FILE_TOO_LARGE',
            message: 'File size cannot exceed 10MB',
            timestamp: new Date().toISOString(),
            requestId: uuidv4()
          });
        }
        
        return res.status(400).json({
          success: false,
          error: 'UPLOAD_ERROR',
          message: err.message,
          timestamp: new Date().toISOString(),
          requestId: uuidv4()
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_FILE',
          message: err.message,
          timestamp: new Date().toISOString(),
          requestId: uuidv4()
        });
      }
      
      next();
    });
  };
};

// Middleware for multiple file upload
const uploadMultiple = (fieldName, maxCount = 5) => {
  return (req, res, next) => {
    const multipleUpload = upload.array(fieldName, maxCount);
    
    multipleUpload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            error: 'FILE_TOO_LARGE',
            message: 'File size cannot exceed 10MB',
            timestamp: new Date().toISOString(),
            requestId: uuidv4()
          });
        }
        
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            success: false,
            error: 'TOO_MANY_FILES',
            message: `Cannot upload more than ${maxCount} files`,
            timestamp: new Date().toISOString(),
            requestId: uuidv4()
          });
        }
        
        return res.status(400).json({
          success: false,
          error: 'UPLOAD_ERROR',
          message: err.message,
          timestamp: new Date().toISOString(),
          requestId: uuidv4()
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_FILE',
          message: err.message,
          timestamp: new Date().toISOString(),
          requestId: uuidv4()
        });
      }
      
      next();
    });
  };
};

// Middleware for fields with different file types
const uploadFields = (fields) => {
  return (req, res, next) => {
    const fieldsUpload = upload.fields(fields);
    
    fieldsUpload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            error: 'FILE_TOO_LARGE',
            message: 'File size cannot exceed 10MB',
            timestamp: new Date().toISOString(),
            requestId: uuidv4()
          });
        }
        
        return res.status(400).json({
          success: false,
          error: 'UPLOAD_ERROR',
          message: err.message,
          timestamp: new Date().toISOString(),
          requestId: uuidv4()
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_FILE',
          message: err.message,
          timestamp: new Date().toISOString(),
          requestId: uuidv4()
        });
      }
      
      next();
    });
  };
};

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadFields
};
