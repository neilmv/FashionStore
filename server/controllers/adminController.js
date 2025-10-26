const pool = require("../config/db");
const bcrypt = require("bcryptjs");

// Dashboard Statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      recentOrders,
      lowStockProducts,
    ] = await Promise.all([
      connection.execute("SELECT COUNT(*) as count FROM users"),
      connection.execute("SELECT COUNT(*) as count FROM products"),
      connection.execute("SELECT COUNT(*) as count FROM orders"),
      connection.execute(
        "SELECT COALESCE(SUM(total_amount), 0) as revenue FROM orders WHERE status = 'delivered'"
      ),
      connection.execute(`
        SELECT o.*, u.name as user_name 
        FROM orders o 
        JOIN users u ON o.user_id = u.id 
        ORDER BY o.created_at DESC 
        LIMIT 10
      `),
      connection.execute(
        "SELECT * FROM products WHERE stock_quantity < 10 ORDER BY stock_quantity ASC LIMIT 10"
      ),
    ]);

    connection.release();

    res.json({
      stats: {
        totalUsers: totalUsers[0][0].count,
        totalProducts: totalProducts[0][0].count,
        totalOrders: totalOrders[0][0].count,
        totalRevenue: totalRevenue[0][0].revenue,
      },
      recentOrders: recentOrders[0],
      lowStockProducts: lowStockProducts[0],
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// User Management
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const offset = (page - 1) * limit;

    const connection = await pool.getConnection();

    let query = `
      SELECT id, name, email, phone, role, created_at 
      FROM users 
      WHERE 1=1
    `;
    let countQuery = `SELECT COUNT(*) as total FROM users WHERE 1=1`;
    const params = [];
    const countParams = [];

    if (search) {
      query += " AND (name LIKE ? OR email LIKE ?)";
      countQuery += " AND (name LIKE ? OR email LIKE ?)";
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
      countParams.push(searchTerm, searchTerm);
    }

    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), offset);

    const [users] = await connection.execute(query, params);
    const [totalResult] = await connection.execute(countQuery, countParams);

    connection.release();

    res.json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalResult[0].total / limit),
        totalUsers: totalResult[0].total,
        hasNext: page < Math.ceil(totalResult[0].total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const connection = await pool.getConnection();

    await connection.execute("UPDATE users SET role = ? WHERE id = ?", [
      role,
      userId,
    ]);

    connection.release();
    res.json({ message: "User role updated successfully" });
  } catch (error) {
    console.error("Update user role error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const connection = await pool.getConnection();

    // Check if user exists
    const [users] = await connection.execute(
      "SELECT id FROM users WHERE id = ?",
      [userId]
    );

    if (users.length === 0) {
      connection.release();
      return res.status(404).json({ error: "User not found" });
    }

    await connection.execute("DELETE FROM users WHERE id = ?", [userId]);
    connection.release();

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Product Management
// Add this to the Product Management section in adminController.js
exports.getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", category = "" } = req.query;
    const offset = (page - 1) * limit;

    const connection = await pool.getConnection();

    let query = `
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE 1=1
    `;
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE 1=1
    `;
    const params = [];
    const countParams = [];

    if (search) {
      query += " AND (p.name LIKE ? OR p.description LIKE ? OR p.brand LIKE ?)";
      countQuery += " AND (p.name LIKE ? OR p.description LIKE ? OR p.brand LIKE ?)";
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
      countParams.push(searchTerm, searchTerm, searchTerm);
    }

    if (category) {
      query += " AND p.category_id = ?";
      countQuery += " AND p.category_id = ?";
      params.push(parseInt(category));
      countParams.push(parseInt(category));
    }

    query += " ORDER BY p.created_at DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), offset);

    const [products] = await connection.execute(query, params);
    const [totalResult] = await connection.execute(countQuery, countParams);

    connection.release();

    res.json({
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalResult[0].total / limit),
        totalProducts: totalResult[0].total,
        hasNext: page < Math.ceil(totalResult[0].total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      original_price,
      category_id,
      size,
      color,
      brand,
      stock_quantity,
      is_featured = 0,
    } = req.body;

    const image = req.file ? `/uploads/products/${req.file.filename}` : null;

    const connection = await pool.getConnection();

    const [result] = await connection.execute(
      `INSERT INTO products 
       (name, description, price, original_price, category_id, size, color, brand, image, stock_quantity, is_featured) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        description,
        price,
        original_price,
        category_id,
        size,
        color,
        brand,
        image,
        stock_quantity,
        is_featured,
      ]
    );

    // Get the created product with category name
    const [products] = await connection.execute(
      `SELECT p.*, c.name as category_name 
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id 
       WHERE p.id = ?`,
      [result.insertId]
    );

    connection.release();
    res.status(201).json({
      message: "Product created successfully",
      product: products[0],
    });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const {
      name,
      description,
      price,
      original_price,
      category_id,
      size,
      color,
      brand,
      stock_quantity,
      is_featured,
    } = req.body;

    const connection = await pool.getConnection();

    // Check if product exists
    const [existing] = await connection.execute(
      "SELECT id FROM products WHERE id = ?",
      [productId]
    );

    if (existing.length === 0) {
      connection.release();
      return res.status(404).json({ error: "Product not found" });
    }

    // Build update query dynamically
    let updateFields = [];
    let params = [];

    const fields = {
      name,
      description,
      price,
      original_price,
      category_id,
      size,
      color,
      brand,
      stock_quantity,
      is_featured,
    };

    Object.keys(fields).forEach((key) => {
      if (fields[key] !== undefined) {
        updateFields.push(`${key} = ?`);
        params.push(fields[key]);
      }
    });

    // Handle image update
    if (req.file) {
      updateFields.push("image = ?");
      params.push(`/uploads/products/${req.file.filename}`);
    }

    params.push(productId);

    await connection.execute(
      `UPDATE products SET ${updateFields.join(", ")} WHERE id = ?`,
      params
    );

    // Get updated product
    const [products] = await connection.execute(
      `SELECT p.*, c.name as category_name 
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id 
       WHERE p.id = ?`,
      [productId]
    );

    connection.release();
    res.json({
      message: "Product updated successfully",
      product: products[0],
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const connection = await pool.getConnection();

    // Check if product exists
    const [existing] = await connection.execute(
      "SELECT id FROM products WHERE id = ?",
      [productId]
    );

    if (existing.length === 0) {
      connection.release();
      return res.status(404).json({ error: "Product not found" });
    }

    await connection.execute("DELETE FROM products WHERE id = ?", [productId]);
    connection.release();

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Category Management
// Add this to your adminController.js file
exports.getAllCategories = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [categories] = await connection.execute(
      "SELECT * FROM categories ORDER BY name"
    );
    connection.release();

    res.json({
      categories,
      message: "Categories fetched successfully",
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "Category image is required" });
    }
    // Verify file exists on disk
    const fs = require("fs");
    const fileExists = fs.existsSync(req.file.path);
    console.log("📂 File exists on disk:", fileExists);

    if (!fileExists) {
      return res.status(500).json({ error: "Failed to save image file" });
    }

    const image = `/uploads/categories/${req.file.filename}`;
    console.log("💾 Image path to save in DB:", image);

    const connection = await pool.getConnection();

    console.log("💾 Inserting into database...");
    const [result] = await connection.execute(
      "INSERT INTO categories (name, description, image) VALUES (?, ?, ?)",
      [name, description, image]
    );

    const [categories] = await connection.execute(
      "SELECT * FROM categories WHERE id = ?",
      [result.insertId]
    );

    connection.release();

    res.status(201).json({
      message: "Category created successfully",
      category: categories[0],
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, description } = req.body;
    const connection = await pool.getConnection();

    const [existing] = await connection.execute(
      "SELECT id FROM categories WHERE id = ?",
      [categoryId]
    );

    if (existing.length === 0) {
      connection.release();
      return res.status(404).json({ error: "Category not found" });
    }

    let updateFields = [];
    let params = [];

    if (name !== undefined) {
      updateFields.push("name = ?");
      params.push(name);
    }
    if (description !== undefined) {
      updateFields.push("description = ?");
      params.push(description);
    }
    if (req.file) {
      const imagePath = `/uploads/categories/${req.file.filename}`;
      updateFields.push("image = ?");
      params.push(imagePath);
      console.log("💾 New image path:", imagePath);
    }

    params.push(categoryId);


    await connection.execute(
      `UPDATE categories SET ${updateFields.join(", ")} WHERE id = ?`,
      params
    );

    const [categories] = await connection.execute(
      "SELECT * FROM categories WHERE id = ?",
      [categoryId]
    );

    connection.release();

    res.json({
      message: "Category updated successfully",
      category: categories[0],
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const connection = await pool.getConnection();

    // Check if category exists and has no products
    const [existing] = await connection.execute(
      "SELECT id FROM categories WHERE id = ?",
      [categoryId]
    );
    const [products] = await connection.execute(
      "SELECT id FROM products WHERE category_id = ?",
      [categoryId]
    );

    if (existing.length === 0) {
      connection.release();
      return res.status(404).json({ error: "Category not found" });
    }

    if (products.length > 0) {
      connection.release();
      return res
        .status(400)
        .json({ error: "Cannot delete category with existing products" });
    }

    await connection.execute("DELETE FROM categories WHERE id = ?", [
      categoryId,
    ]);
    connection.release();

    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Order Management
exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = "" } = req.query;
    const offset = (page - 1) * limit;

    const connection = await pool.getConnection();

    let query = `
      SELECT o.*, u.name as user_name, u.email as user_email 
      FROM orders o 
      JOIN users u ON o.user_id = u.id 
      WHERE 1=1
    `;
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM orders o 
      JOIN users u ON o.user_id = u.id 
      WHERE 1=1
    `;
    const params = [];
    const countParams = [];

    if (status) {
      query += " AND o.status = ?";
      countQuery += " AND o.status = ?";
      params.push(status);
      countParams.push(status);
    }

    query += " ORDER BY o.created_at DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), offset);

    const [orders] = await connection.execute(query, params);
    const [totalResult] = await connection.execute(countQuery, countParams);

    // Get order items for each order
    for (let order of orders) {
      const [items] = await connection.execute(
        `SELECT oi.*, p.name, p.image 
         FROM order_items oi 
         JOIN products p ON oi.product_id = p.id 
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }

    connection.release();

    res.json({
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalResult[0].total / limit),
        totalOrders: totalResult[0].total,
        hasNext: page < Math.ceil(totalResult[0].total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "pending",
      "confirmed",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const connection = await pool.getConnection();

    // Check if order exists
    const [orders] = await connection.execute(
      "SELECT id FROM orders WHERE id = ?",
      [orderId]
    );

    if (orders.length === 0) {
      connection.release();
      return res.status(404).json({ error: "Order not found" });
    }

    await connection.execute("UPDATE orders SET status = ? WHERE id = ?", [
      status,
      orderId,
    ]);

    connection.release();
    res.json({ message: "Order status updated successfully" });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const connection = await pool.getConnection();

    // Get order info
    const [orders] = await connection.execute(
      `SELECT o.*, u.name as user_name, u.email as user_email, u.phone as user_phone 
       FROM orders o 
       JOIN users u ON o.user_id = u.id 
       WHERE o.id = ?`,
      [orderId]
    );

    if (orders.length === 0) {
      connection.release();
      return res.status(404).json({ error: "Order not found" });
    }

    const order = orders[0];

    // Get order items
    const [items] = await connection.execute(
      `SELECT oi.*, p.name, p.image, p.brand 
       FROM order_items oi 
       JOIN products p ON oi.product_id = p.id 
       WHERE oi.order_id = ?`,
      [orderId]
    );

    order.items = items;

    connection.release();
    res.json(order);
  } catch (error) {
    console.error("Get order details error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
