import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { getUserProfile } from "../api/authApi";
import {
  fetchSafeGoldLiveRateSnapshot,
  verifySafeGoldBuy
} from "../api/safeGoldApi";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2
});

const formatGrams = (value) => `${Number(value || 0).toFixed(4)} g`;

export default function BuyGold() {
  const [grams, setGrams] = useState("1");
  const [amount, setAmount] = useState("");
  const [goldPrice, setGoldPrice] = useState(6554);
  const [goldOwned, setGoldOwned] = useState(0);
  const [rateId, setRateId] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [inputMode, setInputMode] = useState("grams");

  const quickAmounts = [500, 1000, 2000, 5000];
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
        const price = response?.snapshot?.buyPrice || 0;

        if (price > 0) {
          setGoldPrice(price);
          setRateId(response?.snapshot?.buyRateId || "");
          setAmount((Number(grams || 0) * price).toFixed(2));
        }
      } catch (error) {
        console.error(error);
      }
    };

    loadRates();
  }, [grams]);

  const total = useMemo(() => Number(amount || 0), [amount]);
  const parsedGrams = useMemo(() => Number.parseFloat(grams || "0"), [grams]);

  const runBuyVerification = async ({ nextAmount, nextGrams, silent = false }) => {
    const parsedAmount = Number(nextAmount);
    const parsedGrams = Number(nextGrams);

    if (
      !Number.isFinite(parsedAmount) ||
      !Number.isFinite(parsedGrams) ||
      parsedAmount <= 0 ||
      parsedGrams <= 0
    ) {
      setAmount(0);
      setGrams(0);
      return;
    }

    if (!partnerUserId || !rateId) {
      setAmount(parsedAmount.toFixed(2));
      setGrams(parsedGrams.toFixed(4));
      return;
    }

    setIsVerifying(true);
    const response = await verifySafeGoldBuy({
      partnerUserId,
      rateId,
      goldAmount: parsedGrams,
      buyPrice: parsedAmount
    });
    setIsVerifying(false);

    if (!response?.ok) {
      if (!silent) {
        toast.error(response?.message || "Unable to verify buy calculation");
      }
      setAmount(parsedAmount.toFixed(2));
      setGrams(parsedGrams.toFixed(4));
      return;
    }

    setAmount(String(Number(response?.verified?.amount || parsedAmount).toFixed(2)));
    setGrams(String(Number(response?.verified?.grams || parsedGrams).toFixed(4)));
  };

  const handleAmountChange = (value) => {
    setInputMode("amount");
    setAmount(value);

    if (value === "") {
      setGrams("");
      return;
    }

    const nextAmount = Number.parseFloat(value);
    if (!Number.isFinite(nextAmount) || nextAmount < 0) {
      return;
    }

    setGrams((nextAmount / goldPrice).toFixed(4));
  };

  const handleGramChange = (value) => {
    setInputMode("grams");
    setGrams(value);

    if (value === "") {
      setAmount("");
      return;
    }

    const nextGrams = Number.parseFloat(value);
    if (!Number.isFinite(nextGrams) || nextGrams < 0) {
      return;
    }

    setAmount((nextGrams * goldPrice).toFixed(2));
  };

  useEffect(() => {
    const sourceValue = String(inputMode === "grams" ? grams : amount);

    if (
      sourceValue === "" ||
      sourceValue === "." ||
      sourceValue === "0." ||
      sourceValue.endsWith(".")
    ) {
      return;
    }

    const nextAmount = Number.parseFloat(amount || "0");
    const nextGrams = Number.parseFloat(grams || "0");

    if (
      !Number.isFinite(nextAmount) ||
      !Number.isFinite(nextGrams) ||
      nextAmount <= 0 ||
      nextGrams <= 0
    ) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      runBuyVerification({
        nextAmount,
        nextGrams,
        silent: true
      });
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [amount, grams, inputMode, rateId, partnerUserId]);

  const handleBuy = () => {
    if (parsedGrams <= 0) {
      toast.error("Enter valid grams");
      return;
    }

    const updated = goldOwned + parsedGrams;
    localStorage.setItem("goldBalance", updated.toFixed(3));
    setGoldOwned(updated);

    window.dispatchEvent(new Event("goldBalanceUpdated"));

    toast.success(`Bought ${parsedGrams}g gold for ${currencyFormatter.format(total)}`);
  };

  return (
    <div className="bg-[#111] p-6 rounded-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Buy Gold</h3>
        <p className="text-xs text-white/50">
          Live Rate: {currencyFormatter.format(goldPrice)}/g
          {isVerifying ? " • Verifying..." : ""}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {quickAmounts.map((quickAmount) => {
          const quickGrams = Number((quickAmount / goldPrice).toFixed(4));

          return (
            <button
              key={quickAmount}
              onClick={() => handleAmountChange(String(quickAmount))}
              className="rounded-xl bg-[#222] px-4 py-3 text-left transition hover:bg-yellow-500 hover:text-black"
            >
              <p className="text-sm font-semibold">
                {currencyFormatter.format(quickAmount)}
              </p>
              <p className="text-xs opacity-75">{formatGrams(quickGrams)}</p>
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm text-white/60">Amount</span>
          <div className="flex items-center rounded-lg border border-white/10 bg-black px-3">
            <span className="text-white/50">Rs</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              className="w-full bg-transparent p-3 outline-none"
            />
          </div>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-white/60">Grams</span>
          <div className="flex items-center rounded-lg border border-white/10 bg-black px-3">
            <input
              type="number"
              value={grams}
              onChange={(e) => handleGramChange(e.target.value)}
              className="w-full bg-transparent p-3 outline-none"
            />
            <span className="text-white/50">g</span>
          </div>
        </label>
      </div>

      <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
        <div className="flex items-center justify-between text-sm text-white/60">
          <span>You receive</span>
          <span>{formatGrams(parsedGrams)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm text-white/60">
          <span>Total payable</span>
          <span>{currencyFormatter.format(total)}</span>
        </div>
      </div>

      <button
        onClick={handleBuy}
        className="w-full bg-yellow-500 text-black py-3 rounded-xl hover:scale-105 transition"
      >
        Buy Gold
      </button>
    </div>
  );
}
