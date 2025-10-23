const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/uploads/categories", express.static("uploads/categories"));
app.use("/uploads/products", express.static("uploads/products"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 15 * 1024 * 1024,
  },
});

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "fashion_store",
};

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  try {
    const user = jwt.verify(token, JWT_SECRET);
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid token" });
  }
};

// Routes

// User Registration
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const connection = await mysql.createConnection(dbConfig);

    // Check if user exists
    const [existing] = await connection.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await connection.execute(
      "INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, phone]
    );

    const token = jwt.sign({ userId: result.insertId, email }, JWT_SECRET);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: { id: result.insertId, name, email, phone },
    });

    await connection.end();
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// User Login
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const connection = await mysql.createConnection(dbConfig);

    const [users] = await connection.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id, email }, JWT_SECRET);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });

    await connection.end();
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all categories
app.get("/api/categories", async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [categories] = await connection.execute("SELECT * FROM categories");
    await connection.end();
    res.json(categories);
  } catch (error) {
    console.error("Categories error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all products with filtering
app.get("/api/products", async (req, res) => {
  try {
    const { category, featured, search } = req.query;
    const connection = await mysql.createConnection(dbConfig);

    let query = `
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE 1=1
    `;
    const params = [];

    if (category && category !== "all") {
      query += " AND c.name = ?";
      params.push(category);
    }

    if (featured === "true") {
      query += " AND p.is_featured = TRUE";
    }

    if (search) {
      query += " AND (p.name LIKE ? OR p.description LIKE ? OR p.brand LIKE ?)";
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += " ORDER BY p.created_at DESC";

    const [products] = await connection.execute(query, params);
    await connection.end();
    res.json(products);
  } catch (error) {
    console.error("Products error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get single product
app.get("/api/products/:id", async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [products] = await connection.execute(
      "SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?",
      [req.params.id]
    );

    if (products.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    await connection.end();
    res.json(products[0]);
  } catch (error) {
    console.error("Product error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add to cart
app.post("/api/cart", authenticateToken, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const connection = await mysql.createConnection(dbConfig);

    // Check if item already in cart
    const [existing] = await connection.execute(
      "SELECT * FROM cart WHERE user_id = ? AND product_id = ?",
      [req.user.userId, productId]
    );

    if (existing.length > 0) {
      // Update quantity
      await connection.execute(
        "UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?",
        [quantity, req.user.userId, productId]
      );
    } else {
      // Add new item
      await connection.execute(
        "INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)",
        [req.user.userId, productId, quantity]
      );
    }

    await connection.end();
    res.json({ message: "Product added to cart" });
  } catch (error) {
    console.error("Cart error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get user cart
app.get("/api/cart", authenticateToken, async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [cartItems] = await connection.execute(
      `
      SELECT c.*, p.name, p.price, p.image, p.stock_quantity 
      FROM cart c 
      JOIN products p ON c.product_id = p.id 
      WHERE c.user_id = ?
    `,
      [req.user.userId]
    );

    await connection.end();
    res.json(cartItems);
  } catch (error) {
    console.error("Cart error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.put("/api/cart/:id", authenticateToken, async (req, res) => {
  try {
    const { quantity } = req.body;
    const connection = await mysql.createConnection(dbConfig);

    await connection.execute(
      "UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?",
      [quantity, req.params.id, req.user.userId]
    );

    await connection.end();
    res.json({ message: "Cart updated successfully" });
  } catch (error) {
    console.error("Cart update error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Remove item from cart
app.delete("/api/cart/:id", authenticateToken, async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);

    await connection.execute("DELETE FROM cart WHERE id = ? AND user_id = ?", [
      req.params.id,
      req.user.userId,
    ]);

    await connection.end();
    res.json({ message: "Item removed from cart" });
  } catch (error) {
    console.error("Cart delete error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create order
app.post("/api/orders", authenticateToken, async (req, res) => {
  try {
    const { items, totalAmount, shippingAddress, paymentMethod } = req.body;
    const connection = await mysql.createConnection(dbConfig);

    // Start transaction
    await connection.beginTransaction();

    // Create order
    const [orderResult] = await connection.execute(
      "INSERT INTO orders (user_id, total_amount, shipping_address, payment_method) VALUES (?, ?, ?, ?)",
      [req.user.userId, totalAmount, shippingAddress, paymentMethod]
    );

    const orderId = orderResult.insertId;

    // Add order items
    for (const item of items) {
      await connection.execute(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
        [orderId, item.product_id, item.quantity, item.price]
      );

      // Update product stock
      await connection.execute(
        "UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?",
        [item.quantity, item.product_id]
      );
    }

    // Clear cart
    await connection.execute("DELETE FROM cart WHERE user_id = ?", [
      req.user.userId,
    ]);

    await connection.commit();
    await connection.end();

    res.json({ message: "Order created successfully", orderId });
  } catch (error) {
    await connection.rollback();
    console.error("Order error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/orders", authenticateToken, async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);

    // First, get the basic order information
    const [orders] = await connection.execute(
      "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.userId]
    );

    // Then, for each order, get the order items
    for (let order of orders) {
      const [items] = await connection.execute(
        `SELECT oi.product_id, oi.quantity, oi.price, p.name, p.image 
         FROM order_items oi 
         JOIN products p ON oi.product_id = p.id 
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }

    await connection.end();
    res.json(orders);
  } catch (error) {
    console.error("Orders error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
});

// Also fix the single order endpoint
app.get("/api/orders/:id", authenticateToken, async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);

    // Get basic order info
    const [orders] = await connection.execute(
      "SELECT * FROM orders WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.userId]
    );

    if (orders.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const order = orders[0];

    // Get order items
    const [items] = await connection.execute(
      `SELECT oi.product_id, oi.quantity, oi.price, p.name, p.image 
       FROM order_items oi 
       JOIN products p ON oi.product_id = p.id 
       WHERE oi.order_id = ?`,
      [order.id]
    );

    order.items = items;

    await connection.end();
    res.json(order);
  } catch (error) {
    console.error("Order error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update order status (for admin)
app.put("/api/orders/:id/status", authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const connection = await mysql.createConnection(dbConfig);

    await connection.execute("UPDATE orders SET status = ? WHERE id = ?", [
      status,
      req.params.id,
    ]);

    await connection.end();
    res.json({ message: "Order status updated" });
  } catch (error) {
    console.error("Order status error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
