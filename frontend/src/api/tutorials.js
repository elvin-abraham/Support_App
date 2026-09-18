const BASE_URL = "/api";

export async function fetchProducts() {
  const res = await fetch(`${BASE_URL}/products`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}
export async function fetchTutorialsForProduct(productSlug) {
  const res = await fetch(`${BASE_URL}/products/${productSlug}/tutorials`);
  if (!res.ok) throw new Error("Failed to fetch tutorials");
  return res.json();
}
export async function fetchTutorial(productSlug, tutorialSlug) {
  const res = await fetch(`${BASE_URL}/products/${productSlug}/tutorials/${tutorialSlug}`);
  if (!res.ok) throw new Error("Failed to fetch tutorial");
  return res.json();
}
