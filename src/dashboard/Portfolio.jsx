import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";
import BuyGold from "./BuyGold";
import SellGold from "./SellGold";
import { fetchSafeGoldLiveRateSnapshot } from "../api/safeGoldApi";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2
});

export default function Portfolio() {
  const [gold, setGold] = useState(0);
  const [value, setValue] = useState(0);
  const [invested, setInvested] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const load = async () => {
      const stored = Number(localStorage.getItem("goldBalance") || 0);
      setGold(stored);

      try {
        const response = await fetchSafeGoldLiveRateSnapshot();
        const livePrice = response?.snapshot?.currentPrice || 0;

        setChartData(response?.history || []);

        if (livePrice > 0) {
          setValue(stored * livePrice);
          setInvested(stored * livePrice * 0.9);
        }
      } catch (error) {
        console.log(error);
      }
    };

    load();
    window.addEventListener("goldBalanceUpdated", load);

    return () => window.removeEventListener("goldBalanceUpdated", load);
  }, []);

  const profit = useMemo(() => value - invested, [value, invested]);
  const profitPercent = useMemo(() => {
    if (!invested) return 0;
    return ((profit / invested) * 100).toFixed(2);
  }, [profit, invested]);

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
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-300/5 border border-yellow-400/20 rounded-2xl p-6">
        <p className="text-white/50 text-sm">Portfolio Value</p>

        <h1 className="text-4xl font-bold text-yellow-400 mt-2">
          {currencyFormatter.format(value)}
        </h1>

        <p
          className={`mt-2 text-sm ${
            profit >= 0 ? "text-green-400" : "text-red-400"
          }`}
        >
          {profit >= 0 ? "+" : ""}
          {currencyFormatter.format(profit)} ({profitPercent}%)
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#111] p-4 rounded-xl">
          <p className="text-white/50 text-xs">Gold</p>
          <h3 className="font-semibold text-lg">{gold.toFixed(3)} g</h3>
        </div>

        <div className="bg-[#111] p-4 rounded-xl">
          <p className="text-white/50 text-xs">Invested</p>
          <h3 className="font-semibold text-lg">
            {currencyFormatter.format(invested)}
          </h3>
        </div>

        <div className="bg-[#111] p-4 rounded-xl">
          <p className="text-white/50 text-xs">Profit</p>
          <h3
            className={`text-lg ${
              profit >= 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            {currencyFormatter.format(profit)}
          </h3>
        </div>
      </div>

      <div className="flex gap-6 border-b border-white/10">
        {["overview", "buy", "sell"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 text-sm font-semibold transition ${
              activeTab === tab
                ? "text-yellow-400 border-b-2 border-yellow-400"
                : "text-white/50 hover:text-white"
            }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,_rgba(17,17,17,1),_rgba(10,10,10,1))] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
          <div className="flex justify-between mb-4">
            <h3 className="text-sm text-white/60">Portfolio Trend</h3>
            <span className="text-xs text-white/40">Live backend samples</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 14, right: 6, left: -18, bottom: 4 }}>
                <defs>
                  <linearGradient id="portfolioBars" x1="0" y1="0" x2="0" y2="1">
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
                  interval={0}
                  padding={{ left: 20, right: 20 }}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                />

                <YAxis
                  domain={chartRange}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  width={88}
                  tickFormatter={(price) =>
                    currencyFormatter.format(Number(price) || 0).replace(".00", "")
                  }
                />

                <Tooltip
                  cursor={{
                    stroke: "rgba(255,255,255,0.2)",
                    strokeDasharray: "4 4"
                  }}
                  contentStyle={{
                    background: "rgba(15, 23, 42, 0.95)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "16px",
                    boxShadow: "0 18px 50px rgba(0,0,0,0.35)"
                  }}
                  labelStyle={{ color: "#fff" }}
                  formatter={(price) => currencyFormatter.format(Number(price) || 0)}
                />

                <Bar
                  dataKey="price"
                  fill="url(#portfolioBars)"
                  radius={[8, 8, 2, 2]}
                  maxBarSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === "buy" && <BuyGold />}
      {activeTab === "sell" && <SellGold />}
    </div>
  );
}
