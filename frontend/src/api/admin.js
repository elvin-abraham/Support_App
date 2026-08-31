const BASE_URL = "/api";

// Uploads one image and returns its public URL (e.g. "/uploads/xyz.png").
export async function uploadImage(file) {
  const formData = new FormData();
  formData.append("images", file);

  const res = await fetch(`${BASE_URL}/uploads`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Upload failed");
  }
  const { urls } = await res.json();
  return urls[0];
}

export async function createProduct(name, slug) {
  const res = await fetch(`${BASE_URL}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, slug }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Failed to create product");
  }
  return res.json();
}

// steps: [{ stepNumber, screenshotUrl, highlightX, highlightY, highlightWidth,
//           highlightHeight, instructionText, isFinalStep }]
export async function createTutorial(productSlug, { title, slug, description, steps }) {
  const res = await fetch(`${BASE_URL}/products/${productSlug}/tutorials`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, slug, description, steps }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Failed to publish tutorial");
  }
  return res.json();
}

// Turns "How to add a ledger?" into "how-to-add-a-ledger", and
// "Incluziv ERP" into "incluziv-erp" — used for both product and
// tutorial slugs so the admin never has to think about URL slugs.
export function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
