const BASE_URL =
  import.meta.env.VITE_AUGMONT_BASE_URL?.trim() ||
  "https://uatbckend.karatly.net";

const getJson = async (res) => {
  const text = await res.text();

  try {
    return text ? JSON.parse(text) : [];
  } catch {
    return {
      ok: false,
      message: text || "Invalid server response"
    };
  }
};

export const isValidMediaUrl = (url) => {
  if (!url || typeof url !== "string") return false;

  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname || "";
    const fileName = pathname.split("/").pop() || "";

    if (!["http:", "https:"].includes(parsed.protocol)) return false;
    if (!fileName || !fileName.includes(".")) return false;

    return true;
  } catch {
    return false;
  }
};

export const getPrimaryProductImage = (product) => {
  const images = Array.isArray(product?.media?.images) ? product.media.images : [];
  return images.find(isValidMediaUrl) || "";
};

const getValidMediaArray = (items) =>
  Array.isArray(items) ? items.filter(isValidMediaUrl) : [];

export const mapSafeGoldProductToCardModel = (product) => ({
  id: product?.skuNumber || `safegold-${product?.id || Math.random().toString(36).slice(2, 9)}`,
  skuNumber: product?.skuNumber || "",
  title: product?.description || "SafeGold Product",
  description: product?.description || "",
  image: getPrimaryProductImage(product),
  images: getValidMediaArray(product?.media?.images),
  videos: getValidMediaArray(product?.media?.videos),
  weight: product?.metalWeight ?? null,
  metal: product?.metal || "",
  purity: product?.metalStamp || "",
  brand: product?.brand || "",
  price: product?.deliveryMintingCost ?? 0,
  dispatchTime: product?.estimatedDaysForDispatch || "",
  certification: product?.certification || "",
  packaging: product?.packaging || "",
  refundPolicy: product?.refundPolicy || "",
  highlights: Array.isArray(product?.productHighlights)
    ? product.productHighlights.filter(Boolean)
    : [],
  available: product?.inStock === "Y",
  dimensions: product?.productDimensions || "",
  thickness: product?.productThickness || "",
  raw: product
});

export const fetchSafeGoldProducts = async () => {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/gold/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({})
    });

    const data = await getJson(res);

    if (!res.ok) {
      return {
        ok: false,
        message:
          data?.message ||
          data?.payload?.message ||
          "Failed to fetch SafeGold products",
        products: []
      };
    }

    if (!Array.isArray(data)) {
      return {
        ok: false,
        message: "SafeGold product response is not an array",
        products: []
      };
    }

    return {
      ok: true,
      products: data.map(mapSafeGoldProductToCardModel)
    };
  } catch (error) {
    console.error("SAFEGOLD PRODUCT API ERROR:", error);
    return {
      ok: false,
      message: "Failed to fetch SafeGold products",
      products: []
    };
  }
};
