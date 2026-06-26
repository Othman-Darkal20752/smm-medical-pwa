const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "http://127.0.0.1:8000/api" : "/api");

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    signal: options.signal,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${path}`);
  }

  return response.json();
}

function buildQueryString(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== "الكل") {
      query.set(key, value);
    }
  });

  const suffix = query.toString();
  return suffix ? `?${suffix}` : "";
}

function formatSypPrice(value) {
  if (value === null || value === undefined) {
    return "السعر عند الطلب";
  }

  return `${Number(value).toLocaleString("en-US")} ل.س`;
}

export function mapApiCategoryToName(category) {
  return category.name;
}

export function mapApiProductToUiProduct(product) {
  const parsedPriceSyp =
    product.price_syp === null || product.price_syp === undefined
      ? null
      : Number(product.price_syp);
  const priceSyp = Number.isFinite(parsedPriceSyp) ? parsedPriceSyp : null;
  const parsedPriceUsd =
    product.price_usd === null || product.price_usd === undefined
      ? null
      : Number(product.price_usd);
  const priceUsd = Number.isFinite(parsedPriceUsd) ? parsedPriceUsd : null;

  return {
    id: product.id,
    name: product.name,
    category: product.category?.name || "",
    categoryId: product.category?.id || product.category_id || null,
    description: product.description || "",
    image: product.image,
    updated_at: product.updated_at || product.updatedAt || product.modified_at || "",
    priceUsd,
    priceSyp,
    price: priceUsd === null ? "السعر عند الطلب" : `$${priceUsd.toFixed(2)}`,
    priceValue: priceSyp,
    priceLabel: formatSypPrice(priceSyp),
    tag:
      product.stock_status === "request"
        ? "عند الطلب"
        : product.is_offer
          ? "عرض"
          : product.is_new
            ? "جديد"
            : "متوفر",
    tone: product.color || "blue",
    is_new: product.is_new,
    is_offer: product.is_offer,
    is_best_seller: product.is_best_seller,
  };
}

export async function fetchSiteSettings(options = {}) {
  return request("/settings/", options);
}

export async function fetchCategories(options = {}) {
  const data = await request("/categories/", options);
  const list = Array.isArray(data.results) ? data.results : data;

  return ["الكل", ...list.map(mapApiCategoryToName)];
}

export async function fetchProducts(params = {}, options = {}) {
  const suffix = buildQueryString(params);
  const data = await request(`/products/${suffix}`, options);
  const list = Array.isArray(data.results) ? data.results : data;

  return {
    products: list.map(mapApiProductToUiProduct),
    count: data.count ?? list.length,
    next: data.next ?? null,
    previous: data.previous ?? null,
  };
}

export async function fetchProduct(productId, options = {}) {
  const safeProductId = encodeURIComponent(String(productId));
  const data = await request(`/products/${safeProductId}/`, options);

  return mapApiProductToUiProduct(data);
}
