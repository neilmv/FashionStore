const pool = require("../config/db");
const bcrypt = require("bcryptjs");

exports.getUserProfile = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [users] = await connection.execute(
      "SELECT id, name, email, phone, address, created_at FROM users WHERE id = ?",
      [req.user.userId]
    );

    if (users.length === 0) {
      connection.release();
      return res.status(404).json({ error: "User not found" });
    }

    connection.release();
    res.json(users[0]);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const connection = await pool.getConnection();

    await connection.execute(
      "UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?",
      [name, phone, address, req.user.userId]
    );

    // Get updated user
    const [users] = await connection.execute(
      "SELECT id, name, email, phone, address, created_at FROM users WHERE id = ?",
      [req.user.userId]
    );

    connection.release();
    res.json({
      message: "Profile updated successfully",
      user: users[0]
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const connection = await pool.getConnection();

    // Get current password
    const [users] = await connection.execute(
      "SELECT password FROM users WHERE id = ?",
      [req.user.userId]
    );

    if (users.length === 0) {
      connection.release();
      return res.status(404).json({ error: "User not found" });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(currentPassword, user.password);

    if (!validPassword) {
      connection.release();
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await connection.execute(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedPassword, req.user.userId]
    );

    connection.release();
    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};