const express = require("express");
const router = express.Router();
const { authenticateToken, authorizeAdmin } = require("../middleware/auth");
const upload = require("../middleware/upload");
const adminController = require("../controllers/adminController");

// Dashboard
router.get(
  "/dashboard/stats",
  authenticateToken,
  authorizeAdmin,
  adminController.getDashboardStats
);

// User Management
router.get(
  "/users",
  authenticateToken,
  authorizeAdmin,
  adminController.getAllUsers
);
router.put(
  "/users/:userId/role",
  authenticateToken,
  authorizeAdmin,
  adminController.updateUserRole
);
router.delete(
  "/users/:userId",
  authenticateToken,
  authorizeAdmin,
  adminController.deleteUser
);

// Product Management
router.get(
  "/products",
  authenticateToken,
  authorizeAdmin,
  adminController.getAllProducts
);
router.post(
  "/products",
  authenticateToken,
  authorizeAdmin,
  upload.single("image"),
  adminController.createProduct
);
router.put(
  "/products/:productId",
  authenticateToken,
  authorizeAdmin,
  upload.single("image"),
  adminController.updateProduct
);
router.delete(
  "/products/:productId",
  authenticateToken,
  authorizeAdmin,
  adminController.deleteProduct
);

// Category Management
router.get(
  "/categories",
  authenticateToken,
  authorizeAdmin,
  adminController.getAllCategories
);
router.post(
  "/categories",
  authenticateToken,
  authorizeAdmin,
  upload.single("image"),
  adminController.createCategory
);
router.put(
  "/categories/:categoryId",
  authenticateToken,
  authorizeAdmin,
  upload.single("image"),
  adminController.updateCategory
);
router.delete(
  "/categories/:categoryId",
  authenticateToken,
  authorizeAdmin,
  adminController.deleteCategory
);

// Order Management
router.get(
  "/orders",
  authenticateToken,
  authorizeAdmin,
  adminController.getAllOrders
);
router.get(
  "/orders/:orderId",
  authenticateToken,
  authorizeAdmin,
  adminController.getOrderDetails
);
router.put(
  "/orders/:orderId/status",
  authenticateToken,
  authorizeAdmin,
  adminController.updateOrderStatus
);

module.exports = router;
