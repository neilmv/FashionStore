const pool = require("../config/db");

exports.getAllCategories = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [categories] = await connection.execute("SELECT * FROM categories ORDER BY name");
    connection.release();
    res.json(categories);
  } catch (error) {
    console.error("Categories error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [categories] = await connection.execute(
      "SELECT * FROM categories WHERE id = ?",
      [req.params.id]
    );

    if (categories.length === 0) {
      connection.release();
      return res.status(404).json({ error: "Category not found" });
    }

    connection.release();
    res.json(categories[0]);
  } catch (error) {
    console.error("Category error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};