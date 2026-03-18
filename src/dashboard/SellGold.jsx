import { useEffect, useMemo, useState } from "react";
import { getGoldRates } from "../api/augmontApi";
import toast from "react-hot-toast";

export default function SellGold() {
  const [goldOwned, setGoldOwned] = useState(0);
  const [grams, setGrams] = useState(1);
  const [goldPrice, setGoldPrice] = useState(6554);

  const quickGrams = [0.5, 1, 2, 5];

  useEffect(() => {
    const stored = Number(localStorage.getItem("goldBalance") || 0);
    setGoldOwned(stored);

    const loadRates = async () => {
      try {
        const data = await getGoldRates();
        const price = parseFloat(data?.payload?.result?.data?.rates?.gBuy || 0);

        if (price > 0) {
          setGoldPrice(price);
          localStorage.setItem("goldPrice", price);
        }
      } catch (error) {
        console.error(error);
      }
    };

    loadRates();
  }, []);

  const payout = useMemo(() => {
    return (grams * goldPrice).toFixed(2);
  }, [grams, goldPrice]);

  const handleSell = () => {
    if (grams <= 0) {
      toast.error("Enter valid grams");
      return;
    }

    if (grams > goldOwned) {
      toast.error("Not enough gold");
      return;
    }

    const updated = goldOwned - grams;

    localStorage.setItem("goldBalance", updated.toFixed(3));
    setGoldOwned(updated);

    window.dispatchEvent(new Event("goldBalanceUpdated"));

    toast.success(`Sold ${grams}g gold for ₹${payout}`);
  };

  return (
    <div className="bg-[#111] p-6 rounded-2xl space-y-6">
      <h3 className="text-xl font-semibold">Sell Gold</h3>

      {/* 🔥 QUICK GRAMS */}
      <div className="flex gap-3 flex-wrap">
        {quickGrams.map((g) => (
          <button
            key={g}
            onClick={() => setGrams(g)}
            className="px-4 py-2 bg-[#222] hover:bg-yellow-500 hover:text-black rounded-lg text-sm transition"
          >
            {g}g
          </button>
        ))}
      </div>

      {/* INPUT */}
      <input
        type="number"
        value={grams}
        onChange={(e) => setGrams(Number(e.target.value))}
        className="w-full p-3 bg-black border border-white/10 rounded-lg"
      />

      {/* PAYOUT */}
      <div className="text-yellow-400 text-lg font-semibold">
        ₹{payout}
      </div>

      {/* BUTTON */}
      <button
        onClick={handleSell}
        className="w-full bg-yellow-500 text-black py-3 rounded-xl hover:scale-105 transition"
      >
        Sell Gold
      </button>
    </div>
  );
}