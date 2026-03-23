import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { getUserProfile } from "../api/authApi";
import {
  fetchSafeGoldSellPrice,
  verifySafeGoldSell
} from "../api/safeGoldApi";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2
});

const formatGrams = (value) => `${Number(value || 0).toFixed(4)} g`;
const SELL_RATE_REFRESH_MS = 60000;

const formatRateValidity = (value) => {
  if (!value) return "";

  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const parsed = new Date(normalized);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });
};

export default function SellGold() {
  const [goldOwned, setGoldOwned] = useState(() =>
    Number(localStorage.getItem("goldBalance") || 0)
  );
  const [grams, setGrams] = useState("1");
  const [amount, setAmount] = useState("");
  const [goldPrice, setGoldPrice] = useState(0);
  const [rateId, setRateId] = useState("");
  const [rateValidity, setRateValidity] = useState("");
  const [isRateLoading, setIsRateLoading] = useState(true);
  const [rateError, setRateError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [sellSummary, setSellSummary] = useState(null);

  const quickGrams = [0.5, 1, 2, 5];
  const partnerUserId =
    getUserProfile()?.partnerUserId ||
    localStorage.getItem("partnerUserId") ||
    "";

  const payout = useMemo(() => Number(amount || 0), [amount]);
  const parsedGrams = useMemo(() => Number.parseFloat(grams || "0"), [grams]);
  const hasLiveRate = goldPrice > 0 && Boolean(rateId);

  const loadSellPrice = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setIsRateLoading(true);
    }

    const response = await fetchSafeGoldSellPrice();

    if (!response?.ok) {
      setRateError(response?.message || "Unable to fetch live sell price");
      setRateId("");
      setIsRateLoading(false);
      return false;
    }

    const nextPrice = Number(response?.pricePerGram || response?.price || 0);

    setGoldPrice(nextPrice);
    setRateId(String(response?.rateId || ""));
    setRateValidity(response?.rateValidity || "");
    setRateError("");

    setAmount((currentAmount) => {
      const nextGrams = Number.parseFloat(grams || "0");
      if (!Number.isFinite(nextGrams) || nextGrams <= 0) {
        return currentAmount;
      }
      return (nextGrams * nextPrice).toFixed(2);
    });

    setIsRateLoading(false);
    return true;
  }, [grams]);

  useEffect(() => {
    const init = async () => {
      await loadSellPrice();
    };

    init();

    const intervalId = window.setInterval(() => {
      loadSellPrice({ silent: true });
    }, SELL_RATE_REFRESH_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [loadSellPrice]);

  const runSellVerification = useCallback(async (nextGrams, { silent = false } = {}) => {
    const parsedNextGrams = Number(nextGrams);

    if (!Number.isFinite(parsedNextGrams) || parsedNextGrams <= 0) {
      setGrams("");
      setAmount("");
      return;
    }

    const estimatedAmount = Number((parsedNextGrams * goldPrice).toFixed(2));

    if (!partnerUserId) {
      setGrams(String(parsedNextGrams));
      setAmount(estimatedAmount.toFixed(2));
      return;
    }

    setIsVerifying(true);
    const response = await verifySafeGoldSell({
      partnerUserId,
      goldAmount: parsedNextGrams,
      sellPrice: estimatedAmount
    });
    setIsVerifying(false);

    if (!response?.ok) {
      if (!silent) {
        toast.error(response?.message || "Unable to verify sell calculation");
      }
      setGrams(String(parsedNextGrams.toFixed(4)));
      setAmount(estimatedAmount.toFixed(2));
      return;
    }

    setGrams(String(Number(response?.verified?.grams || parsedNextGrams).toFixed(4)));
    setAmount(String(Number(response?.verified?.amount || estimatedAmount).toFixed(2)));
  }, [goldPrice, partnerUserId]);

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
    if (!Number.isFinite(nextGrams) || nextGrams < 0 || !goldPrice) {
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
  }, [grams, runSellVerification]);

  const workflowSteps = [
    {
      label: "Live SafeGold sell price fetched",
      done: hasLiveRate && !isRateLoading && !rateError,
      value: hasLiveRate
        ? `${currencyFormatter.format(goldPrice)}/g`
        : "Waiting for live sell rate"
    },
    {
      label: "Rate ID stored for verify flow",
      done: Boolean(rateId),
      value: rateId || "Will be stored once rate loads"
    },
    {
      label: "Sell payout calculated",
      done: payout > 0 && parsedGrams > 0,
      value:
        payout > 0 && parsedGrams > 0
          ? `${formatGrams(parsedGrams)} for ${currencyFormatter.format(payout)}`
          : "Enter grams to preview payout"
    }
  ];

  const handleSell = async () => {
    if (!hasLiveRate) {
      toast.error("Live gold sell rate is unavailable. Please retry.");
      return;
    }

    if (parsedGrams <= 0) {
      toast.error("Enter valid grams");
      return;
    }

    if (parsedGrams > goldOwned) {
      toast.error("Not enough gold");
      return;
    }

    const refreshed = await loadSellPrice({ silent: true });
    if (!refreshed) {
      toast.error("Unable to refresh live sell price. Please retry.");
      return;
    }

    const updated = goldOwned - parsedGrams;

    localStorage.setItem("goldBalance", updated.toFixed(3));
    setGoldOwned(updated);
    setSellSummary({
      grams: parsedGrams,
      payout,
      rateId,
      goldPrice,
      rateValidity
    });

    window.dispatchEvent(new Event("goldBalanceUpdated"));

    toast.success(`Sold ${parsedGrams}g gold for ${currencyFormatter.format(payout)}`);
  };

  return (
    <div className="space-y-6 rounded-2xl bg-[#111] p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="text-xl font-semibold">Sell Gold</h3>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-emerald-300">
              Live Sell Rate
            </span>
            {rateValidity ? (
              <span className="text-white/50">
                Valid till {formatRateValidity(rateValidity)}
              </span>
            ) : null}
            {isVerifying ? (
              <span className="text-yellow-300">Verifying...</span>
            ) : null}
          </div>
        </div>

        {isRateLoading ? (
          <div className="w-full max-w-xs animate-pulse rounded-xl border border-white/10 bg-black/40 p-4 md:w-64">
            <div className="h-3 w-24 rounded bg-white/10" />
            <div className="mt-3 h-7 w-36 rounded bg-white/10" />
            <div className="mt-2 h-3 w-20 rounded bg-white/10" />
          </div>
        ) : rateError ? (
          <div className="w-full max-w-sm rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-200">
            <p>{rateError}</p>
            <button
              onClick={() => loadSellPrice()}
              className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-xs font-medium text-red-100 transition hover:bg-red-500/20"
            >
              Retry sell rate
            </button>
          </div>
        ) : (
          <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 text-right">
            <p className="text-xs uppercase tracking-[0.24em] text-white/50">
              Current sell price
            </p>
            <p className="mt-1 text-2xl font-semibold text-yellow-300">
              {currencyFormatter.format(goldPrice)}/g
            </p>
            <div className="mt-3 flex justify-end gap-2">
              <button
                onClick={() => loadSellPrice()}
                className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/70 transition hover:border-yellow-500/30 hover:text-white"
              >
                Refresh price
              </button>
            </div>
            <p className="mt-2 text-xs text-white/45">Rate ID: {rateId}</p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        {quickGrams.map((g) => (
          <button
            key={g}
            onClick={() => handleGramInputChange(String(g))}
            disabled={!goldPrice}
            className="rounded-lg bg-[#222] px-4 py-2 text-sm transition hover:bg-yellow-500 hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            {g}g
          </button>
        ))}
      </div>

      <label className="block">
        <span className="mb-2 block text-sm text-white/60">Gold quantity</span>
        <div className="flex items-center rounded-lg border border-white/10 bg-black px-3">
          <input
            type="number"
            value={grams}
            onChange={(e) => handleGramInputChange(e.target.value)}
            className="w-full bg-transparent p-3 outline-none"
            disabled={!goldPrice}
          />
          <span className="text-white/50">g</span>
        </div>
      </label>

      <div className="rounded-xl border border-white/10 bg-black/30 p-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold text-white">What is done</p>
            <p className="mt-1 text-xs text-white/50">
              This screen fetches the latest SafeGold sell rate and stores the values needed for the sell verify flow.
            </p>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
            Live sell flow
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {workflowSteps.map((step) => (
            <div
              key={step.label}
              className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-3"
            >
              <span
                className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold ${
                  step.done
                    ? "bg-emerald-500/15 text-emerald-300"
                    : "bg-white/10 text-white/55"
                }`}
              >
                {step.done ? "OK" : "..."}
              </span>
              <div>
                <p className="text-sm text-white">{step.label}</p>
                <p className="mt-1 text-xs text-white/50">{step.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
        <div className="flex items-center justify-between text-sm text-white/60">
          <span>Gold available</span>
          <span>{formatGrams(goldOwned)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm text-white/60">
          <span>You sell</span>
          <span>{formatGrams(parsedGrams)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm text-white/60">
          <span>Sell price per gram</span>
          <span>{currencyFormatter.format(goldPrice || 0)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm text-white/60">
          <span>Estimated payout</span>
          <span>{currencyFormatter.format(payout)}</span>
        </div>
      </div>

      {sellSummary ? (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-semibold text-emerald-300">
                Sell flow prepared successfully
              </p>
              <p className="mt-1 text-xs text-white/60">
                The latest SafeGold sell price and rate details are ready for the next verify step.
              </p>
            </div>
            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">
              Completed
            </span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-black/20 p-3">
              <p className="text-xs text-white/45">Gold quantity</p>
              <p className="mt-1 text-sm font-medium text-white">
                {formatGrams(sellSummary.grams)}
              </p>
            </div>
            <div className="rounded-lg bg-black/20 p-3">
              <p className="text-xs text-white/45">Estimated payout</p>
              <p className="mt-1 text-sm font-medium text-white">
                {currencyFormatter.format(sellSummary.payout)}
              </p>
            </div>
            <div className="rounded-lg bg-black/20 p-3">
              <p className="text-xs text-white/45">Live sell rate used</p>
              <p className="mt-1 text-sm font-medium text-white">
                {currencyFormatter.format(sellSummary.goldPrice)}/g
              </p>
            </div>
            <div className="rounded-lg bg-black/20 p-3">
              <p className="text-xs text-white/45">Rate ID</p>
              <p className="mt-1 text-sm font-medium text-white">
                {sellSummary.rateId}
              </p>
            </div>
            {sellSummary.rateValidity ? (
              <div className="rounded-lg bg-black/20 p-3 sm:col-span-2">
                <p className="text-xs text-white/45">Rate validity</p>
                <p className="mt-1 text-sm font-medium text-white">
                  {formatRateValidity(sellSummary.rateValidity)}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <button
        onClick={handleSell}
        disabled={!hasLiveRate || isRateLoading}
        className="w-full rounded-xl bg-yellow-500 py-3 text-black transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Sell Gold
      </button>
    </div>
  );
}
