const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "http://127.0.0.1:8000/api" : "/api");

async function request(path) {
  const response = await fetch(`${API_BASE_URL}${path}`);

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${path}`);
  }

  return response.json();
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
  const priceSyp = product.price_syp;
  const priceUsd =
    product.price_usd === null || product.price_usd === undefined
      ? null
      : Number(product.price_usd);

  return {
    id: product.id,
    name: product.name,
    category: product.category?.name || "",
    description: product.description || "",
    image: product.image,
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

export async function fetchSiteSettings() {
  return request("/settings/");
}

export async function fetchCategories() {
  const data = await request("/categories/");
  const list = Array.isArray(data.results) ? data.results : data;

  return ["الكل", ...list.map(mapApiCategoryToName)];
}

export async function fetchProducts(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== "الكل") {
      query.set(key, value);
    }
  });

  const suffix = query.toString() ? `?${query.toString()}` : "";
  const data = await request(`/products/${suffix}`);
  const list = Array.isArray(data.results) ? data.results : data;

  return {
    products: list.map(mapApiProductToUiProduct),
    count: data.count ?? list.length,
    next: data.next ?? null,
    previous: data.previous ?? null,
  };
}
