const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ensureDirectory = (dirPath) => {
  if (fs.existsSync(dirPath)) {
    const stat = fs.lstatSync(dirPath);
    if (!stat.isDirectory()) {
      const backupPath = `${dirPath}.bak-${Date.now()}`;
      fs.renameSync(dirPath, backupPath);
    }
  }
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Configure storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Set destination based on file type
    const fileType = file.mimetype.split('/')[0];
    const uploadPath = fileType === 'video' ? 'uploads/videos' : 'uploads/cvs';
    const fullPath = path.join(__dirname, '../../', uploadPath);
    const uploadsRoot = path.join(__dirname, '../../', 'uploads');
    ensureDirectory(uploadsRoot);
    ensureDirectory(fullPath);
    cb(null, fullPath);
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
