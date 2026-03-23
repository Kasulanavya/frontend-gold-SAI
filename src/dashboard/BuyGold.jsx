import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { getUserProfile, setUserProfile } from "../api/authApi";
import {
  confirmSafeGoldBuy,
  fetchSafeGoldBuyStatus,
  fetchSafeGoldBuyPrice,
  registerSafeGoldUser,
  verifySafeGoldBuy
} from "../api/safeGoldApi";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2
});

const formatGrams = (value) => `${Number(value || 0).toFixed(4)} g`;
const BUY_RATE_REFRESH_MS = 60000;

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

export default function BuyGold({ selectedProduct = null }) {
  const [grams, setGrams] = useState("1");
  const [amount, setAmount] = useState("");
  const [goldPrice, setGoldPrice] = useState(0);
  const [goldOwned, setGoldOwned] = useState(() =>
    Number(localStorage.getItem("goldBalance") || 0)
  );
  const [rateId, setRateId] = useState("");
  const [rateValidity, setRateValidity] = useState("");
  const [applicableTax, setApplicableTax] = useState(null);
  const [finalPrice, setFinalPrice] = useState(null);
  const [isRateLoading, setIsRateLoading] = useState(true);
  const [rateError, setRateError] = useState("");
  const [isSubmittingVerify, setIsSubmittingVerify] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [inputMode, setInputMode] = useState("grams");
  const [purchaseSummary, setPurchaseSummary] = useState(null);
  const [hasAppliedSelectedProduct, setHasAppliedSelectedProduct] = useState(false);
  const [txId, setTxId] = useState("");
  const [buyFlowStatus, setBuyFlowStatus] = useState("idle");
  const [buyFlowError, setBuyFlowError] = useState("");
  const [finalStatus, setFinalStatus] = useState(null);
  const [resolvedPartnerUserId, setResolvedPartnerUserId] = useState(() =>
    getUserProfile()?.partnerUserId || localStorage.getItem("partnerUserId") || ""
  );
  const [isRegisteringUser, setIsRegisteringUser] = useState(false);

  const quickAmounts = [500, 1000, 2000, 5000];
  const userProfile = getUserProfile();
  const partnerUserId = resolvedPartnerUserId;

  const total = useMemo(() => Number(amount || 0), [amount]);
  const parsedGrams = useMemo(() => Number.parseFloat(grams || "0"), [grams]);
  const hasLiveRate = goldPrice > 0 && Boolean(rateId);

  const syncCalculatedValues = useCallback(({
    basePrice,
    nextGrams = grams,
    nextAmount = amount,
    mode = inputMode
  }) => {
    if (!basePrice) {
      return;
    }

    if (mode === "grams") {
      const parsedNextGrams = Number.parseFloat(String(nextGrams || "0"));
      if (Number.isFinite(parsedNextGrams) && parsedNextGrams >= 0) {
        setAmount(parsedNextGrams ? (parsedNextGrams * basePrice).toFixed(2) : "");
      }
      return;
    }

    const parsedNextAmount = Number.parseFloat(String(nextAmount || "0"));
    if (Number.isFinite(parsedNextAmount) && parsedNextAmount >= 0) {
      setGrams(parsedNextAmount ? (parsedNextAmount / basePrice).toFixed(4) : "");
    }
  }, [amount, grams, inputMode]);

  const loadBuyPrice = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setIsRateLoading(true);
    }

    const response = await fetchSafeGoldBuyPrice();

    if (!response?.ok) {
      setRateError(response?.message || "Unable to fetch live buy price");
      setRateId("");
      setIsRateLoading(false);
      return false;
    }

    const nextPrice = Number(response?.pricePerGram || response?.price || 0);
    const nextRateId = String(response?.rateId || "");

    setGoldPrice(nextPrice);
    setRateId(nextRateId);
    setRateValidity(response?.rateValidity || "");
    setApplicableTax(
      Number.isFinite(response?.applicableTax) ? response.applicableTax : null
    );
    setFinalPrice(Number(response?.finalPrice || 0) || null);
    setRateError("");
    syncCalculatedValues({
      basePrice: nextPrice
    });

    if (selectedProduct?.price && !hasAppliedSelectedProduct) {
      setInputMode("amount");
      setAmount(Number(selectedProduct.price).toFixed(2));
      setGrams((Number(selectedProduct.price) / nextPrice).toFixed(4));
      setHasAppliedSelectedProduct(true);
    }

    setIsRateLoading(false);

    return true;
  }, [hasAppliedSelectedProduct, selectedProduct, syncCalculatedValues]);

  useEffect(() => {
    const init = async () => {
      await loadBuyPrice();
    };

    init();

    const intervalId = window.setInterval(() => {
      loadBuyPrice({ silent: true });
    }, BUY_RATE_REFRESH_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [loadBuyPrice]);

  const runBuyVerification = useCallback(async ({
    nextAmount,
    nextGrams,
    silent = false
  }) => {
    const parsedAmount = Number(nextAmount);
    const parsedNextGrams = Number(nextGrams);

    if (
      !Number.isFinite(parsedAmount) ||
      !Number.isFinite(parsedNextGrams) ||
      parsedAmount <= 0 ||
      parsedNextGrams <= 0
    ) {
      setAmount("");
      setGrams("");
      return;
    }

    setAmount(parsedAmount.toFixed(2));
    setGrams(parsedNextGrams.toFixed(4));

    if (!silent && !partnerUserId) {
      toast.error("Partner user id is missing.");
    }
  }, [partnerUserId]);

  const handleAmountChange = (value) => {
    setTxId("");
    setBuyFlowStatus("idle");
    setBuyFlowError("");
    setFinalStatus(null);
    setInputMode("amount");
    setAmount(value);

    if (value === "") {
      setGrams("");
      return;
    }

    const nextAmount = Number.parseFloat(value);
    if (!Number.isFinite(nextAmount) || nextAmount < 0 || !goldPrice) {
      return;
    }

    setGrams((nextAmount / goldPrice).toFixed(4));
  };

  const handleGramChange = (value) => {
    setTxId("");
    setBuyFlowStatus("idle");
    setBuyFlowError("");
    setFinalStatus(null);
    setInputMode("grams");
    setGrams(value);

    if (value === "") {
      setAmount("");
      return;
    }

    const nextGrams = Number.parseFloat(value);
    if (!Number.isFinite(nextGrams) || nextGrams < 0 || !goldPrice) {
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
  }, [amount, grams, inputMode, partnerUserId, runBuyVerification]);

  const handleVerifyBuy = async () => {
    if (!hasLiveRate) {
      toast.error("Live gold rate is unavailable. Please retry.");
      return;
    }

    if (parsedGrams <= 0) {
      toast.error("Enter valid grams");
      return;
    }

    const refreshed = await loadBuyPrice({ silent: true });
    if (!refreshed) {
      toast.error("Unable to refresh live buy price. Please retry.");
      return;
    }

    let activePartnerUserId = partnerUserId;

    if (!activePartnerUserId) {
      const name = userProfile?.fullName || selectedProduct?.name || "SafeGold User";
      const mobileNo = userProfile?.mobileNumber || "";
      const email = userProfile?.email || "";
      const pinCode = userProfile?.pinCode || "500001";

      if (!mobileNo || !email) {
        toast.error("App user profile is missing email or mobile number.");
        return;
      }

      setIsRegisteringUser(true);
      const registrationResponse = await registerSafeGoldUser({
        name,
        mobileNo,
        pinCode,
        email
      });
      setIsRegisteringUser(false);

      if (!registrationResponse?.ok || !registrationResponse?.user?.id) {
        const message =
          registrationResponse?.message || "Unable to register SafeGold user";
        setBuyFlowStatus("failed");
        setBuyFlowError(message);
        toast.error(message);
        return;
      }

      activePartnerUserId = String(registrationResponse.user.id);
      setResolvedPartnerUserId(activePartnerUserId);
      localStorage.setItem("partnerUserId", activePartnerUserId);
      setUserProfile({
        fullName: userProfile?.fullName || registrationResponse.user.name,
        email: userProfile?.email || registrationResponse.user.email,
        mobileNumber: userProfile?.mobileNumber || registrationResponse.user.mobileNo,
        pinCode: userProfile?.pinCode || registrationResponse.user.pinCode,
        uniqueId: userProfile?.uniqueId || "",
        partnerUserId: activePartnerUserId
      });
    }

    setIsSubmittingVerify(true);
    setBuyFlowError("");
    setFinalStatus(null);

    const response = await verifySafeGoldBuy({
      partnerUserId: activePartnerUserId,
      goldAmount: parsedGrams,
      buyPrice: total
    });

    setIsSubmittingVerify(false);

    if (!response?.ok || !response?.verified?.txId) {
      const message =
        response?.message || "Unable to verify SafeGold buy transaction";
      setBuyFlowStatus("failed");
      setBuyFlowError(message);
      toast.error(message);
      return;
    }

    setTxId(String(response.verified.txId));
    setAmount(String(Number(response?.verified?.amount || total).toFixed(2)));
    setGrams(String(Number(response?.verified?.grams || parsedGrams).toFixed(4)));
    setBuyFlowStatus("verified");
    toast.success("Buy verified. You can confirm after payment success.");
  };

  const handleConfirmBuy = async () => {
    if (!partnerUserId) {
      toast.error("Partner user id is missing.");
      return;
    }

    if (!txId) {
      toast.error("Verify the buy first to get a valid txId.");
      return;
    }

    setIsConfirming(true);
    setBuyFlowError("");

    const confirmResponse = await confirmSafeGoldBuy({
      partnerUserId,
      txId
    });

    setIsConfirming(false);

    if (!confirmResponse?.ok) {
      const message = confirmResponse?.message || "Buy confirm failed";
      setBuyFlowStatus("failed");
      setBuyFlowError(message);
      toast.error(message);
      return;
    }

    setBuyFlowStatus("confirming");
    setIsCheckingStatus(true);

    const statusResponse = await fetchSafeGoldBuyStatus({ txId });

    setIsCheckingStatus(false);

    if (!statusResponse?.ok) {
      const message = statusResponse?.message || "Unable to fetch final status";
      setBuyFlowStatus("pending");
      setBuyFlowError(message);
      toast.error(message);
      return;
    }

    const resolvedStatus = String(statusResponse?.status?.status || "").toLowerCase();
    const updated = goldOwned + parsedGrams;

    setFinalStatus(statusResponse.status);
    setPurchaseSummary({
      grams: Number(statusResponse?.status?.grams || parsedGrams),
      total: Number(statusResponse?.status?.amount || total),
      rateId,
      txId,
      goldPrice,
      applicableTax,
      finalPrice: displayedFinalPrice,
      rateValidity,
      status: statusResponse?.status?.status || "Pending"
    });

    if (resolvedStatus.includes("success") || resolvedStatus.includes("complete")) {
      localStorage.setItem("goldBalance", updated.toFixed(3));
      setGoldOwned(updated);
      window.dispatchEvent(new Event("goldBalanceUpdated"));
      setBuyFlowStatus("success");
      toast.success("SafeGold buy confirmed successfully.");
      return;
    }

    if (resolvedStatus.includes("fail")) {
      setBuyFlowStatus("failed");
      toast.error("Buy status returned failure.");
      return;
    }

    setBuyFlowStatus("pending");
    toast("Buy confirmation is pending. Please check status again.");
  };

  const handleRefreshStatus = async () => {
    if (!txId) {
      toast.error("No txId found yet.");
      return;
    }

    setIsCheckingStatus(true);
    const statusResponse = await fetchSafeGoldBuyStatus({ txId });
    setIsCheckingStatus(false);

    if (!statusResponse?.ok) {
      toast.error(statusResponse?.message || "Unable to fetch buy status");
      return;
    }

    const resolvedStatus = String(statusResponse?.status?.status || "").toLowerCase();
    setFinalStatus(statusResponse.status);
    setPurchaseSummary((current) => ({
      ...(current || {}),
      grams: Number(statusResponse?.status?.grams || parsedGrams),
      total: Number(statusResponse?.status?.amount || total),
      rateId,
      txId,
      goldPrice,
      applicableTax,
      finalPrice: displayedFinalPrice,
      rateValidity,
      status: statusResponse?.status?.status || "Pending"
    }));

    if (resolvedStatus.includes("success") || resolvedStatus.includes("complete")) {
      const updated = goldOwned + parsedGrams;
      localStorage.setItem("goldBalance", updated.toFixed(3));
      setGoldOwned(updated);
      window.dispatchEvent(new Event("goldBalanceUpdated"));
      setBuyFlowStatus("success");
      toast.success("Buy status is successful.");
      return;
    }

    if (resolvedStatus.includes("fail")) {
      setBuyFlowStatus("failed");
      toast.error("Buy status returned failure.");
      return;
    }

    setBuyFlowStatus("pending");
    toast("Buy status is still pending.");
  };

  const displayedFinalPrice = finalPrice || total || goldPrice;
  const workflowSteps = [
    {
      label: "Live SafeGold buy price fetched",
      done: hasLiveRate && !isRateLoading && !rateError,
      value: hasLiveRate
        ? `${currencyFormatter.format(goldPrice)}/g`
        : "Waiting for live rate"
    },
    {
      label: "SafeGold user registered",
      done: Boolean(partnerUserId),
      value: partnerUserId || "Will be created from /users/register when needed"
    },
    {
      label: "Rate ID stored for downstream flow",
      done: Boolean(rateId),
      value: rateId || "Will be stored once rate loads"
    },
    {
      label: "Buy verify completed",
      done: Boolean(txId),
      value: txId || "Verify buy to create transaction and store txId"
    },
    {
      label: "Purchase details calculated",
      done: total > 0 && parsedGrams > 0,
      value:
        total > 0 && parsedGrams > 0
          ? `${formatGrams(parsedGrams)} for ${currencyFormatter.format(total)}`
          : "Enter amount or grams to preview details"
    }
  ];

  return (
    <div className="bg-[#111] p-6 rounded-2xl space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="text-xl font-semibold">Buy Gold</h3>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-emerald-300">
              Live Rate
            </span>
            {rateValidity ? (
              <span className="text-white/50">
                Price updated till {formatRateValidity(rateValidity)}
              </span>
            ) : null}
            {isSubmittingVerify ? (
              <span className="text-yellow-300">Creating tx...</span>
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
              onClick={() => loadBuyPrice()}
              className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-xs font-medium text-red-100 transition hover:bg-red-500/20"
            >
              Retry live rate
            </button>
          </div>
        ) : (
          <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 text-right">
            <p className="text-xs uppercase tracking-[0.24em] text-white/50">
              Current gold price
            </p>
            <p className="mt-1 text-2xl font-semibold text-yellow-300">
              {currencyFormatter.format(goldPrice)}/g
            </p>
            <p className="mt-2 text-xs text-white/45">Rate ID: {rateId}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {quickAmounts.map((quickAmount) => {
          const quickGrams = goldPrice
            ? Number((quickAmount / goldPrice).toFixed(4))
            : 0;

          return (
            <button
              key={quickAmount}
              onClick={() => handleAmountChange(String(quickAmount))}
              disabled={!goldPrice}
              className="rounded-xl bg-[#222] px-4 py-3 text-left transition hover:bg-yellow-500 hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
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
              disabled={!goldPrice}
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
              disabled={!goldPrice}
            />
            <span className="text-white/50">g</span>
          </div>
        </label>
      </div>

      {selectedProduct ? (
        <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex gap-4">
              {selectedProduct.image ? (
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name || "Selected product"}
                  className="h-20 w-20 rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-black/30 text-xs text-white/45">
                  No image
                </div>
              )}

              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">
                  Selected product
                </p>
                <h4 className="mt-1 text-lg font-semibold text-white">
                  {selectedProduct.name}
                </h4>
                <p className="mt-1 text-sm text-white/60">
                  {selectedProduct.description || "Product details loaded into the buy flow."}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-right">
              <p className="text-xs text-white/45">Product price</p>
              <p className="mt-1 text-xl font-semibold text-cyan-200">
                {currencyFormatter.format(selectedProduct.price || 0)}
              </p>
              {selectedProduct.sku ? (
                <p className="mt-1 text-xs text-white/45">SKU: {selectedProduct.sku}</p>
              ) : null}
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {selectedProduct.metal ? (
              <div className="rounded-lg bg-black/20 p-3">
                <p className="text-xs text-white/45">Metal</p>
                <p className="mt-1 text-sm font-medium text-white">
                  {selectedProduct.metal}
                </p>
              </div>
            ) : null}
            {selectedProduct.purity ? (
              <div className="rounded-lg bg-black/20 p-3">
                <p className="text-xs text-white/45">Purity</p>
                <p className="mt-1 text-sm font-medium text-white">
                  {selectedProduct.purity}
                </p>
              </div>
            ) : null}
            {selectedProduct.weight ? (
              <div className="rounded-lg bg-black/20 p-3">
                <p className="text-xs text-white/45">Weight</p>
                <p className="mt-1 text-sm font-medium text-white">
                  {selectedProduct.weight} g
                </p>
              </div>
            ) : null}
            {selectedProduct.brand ? (
              <div className="rounded-lg bg-black/20 p-3">
                <p className="text-xs text-white/45">Brand</p>
                <p className="mt-1 text-sm font-medium text-white">
                  {selectedProduct.brand}
                </p>
              </div>
            ) : null}
            {selectedProduct.certification ? (
              <div className="rounded-lg bg-black/20 p-3">
                <p className="text-xs text-white/45">Certification</p>
                <p className="mt-1 text-sm font-medium text-white">
                  {selectedProduct.certification}
                </p>
              </div>
            ) : null}
            {selectedProduct.dispatchTime ? (
              <div className="rounded-lg bg-black/20 p-3">
                <p className="text-xs text-white/45">Dispatch</p>
                <p className="mt-1 text-sm font-medium text-white">
                  {selectedProduct.dispatchTime}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="rounded-xl border border-white/10 bg-black/30 p-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold text-white">What is done</p>
            <p className="mt-1 text-xs text-white/50">
              This screen fetches the latest SafeGold buy rate and prepares the values needed for the buy flow.
            </p>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
            Live buy flow
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
          <span>You receive</span>
          <span>{formatGrams(parsedGrams)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm text-white/60">
          <span>Price per gram</span>
          <span>{currencyFormatter.format(goldPrice || 0)}</span>
        </div>
        {applicableTax !== null && applicableTax > 0 ? (
          <div className="mt-2 flex items-center justify-between text-sm text-white/60">
            <span>Applicable tax</span>
            <span>{applicableTax}%</span>
          </div>
        ) : null}
        {finalPrice ? (
          <div className="mt-2 flex items-center justify-between text-sm text-white/60">
            <span>Final effective price</span>
            <span>{currencyFormatter.format(displayedFinalPrice)}</span>
          </div>
        ) : null}
        <div className="mt-2 flex items-center justify-between text-sm text-white/60">
          <span>Total payable</span>
          <span>{currencyFormatter.format(total)}</span>
        </div>
      </div>

      <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold text-cyan-200">SafeGold Buy Journey</p>
            <p className="mt-1 text-xs text-white/60">
              Full wrapper flow: buy-price, buy-verify, buy-confirm, then buy-status.
            </p>
          </div>
          <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-100">
            {buyFlowStatus === "idle" ? "Not started" : buyFlowStatus}
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-black/20 p-3">
            <p className="text-xs text-white/45">Stored partnerUserId</p>
            <p className="mt-1 text-sm font-medium text-white">
              {partnerUserId || "Not created yet"}
            </p>
          </div>
          <div className="rounded-lg bg-black/20 p-3">
            <p className="text-xs text-white/45">Stored rateId</p>
            <p className="mt-1 text-sm font-medium text-white">{rateId || "NA"}</p>
          </div>
          <div className="rounded-lg bg-black/20 p-3">
            <p className="text-xs text-white/45">Stored txId</p>
            <p className="mt-1 text-sm font-medium text-white">{txId || "Not created yet"}</p>
          </div>
          {finalStatus?.status ? (
            <div className="rounded-lg bg-black/20 p-3 sm:col-span-2">
              <p className="text-xs text-white/45">Latest status response</p>
              <p className="mt-1 text-sm font-medium text-white">
                {finalStatus.status}
                {finalStatus.message ? ` - ${finalStatus.message}` : ""}
              </p>
            </div>
          ) : null}
          {buyFlowError ? (
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-200 sm:col-span-2">
              {buyFlowError}
            </div>
          ) : null}
        </div>
      </div>

      {purchaseSummary ? (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-semibold text-emerald-300">
                Purchase prepared successfully
              </p>
              <p className="mt-1 text-xs text-white/60">
                The latest SafeGold rate and transaction details are now visible below for the next verify or confirm step.
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
                {formatGrams(purchaseSummary.grams)}
              </p>
            </div>
            <div className="rounded-lg bg-black/20 p-3">
              <p className="text-xs text-white/45">Total amount</p>
              <p className="mt-1 text-sm font-medium text-white">
                {currencyFormatter.format(purchaseSummary.total)}
              </p>
            </div>
            <div className="rounded-lg bg-black/20 p-3">
              <p className="text-xs text-white/45">Live rate used</p>
              <p className="mt-1 text-sm font-medium text-white">
                {currencyFormatter.format(purchaseSummary.goldPrice)}/g
              </p>
            </div>
            <div className="rounded-lg bg-black/20 p-3">
              <p className="text-xs text-white/45">Rate ID</p>
              <p className="mt-1 text-sm font-medium text-white">
                {purchaseSummary.rateId}
              </p>
            </div>
            <div className="rounded-lg bg-black/20 p-3">
              <p className="text-xs text-white/45">Tx ID</p>
              <p className="mt-1 text-sm font-medium text-white">
                {purchaseSummary.txId || txId || "NA"}
              </p>
            </div>
            {purchaseSummary.applicableTax !== null &&
            purchaseSummary.applicableTax > 0 ? (
              <div className="rounded-lg bg-black/20 p-3">
                <p className="text-xs text-white/45">Applicable tax</p>
                <p className="mt-1 text-sm font-medium text-white">
                  {purchaseSummary.applicableTax}%
                </p>
              </div>
            ) : null}
            <div className="rounded-lg bg-black/20 p-3">
              <p className="text-xs text-white/45">Effective final price</p>
              <p className="mt-1 text-sm font-medium text-white">
                {currencyFormatter.format(purchaseSummary.finalPrice)}
              </p>
            </div>
            {purchaseSummary.status ? (
              <div className="rounded-lg bg-black/20 p-3">
                <p className="text-xs text-white/45">Final status</p>
                <p className="mt-1 text-sm font-medium text-white">
                  {purchaseSummary.status}
                </p>
              </div>
            ) : null}
            {purchaseSummary.rateValidity ? (
              <div className="rounded-lg bg-black/20 p-3 sm:col-span-2">
                <p className="text-xs text-white/45">Rate validity</p>
                <p className="mt-1 text-sm font-medium text-white">
                  {formatRateValidity(purchaseSummary.rateValidity)}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-3">
        <button
          onClick={handleVerifyBuy}
          disabled={
            !hasLiveRate ||
            isRateLoading ||
            isSubmittingVerify ||
            isConfirming ||
            isRegisteringUser
          }
          className="w-full rounded-xl bg-yellow-500 py-3 text-black transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isRegisteringUser
            ? "Registering User..."
            : isSubmittingVerify
              ? "Verifying Buy..."
              : "Verify Buy"}
        </button>

        <button
          onClick={handleConfirmBuy}
          disabled={!txId || isConfirming || isSubmittingVerify}
          className="w-full rounded-xl border border-cyan-500/30 bg-cyan-500/10 py-3 text-cyan-100 transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isConfirming ? "Confirming..." : "Confirm Buy"}
        </button>

        <button
          onClick={handleRefreshStatus}
          disabled={!txId || isCheckingStatus}
          className="w-full rounded-xl border border-white/10 bg-white/5 py-3 text-white transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isCheckingStatus ? "Checking Status..." : "Check Buy Status"}
        </button>
      </div>
    </div>
  );
}
