import pool from "../config/db.js";
import { findBestTutorial } from "../utils/tutorialMatcher.js";

function parseJsonArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

// POST /api/uploads
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
    const [rows] = await pool.query("SELECT id, name, name_hindi AS nameHindi, slug FROM products ORDER BY name");
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
      `SELECT t.id, t.title, t.title_hindi AS titleHindi, t.slug, t.description
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
export async function listAllTutorials(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT t.id, t.title, t.title_hindi AS titleHindi, t.slug, p.name AS productName, p.slug AS productSlug
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

// POST /api/tutorials/match
// Body: { query: string }
// Used when the customer's typed question doesn't exactly match a tutorial
// title. Matching is fully local: tutorial titles, Hindi titles, and the
// related questions entered in the Admin Panel are compared without an AI
// request, so tutorial search does not consume Gemini quota.
export async function matchTutorialQuery(req, res) {
  const { query } = req.body;
  if (!query || typeof query !== "string" || !query.trim()) {
    return res.status(400).json({ error: "query is required" });
  }

  try {
    const [tutorials] = await pool.query(
      `SELECT t.slug, t.title, t.title_hindi AS titleHindi,
              t.related_questions AS relatedQuestions,
              p.name AS productName, p.slug AS productSlug
       FROM tutorials t
       JOIN products p ON p.id = t.product_id`
    );

    if (tutorials.length === 0) {
      return res.json({ matched: false });
    }

    const match = findBestTutorial(query, tutorials);
    if (!match) {
      return res.json({ matched: false });
    }

    res.json({ matched: true, productSlug: match.productSlug, tutorialSlug: match.slug });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Search is unavailable right now. Please try again shortly." });
  }
}

// GET /api/products/:productSlug/tutorials/:tutorialSlug
export async function getTutorial(req, res) {
  const { productSlug, tutorialSlug } = req.params;
  try {
    const [[tutorial]] = await pool.query(
      `SELECT t.id, t.title, t.title_hindi AS titleHindi, t.slug, t.description,
              t.related_questions AS relatedQuestions,
              p.name AS productName, p.name_hindi AS productNameHindi, p.slug AS productSlug
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
              instruction_text AS finalMessage, instruction_text_hindi AS finalMessageHindi,
              is_final_step AS isFinalStep
       FROM tutorial_steps
       WHERE tutorial_id = ?
       ORDER BY step_number`,
      [tutorial.id]
    );

    const normalizedSteps = steps.map((s) => ({
      ...s,
      highlights: parseJsonArray(s.highlights),
      statements: parseJsonArray(s.statements),
    }));

    res.json({
      ...tutorial,
      relatedQuestions: parseJsonArray(tutorial.relatedQuestions),
      steps: normalizedSteps,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch tutorial" });
  }
}

// POST /api/products
export async function createProduct(req, res) {
  const { name, nameHindi, slug } = req.body;
  if (!name || !slug) {
    return res.status(400).json({ error: "name and slug are required" });
  }
  try {
    const [result] = await pool.query(
      "INSERT INTO products (name, name_hindi, slug) VALUES (?, ?, ?)",
      [name, nameHindi || null, slug]
    );
    res.status(201).json({ id: result.insertId, name, nameHindi, slug });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create product" });
  }
}

// POST /api/products/:slug/tutorials
// Body: { title, titleHindi, slug, description, relatedQuestions: [], steps: [{ stepNumber,
//         screenshotUrl, highlights: [{x,y,width,height}],
//         statements: [{x,y,text,textHindi}], finalMessage,
//         finalMessageHindi, isFinalStep }] }
export async function createTutorial(req, res) {
  const { slug: productSlug } = req.params;
  const { title, titleHindi, slug, description, relatedQuestions = [], steps = [] } = req.body;

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
      "INSERT INTO tutorials (product_id, title, title_hindi, slug, description, related_questions) VALUES (?, ?, ?, ?, ?, ?)",
      [
        product.id,
        title,
        titleHindi || null,
        slug,
        description || null,
        JSON.stringify(Array.isArray(relatedQuestions) ? relatedQuestions.filter((q) => typeof q === "string" && q.trim()).map((q) => q.trim()) : []),
      ]
    );
    const tutorialId = tutorialResult.insertId;

    for (const step of steps) {
      await connection.query(
        `INSERT INTO tutorial_steps
          (tutorial_id, step_number, screenshot_url,
           highlight_x, highlight_y, highlight_width, highlight_height,
           highlights, statements, instruction_text, instruction_text_hindi, is_final_step)
         VALUES (?, ?, ?, 0, 0, 0, 0, ?, ?, ?, ?, ?)`,
        [
          tutorialId,
          step.stepNumber,
          step.screenshotUrl,
          JSON.stringify(step.highlights || []),
          JSON.stringify(step.statements || []),
          step.finalMessage || "",
          step.finalMessageHindi || null,
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

// PUT /api/products/:productSlug/tutorials/:tutorialSlug
// Updates an existing tutorial and replaces its step data in one transaction.
export async function updateTutorial(req, res) {
  const { productSlug, tutorialSlug } = req.params;
  const { title, titleHindi, slug, description, relatedQuestions = [], steps = [] } = req.body;

  if (!title || !slug) {
    return res.status(400).json({ error: "title and slug are required" });
  }
  if (!Array.isArray(steps) || steps.length === 0) {
    return res.status(400).json({ error: "At least one tutorial step is required" });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [[tutorial]] = await connection.query(
      `SELECT t.id, p.id AS productId
       FROM tutorials t
       JOIN products p ON p.id = t.product_id
       WHERE p.slug = ? AND t.slug = ?`,
      [productSlug, tutorialSlug]
    );

    if (!tutorial) {
      await connection.rollback();
      return res.status(404).json({ error: "Tutorial not found" });
    }

    const [duplicate] = await connection.query(
      `SELECT id FROM tutorials
       WHERE product_id = ? AND slug = ? AND id <> ?`,
      [tutorial.productId, slug, tutorial.id]
    );
    if (duplicate.length > 0) {
      await connection.rollback();
      return res.status(409).json({ error: "Another tutorial already uses this question/slug for this product" });
    }

    await connection.query(
      `UPDATE tutorials
       SET title = ?, title_hindi = ?, slug = ?, description = ?, related_questions = ?
       WHERE id = ?`,
      [
        title.trim(),
        titleHindi?.trim() || null,
        slug.trim(),
        description?.trim() || null,
        JSON.stringify(
          Array.isArray(relatedQuestions)
            ? relatedQuestions.filter((q) => typeof q === "string" && q.trim()).map((q) => q.trim())
            : []
        ),
        tutorial.id,
      ]
    );

    await connection.query("DELETE FROM tutorial_steps WHERE tutorial_id = ?", [tutorial.id]);

    for (const [index, step] of steps.entries()) {
      await connection.query(
        `INSERT INTO tutorial_steps
          (tutorial_id, step_number, screenshot_url,
           highlight_x, highlight_y, highlight_width, highlight_height,
           highlights, statements, instruction_text, instruction_text_hindi, is_final_step)
         VALUES (?, ?, ?, 0, 0, 0, 0, ?, ?, ?, ?, ?)`,
        [
          tutorial.id,
          index + 1,
          step.screenshotUrl || "",
          JSON.stringify(step.highlights || []),
          JSON.stringify(step.statements || []),
          step.finalMessage || "",
          step.finalMessageHindi || null,
          !!step.isFinalStep,
        ]
      );
    }

    await connection.commit();
    res.json({ id: tutorial.id, title: title.trim(), slug: slug.trim() });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ error: "Failed to update tutorial" });
  } finally {
    connection.release();
  }
}

// DELETE /api/products/:productSlug/tutorials/:tutorialSlug
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
