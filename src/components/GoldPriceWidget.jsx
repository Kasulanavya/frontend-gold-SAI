"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion as Motion } from "framer-motion";
import { getUserProfile } from "../api/authApi";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import {
  createAugmontBuyOrder,
  createAugmontSellOrder,
  fetchAugmontBuyInvoice,
  fetchAugmontSellInvoice,
  fetchAugmontRateHistory,
  fetchAugmontSipRates,
  fetchLiveGoldRateSnapshot,
  getAugmontUser
} from "../api/augmontApi";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2
});

const cardAnimation = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.2, duration: 0.6 }
  })
};

const formatCurrency = (value) => currencyFormatter.format(Number(value) || 0);

const getDateRange = () => {
  const toDate = new Date();
  const fromDate = new Date();
  fromDate.setDate(toDate.getDate() - 20);

  return {
    fromDate: fromDate.toISOString().slice(0, 10),
    toDate: toDate.toISOString().slice(0, 10)
  };
};

function GoldPriceWidget() {
  const [metalType, setMetalType] = useState("gold");
  const [chartData, setChartData] = useState([]);
  const [liveRates, setLiveRates] = useState({
    gold: { currentPrice: 0, buyPrice: 0, sellPrice: 0 },
    silver: { currentPrice: 0, buyPrice: 0, sellPrice: 0 },
    updatedAt: ""
  });
  const [sipRates, setSipRates] = useState({
    gold: { currentPrice: 0, buyPrice: 0 },
    silver: { currentPrice: 0, buyPrice: 0 }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [buyTradeMode, setBuyTradeMode] = useState("quantity");
  const [buyQuantity, setBuyQuantity] = useState("0.1000");
  const [buyAmount, setBuyAmount] = useState("");
  const [buyLoading, setBuyLoading] = useState(false);
  const [buyMessage, setBuyMessage] = useState("");
  const [buyError, setBuyError] = useState("");
  const [buyResult, setBuyResult] = useState({});
  const [buyTransactionId, setBuyTransactionId] = useState("");
  const [buyInvoiceLoading, setBuyInvoiceLoading] = useState(false);
  const [buyInvoiceError, setBuyInvoiceError] = useState("");
  const [buyInvoiceResult, setBuyInvoiceResult] = useState({});
  const [sellQuantity, setSellQuantity] = useState("0.0500");
  const [sellAccountName, setSellAccountName] = useState("");
  const [sellAccountNumber, setSellAccountNumber] = useState("");
  const [sellIfscCode, setSellIfscCode] = useState("");
  const [sellLoading, setSellLoading] = useState(false);
  const [sellMessage, setSellMessage] = useState("");
  const [sellError, setSellError] = useState("");
  const [sellResult, setSellResult] = useState({});
  const [sellTransactionId, setSellTransactionId] = useState("");
  const [sellInvoiceLoading, setSellInvoiceLoading] = useState(false);
  const [sellInvoiceError, setSellInvoiceError] = useState("");
  const [sellInvoiceResult, setSellInvoiceResult] = useState({});

  const loadRates = useCallback(async () => {
    setIsLoading(true);
    setError("");

    const { fromDate, toDate } = getDateRange();
    const [liveResponse, historyResponse, sipResponse] = await Promise.all([
      fetchLiveGoldRateSnapshot(),
      fetchAugmontRateHistory({
        fromDate,
        toDate,
        metalType
      }),
      fetchAugmontSipRates()
    ]);

    if (!liveResponse?.ok && !historyResponse?.ok && !sipResponse?.ok) {
      setError(
        liveResponse?.message ||
          historyResponse?.message ||
          sipResponse?.message ||
          "Unable to load Augmont rates"
      );
      setChartData([]);
      setIsLoading(false);
      return;
    }

    if (liveResponse?.ok) {
      setLiveRates(liveResponse.snapshot);
    }

    if (historyResponse?.ok) {
      setChartData(historyResponse.history || []);
    } else {
      setChartData([]);
    }

    if (sipResponse?.ok) {
      setSipRates(sipResponse.snapshot);
    }

    setIsLoading(false);
  }, [metalType]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadRates();
    }, 0);

    const intervalId = window.setInterval(loadRates, 60000);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, [loadRates]);

  const selectedLiveRates = liveRates?.[metalType] || {};

  const priceChange = useMemo(() => {
    if (chartData.length < 2) return 0;

    const first = chartData[0]?.price || 0;
    const last = chartData[chartData.length - 1]?.price || 0;

    if (!first) return 0;
    return ((last - first) / first) * 100;
  }, [chartData]);

  const chartRange = useMemo(() => {
    if (!chartData.length) {
      return [0, 100];
    }

    const prices = chartData.map((point) => point.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const padding = Math.max((max - min) * 0.25, 5);

    return [Math.max(0, min - padding), max + padding];
  }, [chartData]);

  const generateAugmontTxnId = (prefix) =>
    `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  const handleBuyOrder = async () => {
    setBuyLoading(true);
    setBuyError("");
    setBuyMessage("");
    setBuyResult({});
    setBuyInvoiceResult({});
    setBuyInvoiceError("");
    setBuyTransactionId("");

    const profile = getUserProfile() || {};
    const augmontUser = getAugmontUser() || {};
    const uniqueId = String(
      profile?.uniqueId ||
        augmontUser?.uniqueId ||
        profile?.customerMappedId ||
        augmontUser?.customerMappedId ||
        ""
    ).trim();
    const phoneNumber = String(
      profile?.mobileNumber || augmontUser?.mobileNumber || ""
    ).trim();
    const blockId = String(liveRates?.blockId || "").trim();
    const lockPrice = Number(selectedLiveRates.buyPrice || 0);
    const merchantTransactionId = generateAugmontTxnId("AUGBUY");
    const quantityValue = Number.parseFloat(buyQuantity || "0");
    const amountValue = Number.parseFloat(buyAmount || "0");
    const useQuantity = buyTradeMode === "quantity";

    if (!uniqueId || !phoneNumber || !blockId || lockPrice <= 0) {
      setBuyLoading(false);
      setBuyError("Unique id, phone number, block id, and live buy rate are required.");
      return;
    }

    if (useQuantity && !(quantityValue > 0)) {
      setBuyLoading(false);
      setBuyError("Enter a valid quantity to buy.");
      return;
    }

    if (!useQuantity && !(amountValue > 0)) {
      setBuyLoading(false);
      setBuyError("Enter a valid amount to buy.");
      return;
    }

    const request = {
      uniqueId,
      phoneNumber,
      metalType,
      modeOfPayment: "UPI",
      merchantTransactionId,
      blockId,
      lockPrice: String(lockPrice)
    };

    if (useQuantity) {
      request.quantity = quantityValue.toFixed(4);
    } else {
      request.amount = amountValue.toFixed(2);
    }

    const response = await createAugmontBuyOrder({
      request
    });

    setBuyLoading(false);

    if (!response?.ok) {
      setBuyError(response?.message || "Unable to create buy order.");
      return;
    }

    const order = response.order || {};
    const transactionId = String(
      order?.transactionId || order?.merchantTransactionId || ""
    ).trim();

    setBuyMessage(response.message || "Buy order created successfully.");
    setBuyResult(order);
    setBuyTransactionId(transactionId);
  };

  const handleBuyInvoice = async () => {
    setBuyInvoiceLoading(true);
    setBuyInvoiceError("");

    const transactionId = String(
      buyTransactionId || buyResult?.transactionId || buyResult?.merchantTransactionId || ""
    ).trim();

    if (!transactionId) {
      setBuyInvoiceLoading(false);
      setBuyInvoiceError("Buy transaction id is not available for invoice.");
      return;
    }

    const response = await fetchAugmontBuyInvoice({ transactionId });

    setBuyInvoiceLoading(false);

    if (!response?.ok) {
      setBuyInvoiceError(response?.message || "Unable to fetch buy invoice.");
      return;
    }

    setBuyInvoiceResult(response.invoice || {});
  };

  const handleSellOrder = async () => {
    setSellLoading(true);
    setSellError("");
    setSellMessage("");
    setSellResult({});
    setSellInvoiceResult({});
    setSellInvoiceError("");
    setSellTransactionId("");

    const profile = getUserProfile() || {};
    const augmontUser = getAugmontUser() || {};
    const uniqueId = String(
      profile?.uniqueId ||
        augmontUser?.uniqueId ||
        profile?.customerMappedId ||
        augmontUser?.customerMappedId ||
        ""
    ).trim();
    const phoneNumber = String(
      profile?.mobileNumber || augmontUser?.mobileNumber || ""
    ).trim();
    const blockId = String(liveRates?.blockId || "").trim();
    const lockPrice = Number(selectedLiveRates.sellPrice || 0);
    const merchantTransactionId = generateAugmontTxnId("AUGSEL");
    const quantityValue = Number.parseFloat(sellQuantity || "0");
    const accountName = String(sellAccountName || "").trim();
    const accountNumber = String(sellAccountNumber || "").trim();
    const ifscCode = String(sellIfscCode || "").trim().toUpperCase();

    if (!uniqueId || !phoneNumber || !blockId || lockPrice <= 0) {
      setSellLoading(false);
      setSellError("Unique id, phone number, block id, and live sell rate are required.");
      return;
    }

    if (!(quantityValue > 0)) {
      setSellLoading(false);
      setSellError("Enter a valid quantity to sell.");
      return;
    }

    if (!accountName || !accountNumber || !ifscCode) {
      setSellLoading(false);
      setSellError("Please enter account name, account number, and IFSC code before selling.");
      return;
    }

    const request = {
      uniqueId,
      phoneNumber,
      metalType,
      modeOfPayment: "UPI",
      merchantTransactionId,
      blockId,
      lockPrice: String(lockPrice),
      quantity: quantityValue.toFixed(4),
      accountName,
      accountNumber,
      ifscCode
    };

    const response = await createAugmontSellOrder({
      request
    });

    setSellLoading(false);

    if (!response?.ok) {
      setSellError(response?.message || "Unable to create sell order.");
      return;
    }

    const order = response.order || {};
    const transactionId = String(
      order?.transactionId || order?.merchantTransactionId || ""
    ).trim();

    setSellMessage(response.message || "Sell order created successfully.");
    setSellResult(order);
    setSellTransactionId(transactionId);
  };

  const handleSellInvoice = async () => {
    setSellInvoiceLoading(true);
    setSellInvoiceError("");

    const transactionId = String(
      sellTransactionId || sellResult?.transactionId || sellResult?.merchantTransactionId || ""
    ).trim();

    if (!transactionId) {
      setSellInvoiceLoading(false);
      setSellInvoiceError("Sell transaction id is not available for invoice.");
      return;
    }

    const response = await fetchAugmontSellInvoice({ transactionId });

    setSellInvoiceLoading(false);

    if (!response?.ok) {
      setSellInvoiceError(response?.message || "Unable to fetch sell invoice.");
      return;
    }

    setSellInvoiceResult(response.invoice || {});
  };

  const liveRateCards = [
    {
      title: `${metalType === "gold" ? "Gold" : "Silver"} Spot`,
      price: formatCurrency(selectedLiveRates.currentPrice || 0),
      sub: "/unit",
      extra: `${priceChange >= 0 ? "+" : ""}${priceChange.toFixed(2)}%`,
      color: priceChange >= 0 ? "text-green-400" : "text-red-400"
    },
    {
      title: "Live Buy Rate",
      price: formatCurrency(selectedLiveRates.buyPrice || 0),
      sub: "/unit"
    },
    {
      title: "Live Sell Rate",
      price: formatCurrency(selectedLiveRates.sellPrice || 0),
      sub: "/unit"
    }
  ];

  const sipRateCards = [
    {
      title: "Gold SIP",
      price: formatCurrency(sipRates.gold?.buyPrice || 0),
      sub: "/unit",
      extra: "Augmont SIP"
    },
    {
      title: "Silver SIP",
      price: formatCurrency(sipRates.silver?.buyPrice || 0),
      sub: "/unit",
      extra: "Augmont SIP"
    }
  ];

  const actionButtons = ["Buy", "Sell"];

  return (
    <section className="bg-black py-10 text-white">
      <div className="mx-auto max-w-7xl px-6">
        <Motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10 text-center"
        >
          <p className="font-semibold tracking-wider text-yellow-500">
            MARKET DATA
          </p>

          <h2 className="mt-2 text-4xl font-bold lg:text-5xl">
            Augmont <span className="text-yellow-400">Rates</span>
          </h2>

          <p className="mt-3 text-gray-400">
            Live rates, SIP rates, and trend history from the backend wrapper APIs
          </p>
        </Motion.div>

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex rounded-full border border-white/10 bg-[#111] p-1">
            {["gold", "silver"].map((metal) => (
              <button
                key={metal}
                onClick={() => setMetalType(metal)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  metalType === metal
                    ? "bg-yellow-500 text-black"
                    : "text-white/65 hover:text-white"
                }`}
              >
                {metal}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 text-sm text-white/55">
            {liveRates.updatedAt ? <span>Updated live from backend</span> : null}
            <button
              onClick={loadRates}
              className="rounded-full border border-white/10 px-4 py-2 text-white/75 transition hover:border-yellow-500/30 hover:text-white"
            >
              Refresh Rates
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-8">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="h-[28rem] animate-pulse rounded-3xl border border-white/10 bg-[#0f0f0f]" />
              <div className="h-[28rem] animate-pulse rounded-3xl border border-white/10 bg-[#0f0f0f]" />
            </div>
            <div className="h-[26rem] animate-pulse rounded-3xl border border-white/10 bg-[#0f0f0f]" />
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-8 text-center">
            <p className="text-red-300">{error}</p>
            <button
              onClick={loadRates}
              className="mt-4 rounded-full bg-yellow-500 px-6 py-3 font-semibold text-black"
            >
              Retry Rates
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid gap-6 lg:grid-cols-2">
              <Motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(15,15,15,0.98),rgba(8,8,8,0.96))] p-7 shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.22em] text-yellow-500/80">
                      Live Rates
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">
                      {metalType === "gold" ? "Gold" : "Silver"} buy and sell view
                    </h3>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-white/55">
                      Rates pulled from <code>/api/v1/rates/live</code> for the selected metal.
                    </p>
                  </div>
                  <span className="rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/55">
                    Live
                  </span>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  {liveRateCards.map((card, i) => (
                    <Motion.div
                      key={card.title}
                      custom={i}
                      initial="hidden"
                      whileInView="visible"
                      variants={cardAnimation}
                      className="rounded-2xl border border-white/10 bg-black/25 p-5 transition-all hover:border-yellow-500/30"
                    >
                      <p className="mb-2 text-sm text-gray-400">{card.title}</p>
                      <div className="flex items-end justify-between gap-4">
                        <h4 className="text-3xl font-bold lg:text-4xl">
                          {card.price}
                          <span className="ml-1 text-lg text-gray-400">{card.sub}</span>
                        </h4>
                        {card.extra ? (
                          <span className={`text-sm ${card.color || "text-gray-400"}`}>
                            {card.extra}
                          </span>
                        ) : null}
                      </div>
                    </Motion.div>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-white/45">Buy mode</p>
                      <p className="mt-1 text-sm text-white/70">Choose quantity or amount, not both.</p>
                    </div>
                    <div className="flex rounded-full border border-white/10 bg-[#111] p-1">
                      {["quantity", "amount"].map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setBuyTradeMode(mode)}
                          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                            buyTradeMode === mode
                              ? "bg-yellow-500 text-black"
                              : "text-white/65 hover:text-white"
                          }`}
                        >
                          {mode === "quantity" ? "Quantity" : "Amount"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-white/45">
                        {buyTradeMode === "quantity" ? "Quantity" : "Amount"}
                      </p>
                      <input
                        value={buyTradeMode === "quantity" ? buyQuantity : buyAmount}
                        onChange={(event) => {
                          const value = event.target.value;
                          if (buyTradeMode === "quantity") {
                            setBuyQuantity(value);
                          } else {
                            setBuyAmount(value);
                          }
                        }}
                        placeholder={buyTradeMode === "quantity" ? "0.1000" : "1000.00"}
                        className="mt-3 w-full rounded-xl border border-white/10 bg-[#0b0b0b] px-4 py-3 text-white outline-none"
                      />
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-white/45">Lock Price</p>
                      <p className="mt-3 text-2xl font-semibold text-white">
                        {formatCurrency(selectedLiveRates.buyPrice || 0)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-white/45">Sell quantity</p>
                      <p className="mt-1 text-sm text-white/70">
                        Sell uses the stored profile and bank context from the backend.
                      </p>
                    </div>
                    <div className="rounded-full border border-white/10 bg-[#111] px-4 py-2 text-sm text-white/65">
                      {formatCurrency(selectedLiveRates.sellPrice || 0)} / unit
                    </div>
                  </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/45">Quantity</p>
                    <input
                      value={sellQuantity}
                        onChange={(event) => setSellQuantity(event.target.value)}
                        placeholder="0.0500"
                        className="mt-3 w-full rounded-xl border border-white/10 bg-[#0b0b0b] px-4 py-3 text-white outline-none"
                      />
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-white/45">Lock Price</p>
                      <p className="mt-3 text-2xl font-semibold text-white">
                        {formatCurrency(selectedLiveRates.sellPrice || 0)}
                      </p>
                    </div>
                  </div>

                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/45">Account Name</p>
                    <input
                      value={sellAccountName}
                      onChange={(event) => setSellAccountName(event.target.value)}
                      placeholder="Enter account name"
                      className="mt-3 w-full rounded-xl border border-white/10 bg-[#0b0b0b] px-4 py-3 text-white outline-none"
                    />
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/45">Account Number</p>
                    <input
                      value={sellAccountNumber}
                      onChange={(event) => setSellAccountNumber(event.target.value.replace(/\D/g, ""))}
                      placeholder="Enter account number"
                      className="mt-3 w-full rounded-xl border border-white/10 bg-[#0b0b0b] px-4 py-3 text-white outline-none"
                    />
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/45">IFSC Code</p>
                    <input
                      value={sellIfscCode}
                      onChange={(event) => setSellIfscCode(event.target.value.toUpperCase())}
                      placeholder="Enter IFSC code"
                      className="mt-3 w-full rounded-xl border border-white/10 bg-[#0b0b0b] px-4 py-3 text-white outline-none"
                    />
                  </div>
                </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  {actionButtons.map((label) => (
                    <button
                      key={label}
                      type="button"
                      onClick={label === "Buy" ? handleBuyOrder : handleSellOrder}
                      className="rounded-full border border-yellow-500/35 px-5 py-2.5 text-sm font-semibold text-yellow-200 transition hover:bg-yellow-500 hover:text-black"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </Motion.div>

              <Motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(15,15,15,0.98),rgba(8,8,8,0.96))] p-7 shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.22em] text-yellow-500/80">
                      SIP Rates
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">
                      Regular accumulation view
                    </h3>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-white/55">
                      Rates pulled from <code>/api/v1/rates/sip</code> and shown separately from live pricing.
                    </p>
                  </div>
                  <span className="rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/55">
                    SIP
                  </span>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {sipRateCards.map((card, i) => (
                    <Motion.div
                      key={card.title}
                      custom={i}
                      initial="hidden"
                      whileInView="visible"
                      variants={cardAnimation}
                      className="rounded-2xl border border-white/10 bg-black/25 p-5 transition-all hover:border-yellow-500/30"
                    >
                      <p className="mb-2 text-sm text-gray-400">{card.title}</p>
                      <div className="flex items-end justify-between gap-4">
                        <h4 className="text-3xl font-bold lg:text-4xl">
                          {card.price}
                          <span className="ml-1 text-lg text-gray-400">{card.sub}</span>
                        </h4>
                        {card.extra ? (
                          <span className="text-sm text-gray-400">{card.extra}</span>
                        ) : null}
                      </div>
                    </Motion.div>
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  {actionButtons.map((label) => (
                    <button
                      key={`${label}-sip`}
                      type="button"
                      onClick={label === "Buy" ? handleBuyOrder : handleSellOrder}
                      className="rounded-full border border-yellow-500/35 px-5 py-2.5 text-sm font-semibold text-yellow-200 transition hover:bg-yellow-500 hover:text-black"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </Motion.div>
            </div>

            {buyError || buyMessage || Object.keys(buyResult).length > 0 || Object.keys(buyInvoiceResult).length > 0 ? (
              <Motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.05 }}
                className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(15,15,15,0.98),rgba(8,8,8,0.96))] p-7 shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.22em] text-yellow-500/80">
                      Buy Result
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">
                      {buyMessage || "Buy order response"}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleBuyOrder}
                    disabled={buyLoading}
                    className="rounded-full border border-yellow-500/35 px-5 py-2.5 text-sm font-semibold text-yellow-200 transition hover:bg-yellow-500 hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {buyLoading ? "Buying..." : "Buy Again"}
                  </button>
                </div>

                {buyError ? (
                  <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-200">
                    {buyError}
                  </div>
                ) : null}

                {buyResult && Object.keys(buyResult).length > 0 ? (
                  <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-black/25 p-5">
                      <p className="text-xs uppercase tracking-[0.22em] text-white/45">
                        {metalType === "gold" ? "Gold Balance" : "Silver Balance"}
                      </p>
                      <p className="mt-3 text-3xl font-bold text-white">
                        {metalType === "gold"
                          ? String(buyResult?.goldBalance || "0.0000")
                          : String(buyResult?.silverBalance || "0.0000")}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/25 p-5">
                      <p className="text-xs uppercase tracking-[0.22em] text-white/45">
                        {buyTradeMode === "quantity" ? "Quantity" : "Amount"}
                      </p>
                      <p className="mt-3 text-3xl font-bold text-white">
                        {buyTradeMode === "quantity"
                          ? String(buyResult?.quantity || buyQuantity || "0.0000")
                          : String(buyAmount || buyResult?.amount || "0.00")}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/25 p-5">
                      <p className="text-xs uppercase tracking-[0.22em] text-white/45">
                        Total Amount
                      </p>
                      <p className="mt-3 text-3xl font-bold text-white">
                        Rs. {String(buyResult?.totalAmount || "0.00")}
                      </p>
                    </div>
                  </div>
                ) : null}

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleBuyInvoice}
                    disabled={buyInvoiceLoading || !buyTransactionId}
                    className="rounded-full bg-yellow-500 px-5 py-2.5 text-sm font-semibold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {buyInvoiceLoading ? "Fetching Invoice..." : "Invoice"}
                  </button>
                </div>

                {buyInvoiceError ? (
                  <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-200">
                    {buyInvoiceError}
                  </div>
                ) : null}

                {buyInvoiceResult && Object.keys(buyInvoiceResult).length > 0 ? (
                  <div className="mt-6 space-y-6 rounded-3xl border border-white/10 bg-black/25 p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                      <div>
                        <p className="text-sm uppercase tracking-[0.22em] text-yellow-500/80">
                          Invoice
                        </p>
                        <h4 className="mt-2 text-2xl font-semibold text-white">
                          {String(buyInvoiceResult?.invoiceNumber || "Invoice fetched successfully")}
                        </h4>
                      </div>
                      <div className="text-right text-sm text-white/55">
                        <p>{String(buyInvoiceResult?.invoiceDate || "")}</p>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {[
                        ["Name", buyInvoiceResult?.userInfo?.name],
                        ["Address", buyInvoiceResult?.userInfo?.address],
                        ["City", buyInvoiceResult?.userInfo?.city],
                        ["State", buyInvoiceResult?.userInfo?.state],
                        ["Pincode", buyInvoiceResult?.userInfo?.pincode],
                        ["Email", buyInvoiceResult?.userInfo?.email],
                        ["Mobile Number", buyInvoiceResult?.userInfo?.mobileNumber],
                        ["Unique ID", buyInvoiceResult?.userInfo?.uniqueId],
                        ["Transaction ID", buyInvoiceResult?.transactionId],
                        ["Quantity", buyInvoiceResult?.quantity],
                        ["Metal Type", buyInvoiceResult?.metalType],
                        ["HSN Code", buyInvoiceResult?.hsnCode],
                        ["Rate", buyInvoiceResult?.rate],
                        ["Unit Type", buyInvoiceResult?.unitType],
                        ["Gross Amount", buyInvoiceResult?.grossAmount],
                        ["Net Amount", buyInvoiceResult?.netAmount]
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-2xl border border-white/10 bg-[#0b0b0b] p-4">
                          <p className="text-xs uppercase tracking-[0.22em] text-white/45">{label}</p>
                          <p className="mt-2 break-words text-sm text-white">{String(value || "-")}</p>
                        </div>
                      ))}
                    </div>

                    {Array.isArray(buyInvoiceResult?.taxes?.taxSplit) ? (
                      <div>
                        <p className="text-sm uppercase tracking-[0.22em] text-yellow-500/80">Taxes</p>
                        <div className="mt-4 grid gap-4 md:grid-cols-3">
                          <div className="rounded-2xl border border-white/10 bg-[#0b0b0b] p-4">
                            <p className="text-xs uppercase tracking-[0.22em] text-white/45">Total Tax Amount</p>
                            <p className="mt-2 text-sm text-white">
                              {String(buyInvoiceResult?.taxes?.totalTaxAmount || "-")}
                            </p>
                          </div>
                          {buyInvoiceResult.taxes.taxSplit.map((tax, index) => (
                            <div key={`${tax?.type || "tax"}-${index}`} className="rounded-2xl border border-white/10 bg-[#0b0b0b] p-4">
                              <p className="text-xs uppercase tracking-[0.22em] text-white/45">{String(tax?.type || `Tax ${index + 1}`)}</p>
                              <p className="mt-2 text-sm text-white">{String(tax?.taxAmount || "-")}</p>
                              <p className="mt-1 text-xs text-white/45">{String(tax?.taxPerc || "-")}%</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </Motion.div>
            ) : null}

            {(sellError || sellMessage || Object.keys(sellResult).length > 0 || Object.keys(sellInvoiceResult).length > 0) ? (
              <Motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.08 }}
                className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(15,15,15,0.98),rgba(8,8,8,0.96))] p-7 shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.22em] text-yellow-500/80">
                      Sell Result
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">
                      {sellMessage || "Sell order response"}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleSellOrder}
                    disabled={sellLoading}
                    className="rounded-full border border-yellow-500/35 px-5 py-2.5 text-sm font-semibold text-yellow-200 transition hover:bg-yellow-500 hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {sellLoading ? "Selling..." : "Sell Again"}
                  </button>
                </div>

                {sellError ? (
                  <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-200">
                    {sellError}
                  </div>
                ) : null}

                {sellResult && Object.keys(sellResult).length > 0 ? (
                  <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-black/25 p-5">
                      <p className="text-xs uppercase tracking-[0.22em] text-white/45">
                        {metalType === "gold" ? "Gold Balance" : "Silver Balance"}
                      </p>
                      <p className="mt-3 text-3xl font-bold text-white">
                        {metalType === "gold"
                          ? String(sellResult?.goldBalance || "0.0000")
                          : String(sellResult?.silverBalance || "0.0000")}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/25 p-5">
                      <p className="text-xs uppercase tracking-[0.22em] text-white/45">
                        Quantity
                      </p>
                      <p className="mt-3 text-3xl font-bold text-white">
                        {String(sellResult?.quantity || sellQuantity || "0.0000")}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/25 p-5">
                      <p className="text-xs uppercase tracking-[0.22em] text-white/45">
                        Total Amount
                      </p>
                      <p className="mt-3 text-3xl font-bold text-white">
                        Rs. {String(sellResult?.totalAmount || "0.00")}
                      </p>
                    </div>
                  </div>
                ) : null}

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleSellInvoice}
                    disabled={sellInvoiceLoading || !sellTransactionId}
                    className="rounded-full bg-yellow-500 px-5 py-2.5 text-sm font-semibold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {sellInvoiceLoading ? "Fetching Invoice..." : "Invoice"}
                  </button>
                </div>

                {sellInvoiceError ? (
                  <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-200">
                    {sellInvoiceError}
                  </div>
                ) : null}

                {sellInvoiceResult && Object.keys(sellInvoiceResult).length > 0 ? (
                  <div className="mt-6 space-y-6 rounded-3xl border border-white/10 bg-black/25 p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                      <div>
                        <p className="text-sm uppercase tracking-[0.22em] text-yellow-500/80">
                          Invoice
                        </p>
                        <h4 className="mt-2 text-2xl font-semibold text-white">
                          {String(sellInvoiceResult?.invoiceNumber || "Invoice fetched successfully")}
                        </h4>
                      </div>
                      <div className="text-right text-sm text-white/55">
                        <p>{String(sellInvoiceResult?.invoiceDate || "")}</p>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {[
                        ["Name", sellInvoiceResult?.userInfo?.name],
                        ["Address", sellInvoiceResult?.userInfo?.address],
                        ["City", sellInvoiceResult?.userInfo?.city],
                        ["State", sellInvoiceResult?.userInfo?.state],
                        ["Pincode", sellInvoiceResult?.userInfo?.pincode],
                        ["Email", sellInvoiceResult?.userInfo?.email],
                        ["Mobile Number", sellInvoiceResult?.userInfo?.mobileNumber],
                        ["Unique ID", sellInvoiceResult?.userInfo?.uniqueId],
                        ["Transaction ID", sellInvoiceResult?.transactionId],
                        ["Quantity", sellInvoiceResult?.quantity],
                        ["Metal Type", sellInvoiceResult?.metalType],
                        ["HSN Code", sellInvoiceResult?.hsnCode],
                        ["Rate", sellInvoiceResult?.rate],
                        ["Unit Type", sellInvoiceResult?.unitType],
                        ["Gross Amount", sellInvoiceResult?.grossAmount],
                        ["Net Amount", sellInvoiceResult?.netAmount]
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-2xl border border-white/10 bg-[#0b0b0b] p-4">
                          <p className="text-xs uppercase tracking-[0.22em] text-white/45">{label}</p>
                          <p className="mt-2 break-words text-sm text-white">{String(value || "-")}</p>
                        </div>
                      ))}
                    </div>

                    {Array.isArray(sellInvoiceResult?.taxes?.taxSplit) ? (
                      <div>
                        <p className="text-sm uppercase tracking-[0.22em] text-yellow-500/80">Taxes</p>
                        <div className="mt-4 grid gap-4 md:grid-cols-3">
                          <div className="rounded-2xl border border-white/10 bg-[#0b0b0b] p-4">
                            <p className="text-xs uppercase tracking-[0.22em] text-white/45">Total Tax Amount</p>
                            <p className="mt-2 text-sm text-white">
                              {String(sellInvoiceResult?.taxes?.totalTaxAmount || "-")}
                            </p>
                          </div>
                          {sellInvoiceResult.taxes.taxSplit.map((tax, index) => (
                            <div key={`${tax?.type || "tax"}-${index}`} className="rounded-2xl border border-white/10 bg-[#0b0b0b] p-4">
                              <p className="text-xs uppercase tracking-[0.22em] text-white/45">{String(tax?.type || `Tax ${index + 1}`)}</p>
                              <p className="mt-2 text-sm text-white">{String(tax?.taxAmount || "-")}</p>
                              <p className="mt-1 text-xs text-white/45">{String(tax?.taxPerc || "-")}%</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </Motion.div>
            ) : null}

            <Motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.16),_transparent_38%),linear-gradient(180deg,_rgba(17,24,39,0.92),_rgba(8,8,8,0.98))] p-8"
            >
              <div className="pointer-events-none absolute inset-x-6 top-6 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold">History Trend</h3>
                  <p className="text-sm text-gray-400">
                    Augmont history API for {metalType}
                  </p>
                </div>

                <span
                  className={`rounded-full px-4 py-1 text-sm ${
                    priceChange >= 0
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {priceChange >= 0 ? "Up" : "Down"} {Math.abs(priceChange).toFixed(2)}%
                </span>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 16, right: 8, left: -20, bottom: 4 }}
                  >
                    <defs>
                      <linearGradient id="goldBars" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.95} />
                        <stop offset="100%" stopColor="#d97706" stopOpacity={0.75} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      stroke="rgba(255,255,255,0.08)"
                      strokeDasharray="3 6"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 11 }}
                      padding={{ left: 10, right: 10 }}
                    />

                    <YAxis
                      domain={chartRange}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontSize: 11 }}
                      width={88}
                      tickFormatter={(value) =>
                        currencyFormatter.format(Number(value) || 0).replace(".00", "")
                      }
                    />

                    <Tooltip
                      cursor={{
                        stroke: "rgba(255,255,255,0.2)",
                        strokeDasharray: "4 4"
                      }}
                      contentStyle={{
                        background: "rgba(15, 23, 42, 0.95)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "16px",
                        color: "#fff",
                        boxShadow: "0 18px 50px rgba(0,0,0,0.35)"
                      }}
                      labelStyle={{ color: "#cbd5e1", marginBottom: 6 }}
                      formatter={(value) => `${formatCurrency(value)}/unit`}
                    />

                    <Bar
                      dataKey="price"
                      fill="url(#goldBars)"
                      radius={[8, 8, 2, 2]}
                      maxBarSize={28}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Motion.div>
          </div>
        )}
      </div>
    </section>
  );
}

export default GoldPriceWidget;
