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

const extractFirstDefined = (data, paths = []) => {
  const payload = Array.isArray(data) ? data[0] : data;

  for (const path of paths) {
    const value = path(payload);
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return undefined;
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
    txId: String(
      result?.txId ||
        result?.transactionId ||
        result?.txnId ||
        fallback.txId ||
        ""
    ),
    status: String(result?.status || result?.transactionStatus || ""),
    raw: result
  };
};

const extractTransactionStatus = (data, fallback = {}) => {
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
    txId: String(
      result?.txId ||
        result?.transactionId ||
        result?.txnId ||
        fallback.txId ||
        ""
    ),
    status: String(
      result?.status ||
        result?.transactionStatus ||
        result?.orderStatus ||
        fallback.status ||
        ""
    ),
    message: String(
      result?.message ||
        result?.statusMessage ||
        fallback.message ||
        ""
    ),
    grams: toNumber(
      result?.goldAmount ??
        result?.quantity ??
        result?.grams ??
        fallback.grams
    ),
    amount: toNumber(
      result?.buyPrice ??
        result?.amount ??
        result?.payableAmount ??
        fallback.amount
    ),
    raw: result
  };
};

const extractSafeGoldResult = (data) => {
  const payload = Array.isArray(data) ? data[0] : data;
  return (
    payload?.payload?.result?.data ||
    payload?.payload?.result ||
    payload?.result?.data ||
    payload?.result ||
    payload?.data ||
    payload ||
    {}
  );
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
    const applicableTax = toNumber(
      extractFirstDefined(data, [
        (payload) => payload?.applicableTax,
        (payload) => payload?.data?.applicableTax,
        (payload) => payload?.payload?.applicableTax,
        (payload) => payload?.payload?.data?.applicableTax,
        (payload) => payload?.result?.applicableTax,
        (payload) => payload?.result?.data?.applicableTax
      ])
    );
    const finalPrice = extractRateValue(data, ["finalPrice", "finalGstPrice"]);
    const rateValidity =
      extractFirstDefined(data, [
        (payload) => payload?.rateValidity,
        (payload) => payload?.data?.rateValidity,
        (payload) => payload?.payload?.rateValidity,
        (payload) => payload?.payload?.data?.rateValidity,
        (payload) => payload?.result?.rateValidity,
        (payload) => payload?.result?.data?.rateValidity
      ]) || "";

    return {
      ok: res.ok && price > 0,
      price,
      pricePerGram: price,
      applicableTax,
      finalPrice,
      finalGstPrice: finalPrice,
      rateId,
      rateValidity,
      raw: data,
      message: res.ok ? "" : data?.message || data?.payload?.message || "Failed to fetch buy price"
    };
  } catch (error) {
    console.error("SAFEGOLD BUY PRICE API ERROR:", error);
    return {
      ok: false,
      price: 0,
      pricePerGram: 0,
      applicableTax: 0,
      finalPrice: 0,
      finalGstPrice: 0,
      rateId: "",
      rateValidity: "",
      message: "Failed to fetch buy price"
    };
  }
};

export const registerSafeGoldUser = async ({
  name,
  mobileNo,
  pinCode,
  email
}) => {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: String(name || "").trim(),
        mobileNo: String(mobileNo || "").trim(),
        pinCode: String(pinCode || "").trim(),
        email: String(email || "").trim()
      })
    });

    const data = await getJson(res);
    const payload = Array.isArray(data) ? data[0] : data;

    return {
      ok: res.ok && Boolean(payload?.id),
      user: {
        id: String(payload?.id || ""),
        name: payload?.name || name || "",
        mobileNo: payload?.mobileNo || mobileNo || "",
        pinCode: payload?.pincode || payload?.pinCode || pinCode || "",
        email: payload?.email || email || "",
        goldBalance: toNumber(payload?.goldBalance)
      },
      raw: data,
      message: res.ok
        ? ""
        : payload?.message || data?.message || "SafeGold user registration failed"
    };
  } catch (error) {
    console.error("SAFEGOLD USER REGISTER ERROR:", error);
    return {
      ok: false,
      user: {
        id: "",
        name: name || "",
        mobileNo: mobileNo || "",
        pinCode: pinCode || "",
        email: email || "",
        goldBalance: 0
      },
      message: "SafeGold user registration failed"
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
    const rateValidity =
      extractFirstDefined(data, [
        (payload) => payload?.rateValidity,
        (payload) => payload?.data?.rateValidity,
        (payload) => payload?.payload?.rateValidity,
        (payload) => payload?.payload?.data?.rateValidity,
        (payload) => payload?.result?.rateValidity,
        (payload) => payload?.result?.data?.rateValidity
      ]) || "";

    return {
      ok: res.ok && price > 0,
      price,
      pricePerGram: price,
      rateId,
      rateValidity,
      raw: data,
      message: res.ok ? "" : data?.message || data?.payload?.message || "Failed to fetch sell price"
    };
  } catch (error) {
    console.error("SAFEGOLD SELL PRICE API ERROR:", error);
    return {
      ok: false,
      price: 0,
      pricePerGram: 0,
      rateId: "",
      rateValidity: "",
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
  phoneNumber,
  goldAmount,
  buyPrice
}) => {
  try {
    const body = {
      request: {
        goldAmount: Number(goldAmount)
      }
    };

    if (partnerUserId) {
      body.partnerUserId = Number(partnerUserId);
    } else if (phoneNumber) {
      body.phoneNumber = String(phoneNumber).trim();
    }

    const res = await fetch(`${BASE_URL}/api/v1/gold/buy/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const data = await getJson(res);
    return {
      ok: res.ok,
      verified: extractVerifiedTrade(data, {
        grams: goldAmount,
        amount: buyPrice
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
        txId: "",
        status: ""
      },
      message: "Buy verification failed"
    };
  }
};

export const confirmSafeGoldBuy = async ({
  partnerUserId,
  txId,
  pincode,
  date
}) => {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/gold/buy/confirm`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        partnerUserId: Number(partnerUserId),
        request: {
          txId: Number(txId),
          ...(pincode ? { pincode: String(pincode) } : {}),
          date: date || new Date().toISOString().slice(0, 19).replace("T", " ")
        }
      })
    });

    const data = await getJson(res);
    return {
      ok: res.ok,
      confirmation: extractTransactionStatus(data, { txId }),
      raw: data,
      message: res.ok
        ? ""
        : data?.message || data?.payload?.message || "Buy confirmation failed"
    };
  } catch (error) {
    console.error("SAFEGOLD BUY CONFIRM ERROR:", error);
    return {
      ok: false,
      confirmation: extractTransactionStatus({}, { txId }),
      message: "Buy confirmation failed"
    };
  }
};

export const fetchSafeGoldBuyStatus = async ({ txId }) => {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/gold/buy/status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        txId: String(txId || "")
      })
    });

    const data = await getJson(res);
    return {
      ok: res.ok,
      status: extractTransactionStatus(data, { txId }),
      raw: data,
      message: res.ok
        ? ""
        : data?.message || data?.payload?.message || "Buy status fetch failed"
    };
  } catch (error) {
    console.error("SAFEGOLD BUY STATUS ERROR:", error);
    return {
      ok: false,
      status: extractTransactionStatus({}, { txId }),
      message: "Buy status fetch failed"
    };
  }
};

export const verifySafeGoldSell = async ({
  partnerUserId,
  phoneNumber,
  goldAmount,
  sellPrice
}) => {
  try {
    const body = {
      request: {
        goldAmount: Number(goldAmount)
      }
    };

    if (partnerUserId) {
      body.partnerUserId = Number(partnerUserId);
    } else if (phoneNumber) {
      body.phoneNumber = String(phoneNumber).trim();
    }

    const res = await fetch(`${BASE_URL}/api/v1/gold/sell/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const data = await getJson(res);
    return {
      ok: res.ok,
      verified: extractVerifiedTrade(data, {
        grams: goldAmount,
        amount: sellPrice
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
        amount: 0
      },
      message: "Sell verification failed"
    };
  }
};

export const confirmSafeGoldSell = async ({
  partnerUserId,
  txId,
  date
}) => {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/gold/sell/confirm`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        partnerUserId: Number(partnerUserId),
        request: {
          txId: Number(txId),
          date: date || new Date().toISOString()
        }
      })
    });

    const data = await getJson(res);
    return {
      ok: res.ok,
      confirmation: extractTransactionStatus(data, { txId }),
      raw: data,
      message: res.ok ? "" : data?.message || data?.payload?.message || "Sell confirmation failed"
    };
  } catch (error) {
    console.error("SAFEGOLD SELL CONFIRM ERROR:", error);
    return {
      ok: false,
      confirmation: extractTransactionStatus({}, { txId }),
      message: "Sell confirmation failed"
    };
  }
};

export const fetchSafeGoldSellStatus = async ({ txId }) => {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/gold/sell/status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        txId: String(txId || "")
      })
    });

    const data = await getJson(res);
    return {
      ok: res.ok,
      status: extractTransactionStatus(data, { txId }),
      raw: data,
      message: res.ok ? "" : data?.message || data?.payload?.message || "Sell status fetch failed"
    };
  } catch (error) {
    console.error("SAFEGOLD SELL STATUS ERROR:", error);
    return {
      ok: false,
      status: extractTransactionStatus({}, { txId }),
      message: "Sell status fetch failed"
    };
  }
};

export const fetchSafeGoldUserBalance = async ({ partnerUserId }) => {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/users/balance`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        partnerUserId: Number(partnerUserId)
      })
    });

    const data = await getJson(res);
    return {
      ok: res.ok,
      balance: extractSafeGoldResult(data),
      raw: data,
      message: res.ok ? "" : data?.message || data?.payload?.message || "Unable to fetch SafeGold balance"
    };
  } catch (error) {
    console.error("SAFEGOLD BALANCE ERROR:", error);
    return {
      ok: false,
      balance: {},
      message: "Unable to fetch SafeGold balance"
    };
  }
};

export const fetchSafeGoldUserTransactions = async ({ partnerUserId }) => {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/users/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        partnerUserId: Number(partnerUserId)
      })
    });

    const data = await getJson(res);
    const result = extractSafeGoldResult(data);

    return {
      ok: res.ok,
      transactions: Array.isArray(result) ? result : Array.isArray(result?.transactions) ? result.transactions : [],
      raw: data,
      message: res.ok ? "" : data?.message || data?.payload?.message || "Unable to fetch SafeGold transactions"
    };
  } catch (error) {
    console.error("SAFEGOLD TRANSACTIONS ERROR:", error);
    return {
      ok: false,
      transactions: [],
      message: "Unable to fetch SafeGold transactions"
    };
  }
};

export const verifySafeGoldRedeem = async ({
  partnerUserId,
  request
}) => {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/gold/redeem/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        partnerUserId: Number(partnerUserId),
        request
      })
    });

    const data = await getJson(res);
    return {
      ok: res.ok,
      verified: extractVerifiedTrade(data),
      raw: data,
      message: res.ok ? "" : data?.message || data?.payload?.message || "Redeem verification failed"
    };
  } catch (error) {
    console.error("SAFEGOLD REDEEM VERIFY ERROR:", error);
    return {
      ok: false,
      verified: {},
      message: "Redeem verification failed"
    };
  }
};

export const confirmSafeGoldRedeem = async ({
  partnerUserId,
  txId,
  date
}) => {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/gold/redeem/confirm`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        partnerUserId: Number(partnerUserId),
        request: {
          txId: Number(txId),
          date: date || new Date().toISOString()
        }
      })
    });

    const data = await getJson(res);
    return {
      ok: res.ok,
      confirmation: extractTransactionStatus(data, { txId }),
      raw: data,
      message: res.ok ? "" : data?.message || data?.payload?.message || "Redeem confirmation failed"
    };
  } catch (error) {
    console.error("SAFEGOLD REDEEM CONFIRM ERROR:", error);
    return {
      ok: false,
      confirmation: extractTransactionStatus({}, { txId }),
      message: "Redeem confirmation failed"
    };
  }
};

export const fetchSafeGoldRedeemStatus = async ({ txId }) =>
  fetchSafeGoldGenericTransaction("/api/v1/gold/redeem/status", txId, "Redeem status fetch failed");

export const fetchSafeGoldRedeemDispatchStatus = async ({ txId }) =>
  fetchSafeGoldGenericTransaction("/api/v1/gold/redeem/dispatch-status", txId, "Redeem dispatch status fetch failed");

const fetchSafeGoldGenericTransaction = async (path, txId, fallbackMessage) => {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        txId: String(txId || "")
      })
    });

    const data = await getJson(res);
    return {
      ok: res.ok,
      status: extractTransactionStatus(data, { txId }),
      raw: data,
      message: res.ok ? "" : data?.message || data?.payload?.message || fallbackMessage
    };
  } catch (error) {
    console.error("SAFEGOLD TX STATUS ERROR:", error);
    return {
      ok: false,
      status: extractTransactionStatus({}, { txId }),
      message: fallbackMessage
    };
  }
};

export const validateSafeGoldPincode = async ({ pinCode, productWeight }) => {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/gold/pincode/validate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        pinCode: String(pinCode || ""),
        productWeight: Number(productWeight)
      })
    });

    const data = await getJson(res);
    return {
      ok: res.ok,
      validation: extractSafeGoldResult(data),
      raw: data,
      message: res.ok ? "" : data?.message || data?.payload?.message || "Pincode validation failed"
    };
  } catch (error) {
    console.error("SAFEGOLD PINCODE VALIDATE ERROR:", error);
    return {
      ok: false,
      validation: {},
      message: "Pincode validation failed"
    };
  }
};

export const fetchSafeGoldHistoricalData = async ({ fromDate, toDate }) => {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/gold/historical-data`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ fromDate, toDate })
    });
    const data = await getJson(res);
    return { ok: res.ok, data: extractSafeGoldResult(data), raw: data, message: res.ok ? "" : "Historical data fetch failed" };
  } catch (error) {
    console.error("SAFEGOLD HISTORICAL DATA ERROR:", error);
    return { ok: false, data: [], message: "Historical data fetch failed" };
  }
};

export const fetchSafeGoldHistorical = async ({ fromDate, toDate, type = "d" }) => {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/gold/historical`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ fromDate, toDate, type })
    });
    const data = await getJson(res);
    return { ok: res.ok, data: extractSafeGoldResult(data), raw: data, message: res.ok ? "" : "Historical fetch failed" };
  } catch (error) {
    console.error("SAFEGOLD HISTORICAL ERROR:", error);
    return { ok: false, data: [], message: "Historical fetch failed" };
  }
};

export const fetchSafeGoldCashBalance = async ({ partnerUserId }) =>
  fetchSafeGoldUserEndpoint("/api/v1/gold/cash-balance", { partnerUserId }, "Unable to fetch SafeGold cash balance");

export const updateSafeGoldKyc = async ({ partnerUserId, request }) =>
  fetchSafeGoldUserEndpoint("/api/v1/gold/kyc/update", { partnerUserId, request }, "Unable to update SafeGold KYC");

export const createSafeGoldTransfer = async ({ partnerUserId, request }) =>
  fetchSafeGoldUserEndpoint("/api/v1/gold/transfer/create", { partnerUserId, request }, "Unable to create SafeGold transfer");

export const fetchSafeGoldTransferStatus = async ({ clientReferenceId }) => {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/gold/transfer/status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        clientReferenceId: String(clientReferenceId || "")
      })
    });
    const data = await getJson(res);
    return { ok: res.ok, status: extractSafeGoldResult(data), raw: data, message: res.ok ? "" : "Unable to fetch transfer status" };
  } catch (error) {
    console.error("SAFEGOLD TRANSFER STATUS ERROR:", error);
    return { ok: false, status: {}, message: "Unable to fetch transfer status" };
  }
};

export const fetchSafeGoldInvoice = async ({ txId }) => {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/gold/invoice`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        txId: String(txId || "")
      })
    });
    const data = await getJson(res);
    return { ok: res.ok, invoice: extractSafeGoldResult(data), raw: data, message: res.ok ? "" : "Unable to fetch invoice" };
  } catch (error) {
    console.error("SAFEGOLD INVOICE ERROR:", error);
    return { ok: false, invoice: {}, message: "Unable to fetch invoice" };
  }
};

const fetchSafeGoldUserEndpoint = async (path, body, fallbackMessage) => {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...body,
        ...(body?.partnerUserId !== undefined
          ? { partnerUserId: Number(body.partnerUserId) }
          : {})
      })
    });
    const data = await getJson(res);
    return { ok: res.ok, data: extractSafeGoldResult(data), raw: data, message: res.ok ? "" : data?.message || data?.payload?.message || fallbackMessage };
  } catch (error) {
    console.error("SAFEGOLD USER ENDPOINT ERROR:", error);
    return { ok: false, data: {}, message: fallbackMessage };
  }
};
