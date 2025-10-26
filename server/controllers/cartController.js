const pool = require("../config/db");

exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const connection = await pool.getConnection();

    // Check if product exists and has enough stock
    const [products] = await connection.execute(
      "SELECT stock_quantity FROM products WHERE id = ?",
      [productId]
    );

    if (products.length === 0) {
      connection.release();
      return res.status(404).json({ error: "Product not found" });
    }

    const product = products[0];
    
    // Check if item already in cart
    const [existing] = await connection.execute(
      "SELECT * FROM cart WHERE user_id = ? AND product_id = ?",
      [req.user.userId, productId]
    );

    const newQuantity = existing.length > 0 ? 
      existing[0].quantity + quantity : quantity;

    // Check stock availability
    if (newQuantity > product.stock_quantity) {
      connection.release();
      return res.status(400).json({ 
        error: "Not enough stock available",
        availableStock: product.stock_quantity
      });
    }

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
};

exports.getUserCart = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [cartItems] = await connection.execute(
      `
      SELECT c.*, p.name, p.price, p.image, p.stock_quantity, p.brand,
             (c.quantity * p.price) as item_total
      FROM cart c 
      JOIN products p ON c.product_id = p.id 
      WHERE c.user_id = ?
      `,
      [req.user.userId]
    );

    // Calculate cart total
    const cartTotal = cartItems.reduce((total, item) => {
      return total + (item.quantity * item.price);
    }, 0);

    connection.release();
    res.json({
      items: cartItems,
      total: cartTotal,
      itemCount: cartItems.length
    });
  } catch (error) {
    console.error("Cart error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const connection = await pool.getConnection();

    // Check if cart item exists and get product info
    const [cartItems] = await connection.execute(
      `SELECT c.*, p.stock_quantity 
       FROM cart c 
       JOIN products p ON c.product_id = p.id 
       WHERE c.id = ? AND c.user_id = ?`,
      [req.params.id, req.user.userId]
    );

    if (cartItems.length === 0) {
      connection.release();
      return res.status(404).json({ error: "Cart item not found" });
    }

    const cartItem = cartItems[0];

    // Check stock availability
    if (quantity > cartItem.stock_quantity) {
      connection.release();
      return res.status(400).json({ 
        error: "Not enough stock available",
        availableStock: cartItem.stock_quantity
      });
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      await connection.execute(
        "DELETE FROM cart WHERE id = ? AND user_id = ?",
        [req.params.id, req.user.userId]
      );
    } else {
      // Update quantity
      await connection.execute(
        "UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?",
        [quantity, req.params.id, req.user.userId]
      );
    }

    connection.release();
    res.json({ message: "Cart updated successfully" });
  } catch (error) {
    console.error("Cart update error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [result] = await connection.execute(
      "DELETE FROM cart WHERE id = ? AND user_id = ?", 
      [req.params.id, req.user.userId]
    );

    if (result.affectedRows === 0) {
      connection.release();
      return res.status(404).json({ error: "Cart item not found" });
    }

    connection.release();
    res.json({ message: "Item removed from cart" });
  } catch (error) {
    console.error("Cart delete error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const connection = await pool.getConnection();

    await connection.execute(
      "DELETE FROM cart WHERE user_id = ?", 
      [req.user.userId]
    );

    connection.release();
    res.json({ message: "Cart cleared successfully" });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};