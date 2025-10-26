const pool = require("../config/db");

exports.getAllProducts = async (req, res) => {
  try {
    const { category, featured, search, page = 1, limit = 12 } = req.query;
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

    if (category && category !== "all") {
      query += " AND c.name = ?";
      countQuery += " AND c.name = ?";
      params.push(category);
      countParams.push(category);
    }

    if (featured === "true") {
      query += " AND p.is_featured = TRUE";
      countQuery += " AND p.is_featured = TRUE";
    }

    if (search) {
      query += " AND (p.name LIKE ? OR p.description LIKE ? OR p.brand LIKE ?)";
      countQuery += " AND (p.name LIKE ? OR p.description LIKE ? OR p.brand LIKE ?)";
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
      countParams.push(searchTerm, searchTerm, searchTerm);
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
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error("Products error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getProductById = async (req, res) => {
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
};