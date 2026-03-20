const BASE_URL =
  import.meta.env.VITE_AUGMONT_BASE_URL?.trim() ||
  "https://uatbckend.karatly.net";
const SAFEGOLD_RATE_HISTORY_KEY = "safeGoldRateHistory";
const SAFEGOLD_RATE_HISTORY_LIMIT = 12;

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

const toNumber = (value) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const readRateHistory = () => {
  try {
    const raw = localStorage.getItem(SAFEGOLD_RATE_HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const storeRatePoint = (price) => {
  const timestamp = new Date();
  const nextPoint = {
    label: timestamp.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit"
    }),
    price: Number(price.toFixed(2)),
    updatedAt: timestamp.toISOString()
  };

  const history = readRateHistory();
  const nextHistory = [...history, nextPoint].slice(-SAFEGOLD_RATE_HISTORY_LIMIT);
  localStorage.setItem(SAFEGOLD_RATE_HISTORY_KEY, JSON.stringify(nextHistory));
  return nextHistory;
};

const extractRateValue = (data, fallbackKeys = []) => {
  const payload = Array.isArray(data) ? data[0] : data;
  const candidates = [
    payload?.sellPrice,
    payload?.buyPrice,
    payload?.price,
    payload?.rate,
    payload?.currentPrice,
    payload?.goldSellPrice,
    payload?.goldBuyPrice,
    payload?.data?.sellPrice,
    payload?.data?.buyPrice,
    payload?.data?.price,
    payload?.payload?.sellPrice,
    payload?.payload?.buyPrice,
    payload?.payload?.price,
    payload?.payload?.data?.sellPrice,
    payload?.payload?.data?.buyPrice,
    payload?.payload?.data?.price,
    payload?.result?.sellPrice,
    payload?.result?.buyPrice,
    payload?.result?.price,
    payload?.result?.data?.sellPrice,
    payload?.result?.data?.buyPrice,
    payload?.result?.data?.price,
    ...fallbackKeys.map((key) => payload?.[key])
  ];

  for (const value of candidates) {
    const parsed = toNumber(value);
    if (parsed > 0) return parsed;
  }

  return 0;
};

const extractRateId = (data) => {
  const payload = Array.isArray(data) ? data[0] : data;
  const candidates = [
    payload?.rateId,
    payload?.data?.rateId,
    payload?.payload?.rateId,
    payload?.payload?.data?.rateId,
    payload?.result?.rateId,
    payload?.result?.data?.rateId
  ];

  for (const value of candidates) {
    if (value !== undefined && value !== null && String(value).trim()) {
      return String(value);
    }
  }

  return "";
};

const extractVerifiedTrade = (data, fallback = {}) => {
  const payload = Array.isArray(data) ? data[0] : data;
  const result =
    payload?.payload?.result?.data ||
    payload?.payload?.result ||
    payload?.result?.data ||
    payload?.result ||
    payload?.data ||
    payload ||
    {};

  return {
    grams: toNumber(
      result?.goldAmount ??
        result?.quantity ??
        result?.metalQuantity ??
        result?.grams ??
        fallback.grams
    ),
    amount: toNumber(
      result?.buyPrice ??
        result?.sellPrice ??
        result?.amount ??
        result?.totalAmount ??
        result?.payableAmount ??
        result?.receivableAmount ??
        fallback.amount
    ),
    rateId: String(result?.rateId || fallback.rateId || ""),
    raw: result
  };
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

export const fetchSafeGoldBuyPrice = async () => {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/gold/buy-price`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({})
    });

    const data = await getJson(res);
    const price = extractRateValue(data, ["buyPrice"]);
    const rateId = extractRateId(data);

    return {
      ok: res.ok && price > 0,
      price,
      rateId,
      raw: data,
      message: res.ok ? "" : data?.message || data?.payload?.message || "Failed to fetch buy price"
    };
  } catch (error) {
    console.error("SAFEGOLD BUY PRICE API ERROR:", error);
    return {
      ok: false,
      price: 0,
      rateId: "",
      message: "Failed to fetch buy price"
    };
  }
};

export const fetchSafeGoldSellPrice = async () => {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/gold/sell-price`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({})
    });

    const data = await getJson(res);
    const price = extractRateValue(data, ["sellPrice"]);
    const rateId = extractRateId(data);

    return {
      ok: res.ok && price > 0,
      price,
      rateId,
      raw: data,
      message: res.ok ? "" : data?.message || data?.payload?.message || "Failed to fetch sell price"
    };
  } catch (error) {
    console.error("SAFEGOLD SELL PRICE API ERROR:", error);
    return {
      ok: false,
      price: 0,
      rateId: "",
      message: "Failed to fetch sell price"
    };
  }
};

export const fetchSafeGoldLiveRateSnapshot = async () => {
  try {
    const [buyResponse, sellResponse] = await Promise.all([
      fetchSafeGoldBuyPrice(),
      fetchSafeGoldSellPrice()
    ]);

    const buyPrice = buyResponse?.price || 0;
    const sellPrice = sellResponse?.price || 0;
    const currentPrice = sellPrice || buyPrice;

    if (currentPrice <= 0) {
      return {
        ok: false,
        message:
          sellResponse?.message ||
          buyResponse?.message ||
          "Live SafeGold price is unavailable",
        snapshot: {
          currentPrice: 0,
          buyPrice: 0,
          sellPrice: 0
        },
        history: readRateHistory()
      };
    }

    const history = storeRatePoint(currentPrice);
    localStorage.setItem("goldPrice", String(currentPrice));

    return {
      ok: true,
      snapshot: {
        currentPrice,
        buyPrice: buyPrice || currentPrice,
        sellPrice: sellPrice || currentPrice,
        buyRateId: buyResponse?.rateId || "",
        sellRateId: sellResponse?.rateId || "",
        updatedAt: new Date().toISOString()
      },
      history
    };
  } catch (error) {
    console.error("SAFEGOLD LIVE RATE ERROR:", error);
    return {
      ok: false,
      message: "Failed to fetch live SafeGold price",
      history: readRateHistory()
    };
  }
};

export const verifySafeGoldBuy = async ({
  partnerUserId,
  rateId,
  goldAmount,
  buyPrice
}) => {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/gold/buy/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        partnerUserId: Number(partnerUserId),
        request: {
          rateId: Number(rateId),
          goldAmount: Number(goldAmount),
          buyPrice: Number(buyPrice)
        }
      })
    });

    const data = await getJson(res);
    return {
      ok: res.ok,
      verified: extractVerifiedTrade(data, {
        grams: goldAmount,
        amount: buyPrice,
        rateId
      }),
      raw: data,
      message: res.ok
        ? ""
        : data?.message || data?.payload?.message || "Buy verification failed"
    };
  } catch (error) {
    console.error("SAFEGOLD BUY VERIFY ERROR:", error);
    return {
      ok: false,
      verified: {
        grams: 0,
        amount: 0,
        rateId: String(rateId || "")
      },
      message: "Buy verification failed"
    };
  }
};

export const verifySafeGoldSell = async ({
  partnerUserId,
  rateId,
  goldAmount,
  sellPrice
}) => {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/gold/sell/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        partnerUserId: Number(partnerUserId),
        request: {
          rateId: Number(rateId),
          goldAmount: Number(goldAmount),
          sellPrice: Number(sellPrice)
        }
      })
    });

    const data = await getJson(res);
    return {
      ok: res.ok,
      verified: extractVerifiedTrade(data, {
        grams: goldAmount,
        amount: sellPrice,
        rateId
      }),
      raw: data,
      message: res.ok
        ? ""
        : data?.message || data?.payload?.message || "Sell verification failed"
    };
  } catch (error) {
    console.error("SAFEGOLD SELL VERIFY ERROR:", error);
    return {
      ok: false,
      verified: {
        grams: 0,
        amount: 0,
        rateId: String(rateId || "")
      },
      message: "Sell verification failed"
    };
  }
};
