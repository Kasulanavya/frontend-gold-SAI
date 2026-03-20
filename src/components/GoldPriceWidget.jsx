"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import { fetchSafeGoldLiveRateSnapshot } from "../api/safeGoldApi";

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

function GoldPriceWidget() {
  const [chartData, setChartData] = useState([]);
  const [liveRates, setLiveRates] = useState({
    currentPrice: 0,
    buyPrice: 0,
    sellPrice: 0
  });

  useEffect(() => {
    let isMounted = true;

    const loadRates = async () => {
      const response = await fetchSafeGoldLiveRateSnapshot();

      if (!isMounted || !response?.snapshot?.currentPrice) {
        return;
      }

      setLiveRates(response.snapshot);
      setChartData(response.history || []);
    };

    loadRates();

    const intervalId = window.setInterval(loadRates, 60000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const currentPrice = liveRates.currentPrice || 0;
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

  const cards = [
    {
      title: "Current Price",
      price: formatCurrency(currentPrice),
      sub: "/gram",
      extra: `${priceChange >= 0 ? "+" : ""}${priceChange.toFixed(2)}%`,
      color: priceChange >= 0 ? "text-green-400" : "text-red-400"
    },
    {
      title: "Buy Price",
      price: formatCurrency(liveRates.buyPrice || currentPrice),
      sub: "/gram",
      extra: "Live from backend"
    },
    {
      title: "Sell Price",
      price: formatCurrency(liveRates.sellPrice || currentPrice),
      sub: "/gram",
      extra: "Live from backend"
    }
  ];
  return (
    <section className="py-10 bg-black text-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-yellow-500 font-semibold tracking-wider">
            MARKET DATA
          </p>

          <h2 className="text-4xl lg:text-5xl font-bold mt-2">
            Live Gold <span className="text-yellow-400">Prices</span>
          </h2>

          <p className="text-gray-400 mt-3">
            Track real-time gold prices and make informed investment decisions
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            {cards.map((card, i) => (
              <motion.div
                key={card.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                variants={cardAnimation}
                className="bg-[#0f0f0f] border border-white/10 rounded-3xl p-7 hover:border-yellow-500/30 transition-all"
              >
                <p className="text-gray-400 text-sm mb-2">{card.title}</p>

                <div className="flex justify-between items-center gap-4">
                  <h3 className="text-3xl lg:text-4xl font-bold">
                    {card.price}
                    <span className="text-gray-400 text-lg ml-1">
                      {card.sub}
                    </span>
                  </h3>

                  <span className={`text-sm ${card.color || "text-gray-400"}`}>
                    {card.extra}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.16),_transparent_38%),linear-gradient(180deg,_rgba(17,24,39,0.92),_rgba(8,8,8,0.98))] p-8"
          >
            <div className="pointer-events-none absolute inset-x-6 top-6 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <div className="flex justify-between items-center mb-6 gap-4">
              <div>
                <h3 className="text-xl font-semibold">Price Trend</h3>
                <p className="text-gray-400 text-sm">
                  Live backend rate samples
                </p>
              </div>

              <span
                className={`px-4 py-1 rounded-full text-sm flex items-center gap-1 ${
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
                    formatter={(value) => `${formatCurrency(value)}/g`}
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
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-6 mt-14 flex-col sm:flex-row"
        >
          <button
            className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-semibold px-8 py-4 rounded-full hover:scale-105 transition"
            onClick={() => {
              const isLoggedIn = localStorage.getItem("isLoggedIn");
              if (isLoggedIn === "true") {
                window.location.href = "/dashboard?tab=buy";
              } else {
                window.location.href = "/login";
              }
            }}
          >
            Buy Gold Now
          </button>

          <button
            className="flex-1 border border-yellow-500 text-yellow-400 px-8 py-4 rounded-full hover:bg-yellow-500 hover:text-black transition"
            onClick={() => {
              const isLoggedIn = localStorage.getItem("isLoggedIn");
              if (isLoggedIn === "true") {
                window.location.href = "/dashboard?tab=sell";
              } else {
                window.location.href = "/login";
              }
            }}
          >
            Sell Gold
          </button>
        </motion.div>
      </div>
    </section>
  );
}

export default GoldPriceWidget;
