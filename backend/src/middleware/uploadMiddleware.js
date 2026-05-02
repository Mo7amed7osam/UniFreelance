const multer = require('multer');
const path = require('path');
const { ensureDirectory, getInterviewUploadsDir, getUploadsRoot } = require('../utils/storagePaths');

// Configure storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Set destination based on file type
    const fileType = file.mimetype.split('/')[0];
    let uploadPath = path.join(getUploadsRoot(), 'cvs');
    if (fileType === 'video') {
      uploadPath = getInterviewUploadsDir();
    } else if (fileType === 'image') {
      uploadPath = path.join(getUploadsRoot(), 'photos');
    }
    ensureDirectory(getUploadsRoot());
    ensureDirectory(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Set the filename to be unique
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

// Initialize multer with the defined storage
const upload = multer({ storage });

// Middleware for handling file uploads
const uploadMiddleware = (req, res, next) => {
  // Check if the request has files
  if (!req.files) {
    return res.status(400).json({ message: 'No files uploaded.' });
  }
  next();
};

// Export the upload middleware and the upload instance
module.exports = {
  upload,
  uploadMiddleware,
};
