const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role = 0 } = req.body;
    const connection = await pool.getConnection();

    // Check if user exists
    const [existing] = await connection.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      connection.release();
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await connection.execute(
      "INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)",
      [name, email, hashedPassword, phone, role]
    );

    const token = jwt.sign({ userId: result.insertId, email, role }, JWT_SECRET);

    connection.release();
    res.status(201).json({
      message: "User registered successfully",
      token,
      user: { id: result.insertId, name, email, phone, role },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const connection = await pool.getConnection();

    const [users] = await connection.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      connection.release();
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      connection.release();
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id, email, role: user.role }, JWT_SECRET);

    connection.release();
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};