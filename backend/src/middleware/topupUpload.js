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

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../private/topups');
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
