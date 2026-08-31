import pool from "../config/db.js";

// POST /api/uploads
// Accepts one or more files under the "images" field (from the admin
// panel's image picker) and returns the public URL for each, in the
// same order they were uploaded — the admin UI relies on that order to
// know which URL belongs to which slide.
export async function uploadImages(req, res) {
  const files = req.files || [];
  if (files.length === 0) {
    return res.status(400).json({ error: "No images were uploaded" });
  }
  const urls = files.map((file) => `/uploads/${file.filename}`);
  res.status(201).json({ urls });
}

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

// GET /api/tutorials
// Flat list of every tutorial across all products, for the admin panel's
// "manage tutorials" / delete screen.
export async function listAllTutorials(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT t.id, t.title, t.slug, p.name AS productName, p.slug AS productSlug
       FROM tutorials t
       JOIN products p ON p.id = t.product_id
       ORDER BY p.name, t.title`
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
              highlights, statements,
              instruction_text AS finalMessage, is_final_step AS isFinalStep
       FROM tutorial_steps
       WHERE tutorial_id = ?
       ORDER BY step_number`,
      [tutorial.id]
    );

    // mysql2 parses JSON columns automatically, but a NULL column (no
    // annotations ever added) comes back as null — normalize to [].
    const normalizedSteps = steps.map((s) => ({
      ...s,
      highlights: s.highlights || [],
      statements: s.statements || [],
    }));

    res.json({ ...tutorial, steps: normalizedSteps });
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
// Body: { title, slug, description, steps: [{ stepNumber, screenshotUrl,
//         highlights: [{x,y,width,height}], statements: [{x,y,text}],
//         finalMessage, isFinalStep }] }
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
          (tutorial_id, step_number, screenshot_url,
           highlight_x, highlight_y, highlight_width, highlight_height,
           highlights, statements, instruction_text, is_final_step)
         VALUES (?, ?, ?, 0, 0, 0, 0, ?, ?, ?, ?)`,
        [
          tutorialId,
          step.stepNumber,
          step.screenshotUrl,
          JSON.stringify(step.highlights || []),
          JSON.stringify(step.statements || []),
          step.finalMessage || "",
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

// DELETE /api/products/:productSlug/tutorials/:tutorialSlug
// tutorial_steps rows are removed automatically via ON DELETE CASCADE.
export async function deleteTutorial(req, res) {
  const { productSlug, tutorialSlug } = req.params;
  try {
    const [result] = await pool.query(
      `DELETE t FROM tutorials t
       JOIN products p ON p.id = t.product_id
       WHERE p.slug = ? AND t.slug = ?`,
      [productSlug, tutorialSlug]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Tutorial not found" });
    }
    res.json({ deleted: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete tutorial" });
  }
}
