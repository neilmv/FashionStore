const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads"), {
  setHeaders: (res, path) => {
    res.setHeader('Cache-Control', 'no-cache');
  }
}));

app.use("/uploads", (req, res, next) => {
  console.log("📤 Static file request:", req.url);
  next();
});

app.get("/", (req, res) => {
  res.json({ 
    message: "Fashion Store API Server is running!",
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ 
    message: "Server is healthy", 
    timestamp: new Date().toISOString() 
  });
});

// Test uploads directory
app.get("/api/debug/uploads", (req, res) => {
  const fs = require("fs");
  const uploadsPath = path.join(__dirname, "uploads");
  
  try {
    const categoriesPath = path.join(uploadsPath, "categories");
    const files = fs.readdirSync(categoriesPath);
    
    res.json({
      uploadsPath,
      categoriesPath,
      files: files
    });
  } catch (error) {
    res.json({
      uploadsPath,
      error: error.message,
      exists: fs.existsSync(uploadsPath)
    });
  }
});

// Import and use routes
try {
  const authRoutes = require("./routes/auth");
  const userRoutes = require("./routes/users");
  const productRoutes = require("./routes/products");
  const categoryRoutes = require("./routes/categories");
  const cartRoutes = require("./routes/cart");
  const orderRoutes = require("./routes/orders");
  const adminRoutes = require("./routes/admin");

  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/categories", categoryRoutes);
  app.use("/api/cart", cartRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/admin", adminRoutes);
  
  console.log("✅ All routes loaded successfully");
} catch (error) {
  console.error("❌ Error loading routes:", error.message);
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

app.use((error, req, res, next) => {
  console.error("Server error:", error);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📁 Uploads directory: ${path.join(__dirname, "uploads")}`);
});