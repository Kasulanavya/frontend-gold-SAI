import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BuyGold from "./BuyGold";
import SellGold from "./SellGold";
import GoldPriceChart from "../components/GoldPriceChart";
import { getGoldRates } from "../api/augmontApi";

const PRODUCT_SELECTION_KEY = "selectedGoldProduct";

const getInitialSelectedProduct = (location) => {
  if (location.state?.selectedProduct) {
    localStorage.setItem(
      PRODUCT_SELECTION_KEY,
      JSON.stringify(location.state.selectedProduct)
    );
    return location.state.selectedProduct;
  }

  try {
    const raw = localStorage.getItem(PRODUCT_SELECTION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const getInitialTab = (location) => {
  const nextTab = new URLSearchParams(location.search).get("tab");
  return ["overview", "buy", "sell"].includes(nextTab) ? nextTab : "overview";
};

export default function Portfolio() {
  const navigate = useNavigate();
  const location = useLocation();

  const [gold, setGold] = useState(0);
  const [value, setValue] = useState(0);
  const [invested, setInvested] = useState(0);
  const [activeTab, setActiveTab] = useState(() => getInitialTab(location));
  const [selectedProduct] = useState(() => getInitialSelectedProduct(location));

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

  const switchTab = (tab) => {
    setActiveTab(tab);
    navigate(`/portfolio?tab=${tab}`, {
      replace: true,
      state: selectedProduct ? { selectedProduct } : null
    });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <button
          onClick={() => navigate("/dashboard")}
          className="font-medium text-yellow-400 transition hover:text-yellow-300"
        >
          Back to Dashboard
        </button>

        <h1 className="text-xl font-semibold">Portfolio</h1>

        <div />
      </div>

      <div className="mx-auto max-w-5xl space-y-6 p-6">
        <div className="rounded-2xl border border-yellow-400/20 bg-gradient-to-br from-yellow-500/20 to-yellow-300/5 p-6">
          <p className="text-sm text-white/50">Portfolio Value</p>

          <h1 className="mt-2 text-4xl font-bold text-yellow-400">
            Rs {value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
          </h1>

          <p
            className={`mt-2 text-sm ${
              profit >= 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            {profit >= 0 ? "+" : ""}
            Rs {profit.toLocaleString("en-IN", { maximumFractionDigits: 2 })} (
            {profitPercent}%)
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-[#111] p-4">
            <p className="text-xs text-white/50">Gold</p>
            <h3 className="text-lg font-semibold">{gold.toFixed(3)} g</h3>
          </div>

          <div className="rounded-xl bg-[#111] p-4">
            <p className="text-xs text-white/50">Invested</p>
            <h3 className="text-lg font-semibold">
              Rs {invested.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </h3>
          </div>

          <div className="rounded-xl bg-[#111] p-4">
            <p className="text-xs text-white/50">Profit</p>
            <h3
              className={`text-lg ${
                profit >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              Rs {profit.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </h3>
          </div>
        </div>

        <div className="flex gap-6 border-b border-white/10">
          {["overview", "buy", "sell"].map((tab) => (
            <button
              key={tab}
              onClick={() => switchTab(tab)}
              className={`pb-2 text-sm font-semibold transition ${
                activeTab === tab
                  ? "border-b-2 border-yellow-400 text-yellow-400"
                  : "text-white/50 hover:text-white"
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {activeTab === "overview" && <GoldPriceChart />}
        {activeTab === "buy" && (
          <BuyGold
            key={selectedProduct?.id || "default-buy"}
            selectedProduct={selectedProduct}
          />
        )}
        {activeTab === "sell" && <SellGold />}
      </div>
    </div>
  );
}
