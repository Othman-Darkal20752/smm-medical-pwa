const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "http://127.0.0.1:8000/api" : "/api");

const ADMIN_TOKEN_STORAGE_KEY = "smm-admin-api-token";

export function getStoredAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY) || "";
}

export function saveStoredAdminToken(token) {
  localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, token || "");
}

export function clearStoredAdminToken() {
  localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
}

async function parseResponse(response, path) {
  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = response.status === 204 ? null : isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      payload?.detail ||
      payload?.error ||
      (typeof payload === "string" && payload) ||
      `API request failed: ${response.status} ${path}`;
    throw new Error(message);
  }

  return payload;
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    signal: options.signal,
  });

  return parseResponse(response, path);
}

async function adminRequest(path, options = {}) {
  const token = options.token || getStoredAdminToken();
  const method = options.method || "GET";
  const headers = {
    ...(options.headers || {}),
    "X-SMM-Admin-Token": token,
  };

  let body = options.body;

  if (body && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body,
    signal: options.signal,
  });

  return parseResponse(response, path);
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

export async function fetchHeroSlides(options = {}) {
  return request("/hero-slides/", options);
}

export async function fetchOfferBanners(options = {}) {
  return request("/offer-banners/", options);
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

export async function adminLogin(payload, options = {}) {
  const response = await fetch(`${API_BASE_URL}/admin/login/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload || {}),
    signal: options.signal,
  });

  return parseResponse(response, "/admin/login/");
}

export async function adminFetchSettings(options = {}) {
  return adminRequest("/admin/settings/", options);
}

export async function adminUpdateSettings(payload, options = {}) {
  return adminRequest("/admin/settings/", {
    ...options,
    method: "PATCH",
    body: payload,
  });
}

export async function adminFetchPaymentSettings(options = {}) {
  return adminRequest("/admin/payment-settings/", options);
}

export async function adminUpdatePaymentSettings(payload, options = {}) {
  return adminRequest("/admin/payment-settings/", {
    ...options,
    method: "PATCH",
    body: payload,
  });
}

export async function adminFetchCategories(options = {}) {
  return adminRequest("/admin/categories/", options);
}

export async function adminCreateCategory(payload, options = {}) {
  return adminRequest("/admin/categories/", {
    ...options,
    method: "POST",
    body: payload,
  });
}

export async function adminUpdateCategory(categoryId, payload, options = {}) {
  return adminRequest(`/admin/categories/${categoryId}/`, {
    ...options,
    method: "PATCH",
    body: payload,
  });
}

export async function adminDeleteCategory(categoryId, options = {}) {
  return adminRequest(`/admin/categories/${categoryId}/`, {
    ...options,
    method: "DELETE",
  });
}

export async function adminFetchProducts(params = {}, options = {}) {
  const suffix = buildQueryString(params);
  return adminRequest(`/admin/products/${suffix}`, options);
}

export async function adminCreateProduct(payload, options = {}) {
  return adminRequest("/admin/products/", {
    ...options,
    method: "POST",
    body: payload,
  });
}

export async function adminUpdateProduct(productId, payload, options = {}) {
  return adminRequest(`/admin/products/${productId}/`, {
    ...options,
    method: "PATCH",
    body: payload,
  });
}

export async function adminDeleteProduct(productId, options = {}) {
  return adminRequest(`/admin/products/${productId}/`, {
    ...options,
    method: "DELETE",
  });
}

export async function adminFetchHeroSlides(options = {}) {
  return adminRequest("/admin/hero-slides/", options);
}

export async function adminCreateHeroSlide(payload, options = {}) {
  return adminRequest("/admin/hero-slides/", {
    ...options,
    method: "POST",
    body: payload,
  });
}

export async function adminUpdateHeroSlide(slideId, payload, options = {}) {
  return adminRequest(`/admin/hero-slides/${slideId}/`, {
    ...options,
    method: "PATCH",
    body: payload,
  });
}

export async function adminDeleteHeroSlide(slideId, options = {}) {
  return adminRequest(`/admin/hero-slides/${slideId}/`, {
    ...options,
    method: "DELETE",
  });
}

export async function adminFetchOfferBanners(options = {}) {
  return adminRequest("/admin/offer-banners/", options);
}

export async function adminCreateOfferBanner(payload, options = {}) {
  return adminRequest("/admin/offer-banners/", {
    ...options,
    method: "POST",
    body: payload,
  });
}

export async function adminUpdateOfferBanner(bannerId, payload, options = {}) {
  return adminRequest(`/admin/offer-banners/${bannerId}/`, {
    ...options,
    method: "PATCH",
    body: payload,
  });
}

export async function adminDeleteOfferBanner(bannerId, options = {}) {
  return adminRequest(`/admin/offer-banners/${bannerId}/`, {
    ...options,
    method: "DELETE",
  });
}
