const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

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

const authorizeAdmin = async (req, res, next) => {
  try {
    const connection = await require("../config/db").getConnection();
    const [users] = await connection.execute(
      "SELECT role FROM users WHERE id = ?",
      [req.user.userId]
    );
    connection.release();

    if (users.length === 0 || users[0].role !== 1) {
      return res.status(403).json({ error: "Admin access required" });
    }

    next();
  } catch (error) {
    console.error("Authorization error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { authenticateToken, authorizeAdmin };