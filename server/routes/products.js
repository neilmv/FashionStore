const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// Get all products
router.get("/", async (req, res) => {
  try {
    const { category, featured, search } = req.query;
    const connection = await pool.getConnection();

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
    connection.release();
    
    // Return just the products array (not nested)
    res.json(products);
  } catch (error) {
    console.error("Products error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get single product
router.get("/:id", async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [products] = await connection.execute(
      "SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?",
      [req.params.id]
    );

    if (products.length === 0) {
      connection.release();
      return res.status(404).json({ error: "Product not found" });
    }

    connection.release();
    res.json(products[0]);
  } catch (error) {
    console.error("Product error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;