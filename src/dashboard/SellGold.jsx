import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { getUserProfile } from "../api/authApi";
import {
  fetchSafeGoldLiveRateSnapshot,
  verifySafeGoldSell
} from "../api/safeGoldApi";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2
});

export default function SellGold() {
  const [goldOwned, setGoldOwned] = useState(0);
  const [grams, setGrams] = useState("1");
  const [amount, setAmount] = useState("0.00");
  const [goldPrice, setGoldPrice] = useState(6554);
  const [rateId, setRateId] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const quickGrams = [0.5, 1, 2, 5];
  const partnerUserId =
    getUserProfile()?.partnerUserId ||
    localStorage.getItem("partnerUserId") ||
    "";

  useEffect(() => {
    const stored = Number(localStorage.getItem("goldBalance") || 0);
    setGoldOwned(stored);

    const loadRates = async () => {
      try {
        const response = await fetchSafeGoldLiveRateSnapshot();
        const price = response?.snapshot?.sellPrice || 0;

        if (price > 0) {
          setGoldPrice(price);
          setRateId(response?.snapshot?.sellRateId || "");
          setAmount((Number(grams || 0) * price).toFixed(2));
        }
      } catch (error) {
        console.error(error);
      }
    };

    loadRates();
  }, [grams]);

  const payout = useMemo(() => Number(amount || 0), [amount]);
  const parsedGrams = useMemo(() => Number.parseFloat(grams || "0"), [grams]);

  const runSellVerification = async (nextGrams, { silent = false } = {}) => {
    const parsedNextGrams = Number(nextGrams);

    if (!Number.isFinite(parsedNextGrams) || parsedNextGrams <= 0) {
      setGrams("0");
      setAmount("0.00");
      return;
    }

    const estimatedAmount = Number((parsedNextGrams * goldPrice).toFixed(2));

    if (!partnerUserId || !rateId) {
      setGrams(String(parsedNextGrams));
      setAmount(estimatedAmount.toFixed(2));
      return;
    }

    setIsVerifying(true);
    const response = await verifySafeGoldSell({
      partnerUserId,
      rateId,
      goldAmount: parsedNextGrams,
      sellPrice: estimatedAmount
    });
    setIsVerifying(false);

    if (!response?.ok) {
      if (!silent) {
        toast.error(response?.message || "Unable to verify sell calculation");
      }
      setGrams(String(parsedNextGrams));
      setAmount(estimatedAmount.toFixed(2));
      return;
    }

    setGrams(String(Number(response?.verified?.grams || parsedNextGrams).toFixed(4)));
    setAmount(String(Number(response?.verified?.amount || estimatedAmount).toFixed(2)));
  };

  const handleGramInputChange = (value) => {
    setGrams(value);

    if (value === "") {
      setAmount("");
      return;
    }

    if (value === "." || value === "0." || value.endsWith(".")) {
      return;
    }

    const nextGrams = Number.parseFloat(value);
    if (!Number.isFinite(nextGrams) || nextGrams < 0) {
      return;
    }

    setAmount((nextGrams * goldPrice).toFixed(2));
  };

  useEffect(() => {
    if (
      grams === "" ||
      grams === "." ||
      grams === "0." ||
      grams.endsWith(".")
    ) {
      return;
    }

    const nextGrams = Number.parseFloat(grams || "0");
    if (!Number.isFinite(nextGrams) || nextGrams <= 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      runSellVerification(nextGrams, { silent: true });
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [grams, rateId, partnerUserId]);

  const handleSell = () => {
    if (parsedGrams <= 0) {
      toast.error("Enter valid grams");
      return;
    }

    if (parsedGrams > goldOwned) {
      toast.error("Not enough gold");
      return;
    }

    const updated = goldOwned - parsedGrams;

    localStorage.setItem("goldBalance", updated.toFixed(3));
    setGoldOwned(updated);

    window.dispatchEvent(new Event("goldBalanceUpdated"));

    toast.success(`Sold ${parsedGrams}g gold for ${currencyFormatter.format(payout)}`);
  };

  return (
    <div className="bg-[#111] p-6 rounded-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Sell Gold</h3>
        <p className="text-xs text-white/50">
          Live Rate: {currencyFormatter.format(goldPrice)}/g
          {isVerifying ? " • Verifying..." : ""}
        </p>
      </div>

      <div className="flex gap-3 flex-wrap">
        {quickGrams.map((g) => (
          <button
            key={g}
            onClick={() => setGrams(String(g))}
            className="px-4 py-2 bg-[#222] hover:bg-yellow-500 hover:text-black rounded-lg text-sm transition"
          >
            {g}g
          </button>
        ))}
      </div>

      <input
        type="number"
        value={grams}
        onChange={(e) => handleGramInputChange(e.target.value)}
        className="w-full p-3 bg-black border border-white/10 rounded-lg"
      />

      <div className="text-yellow-400 text-lg font-semibold">
        {currencyFormatter.format(payout)}
      </div>

      <button
        onClick={handleSell}
        className="w-full bg-yellow-500 text-black py-3 rounded-xl hover:scale-105 transition"
      >
        Sell Gold
      </button>
    </div>
  );
}
