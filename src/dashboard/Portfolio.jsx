import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ FIX
import BuyGold from "./BuyGold";
import SellGold from "./SellGold";
import { getGoldRates } from "../api/augmontApi";
import {
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Portfolio() {
  const navigate = useNavigate(); // ✅ FIX

  const [gold, setGold] = useState(0);
  const [value, setValue] = useState(0);
  const [invested, setInvested] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const load = async () => {
      const stored = Number(localStorage.getItem("goldBalance") || 0);
      setGold(stored);

      try {
        const rates = await getGoldRates();
        const price = parseFloat(
          rates?.payload?.result?.data?.rates?.gBuy || 0
        );

        localStorage.setItem("goldPrice", price);

        setValue(stored * price);
        setInvested(stored * price * 0.9);
      } catch (e) {
        console.log(e);
      }
    };

    load();

    // ✅ LIVE UPDATE
    window.addEventListener("goldBalanceUpdated", load);

    return () =>
      window.removeEventListener("goldBalanceUpdated", load);
  }, []);

  const profit = useMemo(() => value - invested, [value, invested]);

  const profitPercent = useMemo(() => {
    if (!invested) return 0;
    return ((profit / invested) * 100).toFixed(2);
  }, [profit, invested]);

  // 🔥 CHART DATA
  const chartData = [
    { day: "Mon", price: 65000 },
    { day: "Tue", price: 67000 },
    { day: "Wed", price: 66000 },
    { day: "Thu", price: 69000 },
    { day: "Fri", price: 71000 },
    { day: "Sat", price: 72000 },
    { day: "Sun", price: 74000 },
  ];

  return (
    <div className="bg-black text-white min-h-screen">

      {/* 🔥 TOP BAR */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">

        <button
          onClick={() => navigate("/dashboard")}
          className="text-yellow-400 hover:text-yellow-300 font-medium"
        >
          ← Back to Dashboard
        </button>

        <h1 className="text-xl font-semibold">Portfolio</h1>

        <div></div>
      </div>

      {/* 🔥 CONTENT */}
      <div className="space-y-6 max-w-5xl mx-auto p-6">

        {/* 🔥 TOP CARD */}
        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-300/5 border border-yellow-400/20 rounded-2xl p-6">
          <p className="text-white/50 text-sm">Portfolio Value</p>

          <h1 className="text-4xl font-bold text-yellow-400 mt-2">
            ₹{value.toLocaleString()}
          </h1>

          <p
            className={`mt-2 text-sm ${
              profit >= 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            {profit >= 0 ? "+" : ""}₹{profit.toLocaleString()} ({profitPercent}%)
          </p>
        </div>

        {/* 🔥 STATS */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#111] p-4 rounded-xl">
            <p className="text-white/50 text-xs">Gold</p>
            <h3 className="font-semibold text-lg">
              {gold.toFixed(3)} g
            </h3>
          </div>

          <div className="bg-[#111] p-4 rounded-xl">
            <p className="text-white/50 text-xs">Invested</p>
            <h3 className="font-semibold text-lg">
              ₹{invested.toFixed(0)}
            </h3>
          </div>

          <div className="bg-[#111] p-4 rounded-xl">
            <p className="text-white/50 text-xs">Profit</p>
            <h3
              className={`text-lg ${
                profit >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              ₹{profit.toFixed(0)}
            </h3>
          </div>
        </div>

        {/* 🔥 TABS */}
        <div className="flex gap-6 border-b border-white/10">
          {["overview", "buy", "sell"].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`pb-2 text-sm font-semibold transition ${
                activeTab === t
                  ? "text-yellow-400 border-b-2 border-yellow-400"
                  : "text-white/50 hover:text-white"
              }`}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        {/* 🔥 CONTENT */}
        {activeTab === "overview" && (
          <div className="bg-[#111] p-5 rounded-2xl">

            <div className="flex justify-between mb-4">
              <h3 className="text-sm text-white/60">
                Portfolio Trend
              </h3>
              <span className="text-xs text-white/40">Last 7 days</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>

                  <XAxis
                    dataKey="day"
                    stroke="#666"
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    tick={{ fontSize: 12 }}
                  />

                  <Tooltip
                    contentStyle={{
                      background: "#111",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "10px",
                    }}
                    labelStyle={{ color: "#fff" }}
                  />

                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#FBBF24"
                    strokeWidth={2}
                    fill="url(#goldGradient)"
                  />

                  <defs>
                    <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FBBF24" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#FBBF24" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === "buy" && <BuyGold />}
        {activeTab === "sell" && <SellGold />}

      </div>
    </div>
  );
}