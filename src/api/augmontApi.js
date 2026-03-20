const BASE_URL =
  import.meta.env.VITE_AUGMONT_BASE_URL?.trim() ||
  "https://uatbckend.karatly.net";
const DEFAULT_MERCHANT_ID =
  import.meta.env.VITE_AUGMONT_MERCHANT_ID?.trim() || "11692";
const AUGMONT_LOGIN_EMAIL =
  import.meta.env.VITE_AUGMONT_LOGIN_EMAIL?.trim() ||
  "Onboarding@sabbpe.com";
const AUGMONT_LOGIN_PASSWORD =
  import.meta.env.VITE_AUGMONT_LOGIN_PASSWORD?.trim() ||
  "Z1!pX6@S3#vK9a";
const AUGMONT_PRODUCTS_TOKEN =
  import.meta.env.VITE_AUGMONT_PRODUCTS_TOKEN?.trim() || "";
const AUGMONT_SESSION_KEY = "augmontSession";
const LIVE_GOLD_RATE_HISTORY_KEY = "liveGoldRateHistory";
const LIVE_GOLD_RATE_HISTORY_LIMIT = 12;
const AUGMONT_USER_KEY = "augmontUser";

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

const extractBackendMessage = (data, fallback = "Request failed") => {
  const payloadMessage = data?.payload?.message;
  const responseBody = data?.payload?.responseBody;

  if (typeof responseBody === "string") {
    try {
      const parsed = JSON.parse(responseBody);
      return parsed?.message || payloadMessage || fallback;
    } catch {
      return responseBody || payloadMessage || fallback;
    }
  }

  return payloadMessage || data?.message || fallback;
};

const getStoredAugmontUser = () => {
  try {
    const raw = localStorage.getItem(AUGMONT_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const setStoredAugmontUser = (user) => {
  const existing = getStoredAugmontUser() || {};
  localStorage.setItem(
    AUGMONT_USER_KEY,
    JSON.stringify({
      ...existing,
      ...user
    })
  );
};

const selectProductImage = (images) => {
  if (!Array.isArray(images) || images.length === 0) return "";

  const defaultImage = images.find(
    (image) => image?.defaultImage && image?.url
  );
  if (defaultImage) return defaultImage.url;

  const orderedImage = [...images]
    .filter((image) => image?.url)
    .sort(
      (a, b) =>
        (a?.displayOrder ?? Number.MAX_SAFE_INTEGER) -
        (b?.displayOrder ?? Number.MAX_SAFE_INTEGER)
    )[0];

  return orderedImage?.url || "";
};

const toNumber = (value) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const pickFirstPositiveNumber = (...values) => {
  for (const value of values) {
    const parsed = toNumber(value);
    if (parsed > 0) {
      return parsed;
    }
  }

  return 0;
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
  productImages: Array.isArray(product?.productImages)
    ? product.productImages
    : [],
  imageUrl: selectProductImage(product?.productImages)
});

const normalizePagination = (pagination = {}) => ({
  hasMore: Boolean(pagination?.hasMore),
  count: Number(pagination?.count || 0),
  per_page: Number(pagination?.per_page || 0),
  current_page: Number(pagination?.current_page || 1)
});

const extractAugmontSession = (data) => {
  const token =
    data?.token ||
    data?.accessToken ||
    data?.payload?.token ||
    data?.payload?.accessToken ||
    data?.payload?.result?.token ||
    data?.payload?.result?.accessToken ||
    data?.payload?.result?.data?.token ||
    data?.payload?.result?.data?.accessToken;
  const merchantId =
    data?.merchantId ||
    data?.payload?.merchantId ||
    data?.payload?.result?.merchantId ||
    data?.payload?.result?.data?.merchantId;

  return {
    token: token ? String(token) : "",
    merchantId: merchantId ? String(merchantId) : DEFAULT_MERCHANT_ID
  };
};

const extractAugmontUser = (data, fallbackUniqueId = "") => {
  const result =
    data?.payload?.result?.data ||
    data?.payload?.result ||
    data?.payload?.data ||
    data?.data ||
    {};

  return {
    uniqueId:
      result?.uniqueId ||
      result?.userUniqueId ||
      result?.customerUniqueId ||
      data?.uniqueId ||
      fallbackUniqueId,
    userBankId: result?.userBankId || "",
    userAddressId: result?.userAddressId || ""
  };
};

export const normalizeGoldRatePayload = (data) => {
  const rates =
    data?.payload?.result?.data?.rates ||
    data?.payload?.result?.rates ||
    data?.payload?.rates ||
    data?.rates ||
    {};

  const buyPrice = pickFirstPositiveNumber(
    rates?.gBuy,
    rates?.buy,
    rates?.buyPrice,
    rates?.goldBuy,
    rates?.gold_buy
  );
  const sellPrice = pickFirstPositiveNumber(
    rates?.gSell,
    rates?.sell,
    rates?.sellPrice,
    rates?.goldSell,
    rates?.gold_sell
  );
  const currentPrice = pickFirstPositiveNumber(
    rates?.current,
    rates?.price,
    rates?.goldPrice,
    buyPrice,
    sellPrice
  );

  return {
    currentPrice,
    buyPrice: buyPrice || currentPrice,
    sellPrice: sellPrice || currentPrice,
    metalType: rates?.metalType || "gold",
    updatedAt:
      rates?.updatedAt ||
      rates?.timestamp ||
      data?.payload?.result?.data?.updatedAt ||
      new Date().toISOString(),
    rawRates: rates
  };
};

const readGoldRateHistory = () => {
  try {
    const raw = localStorage.getItem(LIVE_GOLD_RATE_HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];

    return Array.isArray(parsed)
      ? parsed.filter(
          (point) => point && point.label && Number.isFinite(Number(point.price))
        )
      : [];
  } catch {
    return [];
  }
};

const storeGoldRatePoint = (snapshot) => {
  const history = readGoldRateHistory();
  const timestamp = new Date(snapshot.updatedAt || Date.now());
  const nextPoint = {
    label: timestamp.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit"
    }),
    price: Number(snapshot.currentPrice.toFixed(2)),
    updatedAt: snapshot.updatedAt || timestamp.toISOString()
  };

  const dedupedHistory = history.filter(
    (point) => point.updatedAt !== nextPoint.updatedAt
  );
  const nextHistory = [...dedupedHistory, nextPoint].slice(
    -LIVE_GOLD_RATE_HISTORY_LIMIT
  );

  localStorage.setItem(
    LIVE_GOLD_RATE_HISTORY_KEY,
    JSON.stringify(nextHistory)
  );

  return nextHistory;
};

export const getAugmontSession = () => {
  try {
    const raw = sessionStorage.getItem(AUGMONT_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const setAugmontSession = (session) => {
  sessionStorage.setItem(AUGMONT_SESSION_KEY, JSON.stringify(session));
};

export const clearAugmontSession = () => {
  sessionStorage.removeItem(AUGMONT_SESSION_KEY);
};

export const getAugmontUser = () => getStoredAugmontUser();

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

export const loginAugmont = async ({ force = false } = {}) => {
  if (!force) {
    const existingSession = getAugmontSession();

    if (existingSession?.token && existingSession?.merchantId) {
      return {
        ok: true,
        ...existingSession
      };
    }

    if (AUGMONT_PRODUCTS_TOKEN) {
      const tokenSession = {
        token: AUGMONT_PRODUCTS_TOKEN,
        merchantId: DEFAULT_MERCHANT_ID
      };
      setAugmontSession(tokenSession);
      return {
        ok: true,
        ...tokenSession
      };
    }
  }

  try {
    clearAugmontSession();
    const data = await loginUser(AUGMONT_LOGIN_EMAIL, AUGMONT_LOGIN_PASSWORD);
    const session = extractAugmontSession(data);

    if (!session.token || !session.merchantId) {
      return {
        ok: false,
        message: extractBackendMessage(
          data,
          "Augmont login did not return token or merchantId"
        )
      };
    }

    setAugmontSession(session);

    return {
      ok: true,
      ...session
    };
  } catch (error) {
    console.error("AUGMONT LOGIN ERROR:", error);
    return {
      ok: false,
      message: "Failed to log in to Augmont"
    };
  }
};

export const createUser = async (userData) => {
  const generatedUniqueId =
    userData.uniqueId || `USER-${Date.now()}`;
  const session = await loginAugmont({ force: true });

  if (!session?.ok || !session?.token) {
    return {
      status: "error",
      payload: {
        message: session?.message || "Unable to authenticate with Augmont"
      }
    };
  }

  const res = await fetch(`${BASE_URL}/api/v1/users/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.token}`
    },
    body: JSON.stringify({
      merchantId: session.merchantId || DEFAULT_MERCHANT_ID,
      request: {
        mobileNumber: userData.mobileNumber || "9999999999",
        emailId: userData.email,
        uniqueId: generatedUniqueId,
        userName: userData.name,
        cityId: "1",
        stateId: "1",
        userPincode: "500001"
      }
    })
  });

  const data = await getJson(res);
  setStoredAugmontUser(extractAugmontUser(data, generatedUniqueId));
  return data;
};

const requestAugmontUserEndpoint = async (path, body) => {
  const session = await loginAugmont();

  if (!session?.ok || !session?.token) {
    return {
      ok: false,
      message: session?.message || "Unable to authenticate with Augmont"
    };
  }

  const requestOnce = async (activeSession) => {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${activeSession.token}`
      },
      body: JSON.stringify({
        merchantId: activeSession.merchantId || DEFAULT_MERCHANT_ID,
        ...body
      })
    });

    return {
      res,
      data: await getJson(res)
    };
  };

  let { res, data } = await requestOnce(session);

  if (res.status === 401 || res.status === 403) {
    clearAugmontSession();
    const refreshedSession = await loginAugmont({ force: true });

    if (refreshedSession?.ok && refreshedSession?.token) {
      const retryResult = await requestOnce(refreshedSession);
      res = retryResult.res;
      data = retryResult.data;
    }
  }

  if (!res.ok || data?.status !== "success") {
    return {
      ok: false,
      message: extractBackendMessage(data, "Failed to fetch backend data"),
      raw: data
    };
  }

  return {
    ok: true,
    data,
    raw: data
  };
};

export const fetchAugmontUserProfile = async (uniqueId) => {
  if (!uniqueId) {
    return {
      ok: false,
      message: "Missing Augmont uniqueId"
    };
  }

  const response = await requestAugmontUserEndpoint("/api/v1/users/profile", {
    uniqueId
  });

  if (!response.ok) {
    return response;
  }

  const result =
    response.data?.payload?.result?.data ||
    response.data?.payload?.result ||
    {};

  return {
    ok: true,
    profile: result,
    raw: response.raw
  };
};

export const fetchAugmontPassbook = async (uniqueId) => {
  if (!uniqueId) {
    return {
      ok: false,
      message: "Missing Augmont uniqueId"
    };
  }

  const response = await requestAugmontUserEndpoint("/api/v1/users/passbook", {
    uniqueId
  });

  if (!response.ok) {
    return response;
  }

  const result =
    response.data?.payload?.result?.data ||
    response.data?.payload?.result ||
    {};

  return {
    ok: true,
    passbook: result,
    raw: response.raw
  };
};

/* ---------------- PRODUCTS ---------------- */

export const fetchAugmontProducts = async (
  page = 1,
  count = 10,
  token,
  merchantId
) => {
  try {
    const resolvedMerchantId = merchantId || DEFAULT_MERCHANT_ID;

    if (!token || !resolvedMerchantId) {
      return {
        ok: false,
        message: "Missing Augmont session. Please retry."
      };
    }

    const requestProducts = async (activeToken, activeMerchantId) => {
      const res = await fetch(`${BASE_URL}/api/v1/products/list`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${activeToken}`
        },
        body: JSON.stringify({
          merchantId: activeMerchantId,
          page,
          count
        })
      });

      return {
        res,
        data: await getJson(res),
        merchantId: activeMerchantId,
        token: activeToken
      };
    };

    let { res, data } = await requestProducts(token, resolvedMerchantId);

    if (res.status === 401 || res.status === 403) {
      clearAugmontSession();
      const refreshedSession = await loginAugmont({ force: true });

      if (refreshedSession?.ok && refreshedSession?.token) {
        const retryResponse = await requestProducts(
          refreshedSession.token,
          refreshedSession.merchantId || DEFAULT_MERCHANT_ID
        );
        res = retryResponse.res;
        data = retryResponse.data;
      }
    }

    if (!res.ok || data?.status !== "success") {
      if (res.status === 401 || res.status === 403) {
        clearAugmontSession();
      }

      return {
        ok: false,
        message: extractBackendMessage(data, "Failed to fetch products"),
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

/* ---------------- GOLD RATES ---------------- */

export const getGoldRates = async () => {
  const session = await loginAugmont();

  if (!session?.ok || !session?.token) {
    return {
      ok: false,
      status: "error",
      payload: {
        message: session?.message || "Unable to authenticate with Augmont"
      }
    };
  }

  const requestRates = async (token, merchantId) => {
    const res = await fetch(`${BASE_URL}/api/v1/rates/live`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        merchantId,
        request: {}
      })
    });

    return {
      res,
      data: await getJson(res)
    };
  };

  let { res, data } = await requestRates(session.token, session.merchantId);

  if (res.status === 401 || res.status === 403) {
    clearAugmontSession();
    const refreshedSession = await loginAugmont({ force: true });

    if (refreshedSession?.ok && refreshedSession?.token) {
      const retryResponse = await requestRates(
        refreshedSession.token,
        refreshedSession.merchantId
      );
      res = retryResponse.res;
      data = retryResponse.data;
    }
  }

  return data;
};

export const fetchLiveGoldRateSnapshot = async () => {
  try {
    const data = await getGoldRates();
    const snapshot = normalizeGoldRatePayload(data);

    if (snapshot.currentPrice <= 0) {
      return {
        ok: false,
        message: extractBackendMessage(data, "Live gold rate is unavailable"),
        snapshot,
        history: readGoldRateHistory(),
        raw: data
      };
    }

    const history = storeGoldRatePoint(snapshot);
    localStorage.setItem("goldPrice", String(snapshot.currentPrice));

    return {
      ok: true,
      snapshot,
      history,
      raw: data
    };
  } catch (error) {
    console.error("GOLD RATE ERROR:", error);
    return {
      ok: false,
      message: "Failed to fetch live gold rate",
      history: readGoldRateHistory()
    };
  }
};
