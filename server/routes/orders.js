const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const pool = require("../config/db");

// Create order
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { items, totalAmount, shippingAddress, paymentMethod } = req.body;
    const connection = await pool.getConnection();

    // Start transaction
    await connection.beginTransaction();

    try {
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
      connection.release();

      res.json({ message: "Order created successfully", orderId });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error("Order error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get user orders
router.get("/", authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();

    // Get the basic order information
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

    connection.release();
    res.json(orders);
  } catch (error) {
    console.error("Orders error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
});

// Get single order
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();

    // Get basic order info
    const [orders] = await connection.execute(
      "SELECT * FROM orders WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.userId]
    );

    if (orders.length === 0) {
      connection.release();
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

    connection.release();
    res.json(order);
  } catch (error) {
    console.error("Order error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;