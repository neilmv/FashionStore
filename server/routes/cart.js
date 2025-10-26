const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const pool = require("../config/db");

// Add to cart
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const connection = await pool.getConnection();

    // Check if product exists
    const [products] = await connection.execute(
      "SELECT stock_quantity FROM products WHERE id = ?",
      [productId]
    );

    if (products.length === 0) {
      connection.release();
      return res.status(404).json({ error: "Product not found" });
    }

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

    connection.release();
    res.json({ message: "Product added to cart" });
  } catch (error) {
    console.error("Cart error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get user cart
router.get("/", authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [cartItems] = await connection.execute(
      `
      SELECT c.*, p.name, p.price, p.image, p.stock_quantity, p.brand
      FROM cart c 
      JOIN products p ON c.product_id = p.id 
      WHERE c.user_id = ?
      `,
      [req.user.userId]
    );

    connection.release();
    res.json(cartItems);
  } catch (error) {
    console.error("Cart error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update cart item quantity
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { quantity } = req.body;
    const connection = await pool.getConnection();

    await connection.execute(
      "UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?",
      [quantity, req.params.id, req.user.userId]
    );

    connection.release();
    res.json({ message: "Cart updated successfully" });
  } catch (error) {
    console.error("Cart update error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Remove item from cart
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();

    await connection.execute("DELETE FROM cart WHERE id = ? AND user_id = ?", [
      req.params.id,
      req.user.userId,
    ]);

    connection.release();
    res.json({ message: "Item removed from cart" });
  } catch (error) {
    console.error("Cart delete error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Clear cart
router.delete("/", authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();

    await connection.execute("DELETE FROM cart WHERE user_id = ?", [
      req.user.userId,
    ]);

    connection.release();
    res.json({ message: "Cart cleared successfully" });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;