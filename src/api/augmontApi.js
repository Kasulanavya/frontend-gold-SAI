const BASE_URL =
  import.meta.env.VITE_AUGMONT_BASE_URL?.trim() ||
  "https://uatbckend.karatly.net";
const MERCHANT_ID =
  import.meta.env.VITE_AUGMONT_MERCHANT_ID?.trim() || "11692";
const PRODUCT_LIST_BEARER_TOKEN =
  import.meta.env.VITE_AUGMONT_PRODUCTS_TOKEN?.trim() ||
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI1IiwianRpIjoiN2UzZjA0NzI0ZmIyYzA2NGNkNzU1ZDRiNTc3ODY3MWVjMDJmY2UwNGZhMDM0MDcxYTIwYmQ3YmYyYTBlODZhNzA2YTNkNjViYTc2Njc1OTEiLCJpYXQiOjE3NzM5OTU3NzAuMTI0NDg5LCJuYmYiOjE3NzM5OTU3NzAuMTI0NDksImV4cCI6MTc3NjU4Nzc3MC4xMjE2MDcsInN1YiI6IjUwMDAyMTczIiwic2NvcGVzIjpbXX0.sNjcU2BGUb7GbwFSlSzh9BJIvO3AhJ0iYhfRj_cHP4MBegnc9-l6vSzAbs5znoCd14i0iMstgk75CmrkeagHQXcODxeFzT9wwy0xx_I2V87O7dA7PadEMTzGZbFAaTPW8Lzmj3jx0KycnOYqlt97TRvRX-ChG9WxpPsFo4AtobkozZ5qUlBsyt3jb6WQdSvlzO1UQJvX2dvbjYygOgAkGGqEQ-dy4Qm9OUa9oOs1Uz7s-zXY8ToLIQ0IKKnc7OMbDzvsSeNlRBEvT-7MQrA9UKmQG1ikor8wG5IfRZxBRMPIcfK92deiIdxq8IK1iP7QZEtN7lWQNmpVahDJBwc6r5E7cLJAUJdEiXy3uwOpqYLWL4qqYdAYBumghqCooCRU61GVxp6JdBXFWn9hf5lrqSEfitmsphmFbRdEUMYXJDiii-j89CY6N0VVbrWRF_pod915A5Qu0TTOI6yjLKpelbytk7WP7iEdZsmMysAPbNLCeQ7VBQMyYEKwnFuN_nA6Yfs42dYy0UtJifjF44zBbbki_foOV2ydA1kJr2kNslX6TIok4BcngTstzxfAzcA6eVrFyBYIvfkyVjiCJ64TSzF4RDVUeZOvM48m4CWC1rVO-QtBPyfNqIccoFUohbM5CKmFnTPRif0o5e0jnLwnYJW_4Q1qYHt8uPlyEr9B-t8";

const getAuthToken = () => localStorage.getItem("token");

const getJson = async (res) => {
  const text = await res.text();

  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {
      status: "error",
      payload: {
        statusCode: res.status,
        message: text || "Invalid server response"
      }
    };
  }
};

const extractBackendMessage = (data) => {
  const payloadMessage = data?.payload?.message;
  const responseBody = data?.payload?.responseBody;

  if (typeof responseBody === "string") {
    try {
      const parsed = JSON.parse(responseBody);
      return parsed?.message || payloadMessage;
    } catch {
      return responseBody || payloadMessage;
    }
  }

  return payloadMessage || data?.message || "Failed to fetch products";
};

const selectProductImage = (images) => {
  if (!Array.isArray(images) || images.length === 0) return "";

  const defaultImage = images.find((image) => image?.defaultImage && image?.url);
  if (defaultImage) return defaultImage.url;

  const orderedImage = [...images]
    .filter((image) => image?.url)
    .sort((a, b) => (a?.displayOrder ?? Number.MAX_SAFE_INTEGER) - (b?.displayOrder ?? Number.MAX_SAFE_INTEGER))[0];

  return orderedImage?.url || "";
};

const normalizeProduct = (product) => ({
  id: product?.sku || `product-${Math.random().toString(36).slice(2, 9)}`,
  sku: product?.sku || "",
  name: product?.name || "Untitled Product",
  description:
    product?.description && product.description !== "NA"
      ? product.description
      : "",
  basePrice: product?.basePrice || "0",
  metalType: product?.metalType || "NA",
  purity: product?.purity || "NA",
  productWeight: product?.productWeight || "NA",
  redeemWeight: product?.redeemWeight || "NA",
  jewelleryType: product?.jewelleryType || "NA",
  productSize: product?.productSize || "NA",
  status: product?.status || "inactive",
  productImages: Array.isArray(product?.productImages) ? product.productImages : [],
  imageUrl: selectProductImage(product?.productImages)
});

const normalizePagination = (pagination) => ({
  hasMore: Boolean(pagination?.hasMore),
  count: Number(pagination?.count || 0),
  per_page: Number(pagination?.per_page || 0),
  current_page: Number(pagination?.current_page || 1)
});

/* ---------------- AUTH ---------------- */

export const loginUser = async (email, password) => {
  const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  return await getJson(res);
};

export const createUser = async (userData) => {
  const res = await fetch(`${BASE_URL}/api/v1/users/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAuthToken()}`
    },
    body: JSON.stringify({
      merchantId: MERCHANT_ID,
      request: {
        mobileNumber: userData.mobileNumber || "9999999999",
        emailId: userData.email,
        uniqueId: `USER-${Date.now()}`,
        userName: userData.name,
        cityId: "1",
        stateId: "1",
        userPincode: "500001"
      }
    })
  });

  return await getJson(res);
};

/* ---------------- PRODUCTS ---------------- */

export const fetchAugmontProducts = async (page = 1, count = 10) => {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/products/list`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${PRODUCT_LIST_BEARER_TOKEN}`
      },
      body: JSON.stringify({
        merchantId: MERCHANT_ID,
        page,
        count
      })
    });

    const data = await getJson(res);

    if (!res.ok || data?.status !== "success") {
      return {
        ok: false,
        message: extractBackendMessage(data),
        providerUrl: data?.payload?.providerUrl || "",
        products: [],
        pagination: normalizePagination()
      };
    }

    return {
      ok: true,
      message: data?.payload?.message || "",
      products: Array.isArray(data?.payload?.result?.data)
        ? data.payload.result.data.map(normalizeProduct)
        : [],
      pagination: normalizePagination(data?.payload?.result?.pagination),
      raw: data
    };
  } catch (error) {
    console.error("PRODUCT API ERROR:", error);
    return {
      ok: false,
      message: "Failed to fetch products",
      products: [],
      pagination: normalizePagination()
    };
  }
};

export const getProducts = fetchAugmontProducts;

/* ---------------- GOLD RATES ---------------- */

export const getGoldRates = async () => {
  const res = await fetch(`${BASE_URL}/api/v1/rates/live`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAuthToken()}`
    },
    body: JSON.stringify({
      merchantId: MERCHANT_ID,
      request: {}
    })
  });

  return await getJson(res);
};
