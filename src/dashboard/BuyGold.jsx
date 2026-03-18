import { useEffect, useMemo, useState } from "react";
import { getGoldRates } from "../api/augmontApi";
import toast from "react-hot-toast";

export default function BuyGold() {
  const [grams, setGrams] = useState(1);
  const [goldPrice, setGoldPrice] = useState(6554);
  const [goldOwned, setGoldOwned] = useState(0);

  const quickAmounts = [500, 1000, 2000, 5000];

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

  const total = useMemo(() => {
    return (grams * goldPrice).toFixed(2);
  }, [grams, goldPrice]);

  const handleBuy = () => {
    if (grams <= 0) {
      toast.error("Enter valid grams");
      return;
    }

    const updated = goldOwned + Number(grams);
    localStorage.setItem("goldBalance", updated.toFixed(3));
    setGoldOwned(updated);

    window.dispatchEvent(new Event("goldBalanceUpdated"));

    toast.success(`Bought ${grams}g gold for ₹${total}`);
  };

  return (
    <div className="bg-[#111] p-6 rounded-2xl space-y-6">
      <h3 className="text-xl font-semibold">Buy Gold</h3>

      {/* 🔥 QUICK AMOUNT BUTTONS */}
      <div className="flex gap-3 flex-wrap">
        {quickAmounts.map((amt) => (
          <button
            key={amt}
            onClick={() => setGrams((amt / goldPrice).toFixed(3))}
            className="px-4 py-2 bg-[#222] hover:bg-yellow-500 hover:text-black rounded-lg text-sm transition"
          >
            ₹{amt}
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

      {/* TOTAL */}
      <div className="text-yellow-400 text-lg font-semibold">
        ₹{total}
      </div>

      {/* BUTTON */}
      <button
        onClick={handleBuy}
        className="w-full bg-yellow-500 text-black py-3 rounded-xl hover:scale-105 transition"
      >
        Buy Gold
      </button>
    </div>
  );
}