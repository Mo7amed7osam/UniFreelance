const multer = require('multer');
const { ensureDirectory, getTopupUploadsDir } = require('../utils/storagePaths');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = getTopupUploadsDir();
    ensureDirectory(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Only PNG, JPG, JPEG, or WEBP files are allowed'));
  }
  return cb(null, true);
};

const uploadTopupScreenshot = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = {
  uploadTopupScreenshot,
};
