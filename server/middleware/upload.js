const multer = require("multer");
const path = require("path");
const fs = require("fs");

const baseUploadPath = path.join(__dirname, "../uploads");
fs.mkdirSync(baseUploadPath, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = baseUploadPath;

    if (req.originalUrl.includes('/admin/categories')) {
      uploadPath = path.join(uploadPath, "categories");
    } else if (req.originalUrl.includes('/admin/products')) {
      uploadPath = path.join(uploadPath, "products");
    }
 
    fs.mkdirSync(uploadPath, { recursive: true });
    
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const fileExt = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = uniqueSuffix + fileExt;
    
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|avif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024,
  },
  fileFilter,
});

module.exports = upload;