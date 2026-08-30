import pool from "../config/db.js";

// GET /api/products
export async function listProducts(req, res) {
  try {
    const [rows] = await pool.query("SELECT id, name, slug FROM products ORDER BY name");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
}

// GET /api/products/:slug/tutorials
export async function listTutorialsForProduct(req, res) {
  const { slug } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT t.id, t.title, t.slug, t.description
       FROM tutorials t
       JOIN products p ON p.id = t.product_id
       WHERE p.slug = ?
       ORDER BY t.title`,
      [slug]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch tutorials" });
  }
}

// GET /api/products/:productSlug/tutorials/:tutorialSlug
// Returns the tutorial plus its ordered steps in one payload,
// which is the exact shape the TutorialPlayer component expects.
export async function getTutorial(req, res) {
  const { productSlug, tutorialSlug } = req.params;
  try {
    const [[tutorial]] = await pool.query(
      `SELECT t.id, t.title, t.slug, t.description, p.name AS productName, p.slug AS productSlug
       FROM tutorials t
       JOIN products p ON p.id = t.product_id
       WHERE p.slug = ? AND t.slug = ?`,
      [productSlug, tutorialSlug]
    );

    if (!tutorial) {
      return res.status(404).json({ error: "Tutorial not found" });
    }

    const [steps] = await pool.query(
      `SELECT step_number AS stepNumber, screenshot_url AS screenshotUrl,
              highlight_x AS highlightX, highlight_y AS highlightY,
              highlight_width AS highlightWidth, highlight_height AS highlightHeight,
              instruction_text AS instructionText, is_final_step AS isFinalStep
       FROM tutorial_steps
       WHERE tutorial_id = ?
       ORDER BY step_number`,
      [tutorial.id]
    );

    res.json({ ...tutorial, steps });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch tutorial" });
  }
}

// POST /api/products
export async function createProduct(req, res) {
  const { name, slug } = req.body;
  if (!name || !slug) {
    return res.status(400).json({ error: "name and slug are required" });
  }
  try {
    const [result] = await pool.query("INSERT INTO products (name, slug) VALUES (?, ?)", [name, slug]);
    res.status(201).json({ id: result.insertId, name, slug });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create product" });
  }
}

// POST /api/products/:slug/tutorials
// Body: { title, slug, description, steps: [{ stepNumber, screenshotUrl, highlightX, highlightY, highlightWidth, highlightHeight, instructionText, isFinalStep }] }
// This is the endpoint an admin/content tool would call to add a new
// "How to..." tutorial without any code changes.
export async function createTutorial(req, res) {
  const { slug: productSlug } = req.params;
  const { title, slug, description, steps = [] } = req.body;

  if (!title || !slug) {
    return res.status(400).json({ error: "title and slug are required" });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [[product]] = await connection.query("SELECT id FROM products WHERE slug = ?", [productSlug]);
    if (!product) {
      await connection.rollback();
      return res.status(404).json({ error: "Product not found" });
    }

    const [tutorialResult] = await connection.query(
      "INSERT INTO tutorials (product_id, title, slug, description) VALUES (?, ?, ?, ?)",
      [product.id, title, slug, description || null]
    );
    const tutorialId = tutorialResult.insertId;

    for (const step of steps) {
      await connection.query(
        `INSERT INTO tutorial_steps
          (tutorial_id, step_number, screenshot_url, highlight_x, highlight_y, highlight_width, highlight_height, instruction_text, is_final_step)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          tutorialId,
          step.stepNumber,
          step.screenshotUrl,
          step.highlightX || 0,
          step.highlightY || 0,
          step.highlightWidth || 0,
          step.highlightHeight || 0,
          step.instructionText,
          !!step.isFinalStep,
        ]
      );
    }

    await connection.commit();
    res.status(201).json({ id: tutorialId, title, slug });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ error: "Failed to create tutorial" });
  } finally {
    connection.release();
  }
}
