import { useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import { getUserProfile } from "../api/authApi";
import {
  createAugmontRedeemOrder,
  createAugmontTransferOrder,
  fetchAugmontFdSchemes,
  fetchAugmontPassbook,
  fetchAugmontProductDetail,
  fetchAugmontRedeemOrders,
  fetchAugmontTransferOrders,
  fetchAugmontUserProfile,
  getAugmontSession,
  getAugmontUser
} from "../api/augmontApi";
import {
  confirmSafeGoldRedeem,
  createSafeGoldTransfer,
  fetchSafeGoldHistorical,
  fetchSafeGoldInvoice,
  fetchSafeGoldRedeemDispatchStatus,
  fetchSafeGoldRedeemStatus,
  fetchSafeGoldTransferStatus,
  fetchSafeGoldUserBalance,
  fetchSafeGoldUserTransactions,
  updateSafeGoldKyc,
  validateSafeGoldPincode,
  verifySafeGoldRedeem
} from "../api/safeGoldApi";

const prettyJson = (value) => JSON.stringify(value || {}, null, 2);

const formatDateInputValue = (date) => {
  const normalized = new Date(date);

  if (Number.isNaN(normalized.getTime())) {
    return "";
  }

  const year = normalized.getFullYear();
  const month = `${normalized.getMonth() + 1}`.padStart(2, "0");
  const day = `${normalized.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function Card({ title, subtitle, children }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#111] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      {subtitle ? <p className="mt-2 text-sm text-white/55">{subtitle}</p> : null}
      <div className="mt-5 space-y-4">{children}</div>
    </div>
  );
}

function JsonPanel({ title, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-sm font-semibold text-white">{title}</p>
      <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-[#0b0b0b] p-4 text-xs text-white/70">
        {prettyJson(value)}
      </pre>
    </div>
  );
}

function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-white/60">{label}</span>
      {children}
      {hint ? <span className="mt-2 block text-xs text-white/40">{hint}</span> : null}
    </label>
  );
}

const inputClassName =
  "w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-400/50";

const actionButtonClassName =
  "rounded-xl border border-white/10 px-4 py-3 text-sm text-white transition hover:border-yellow-400/30 hover:bg-yellow-500/5 disabled:cursor-not-allowed disabled:opacity-50";

export default function GoldPlatformPage() {
  const profile = getUserProfile() || {};
  const augmontUser = getAugmontUser() || {};
  const session = getAugmontSession() || {};

  const merchantId = session?.merchantId || import.meta.env.VITE_AUGMONT_MERCHANT_ID?.trim() || "";
  const uniqueId = profile?.uniqueId || augmontUser?.uniqueId || "";
  const partnerUserId = profile?.partnerUserId || "";

  const [workspaceResult, setWorkspaceResult] = useState({});
  const [workspaceError, setWorkspaceError] = useState("");
  const [workspaceLoading, setWorkspaceLoading] = useState(false);

  const [sku, setSku] = useState("");
  const [skuResult, setSkuResult] = useState({});
  const [skuLoading, setSkuLoading] = useState(false);

  const [redeemSku, setRedeemSku] = useState("");
  const [redeemQuantity, setRedeemQuantity] = useState("1");
  const [augmontRedeemMode, setAugmontRedeemMode] = useState("wallet");
  const [receiverUniqueId, setReceiverUniqueId] = useState("");
  const [transferQuantity, setTransferQuantity] = useState("0.0100");
  const [augmontTransferMetalType, setAugmontTransferMetalType] = useState("gold");
  const [augmontActionResult, setAugmontActionResult] = useState({});
  const [augmontActionError, setAugmontActionError] = useState("");
  const [augmontActionLoading, setAugmontActionLoading] = useState(false);

  const today = useMemo(() => new Date(), []);
  const defaultFromDate = useMemo(() => {
    const from = new Date(today);
    from.setDate(from.getDate() - 21);
    return formatDateInputValue(from);
  }, [today]);
  const defaultToDate = useMemo(() => formatDateInputValue(today), [today]);

  const [pinCode, setPinCode] = useState(profile?.pinCode || "");
  const [productWeight, setProductWeight] = useState("");
  const [historicalFrom, setHistoricalFrom] = useState(defaultFromDate);
  const [historicalTo, setHistoricalTo] = useState(defaultToDate);
  const [historicalType, setHistoricalType] = useState("d");
  const [safeGoldProductCode, setSafeGoldProductCode] = useState("");
  const [safeGoldRecipientName, setSafeGoldRecipientName] = useState(profile?.fullName || "");
  const [safeGoldPhoneNo, setSafeGoldPhoneNo] = useState(profile?.mobileNumber || "");
  const [safeGoldState, setSafeGoldState] = useState(profile?.augmontState || "");
  const [safeGoldCity, setSafeGoldCity] = useState(profile?.augmontCity || "");
  const [safeGoldAddress, setSafeGoldAddress] = useState("");
  const [safeGoldLandmark, setSafeGoldLandmark] = useState("");
  const [safeGoldRedeemPartnerTxId, setSafeGoldRedeemPartnerTxId] = useState("");
  const [redeemTxId, setRedeemTxId] = useState("");
  const [safeGoldTransferName, setSafeGoldTransferName] = useState(profile?.fullName || "");
  const [safeGoldTransferEmail, setSafeGoldTransferEmail] = useState(profile?.email || "");
  const [safeGoldTransferPhoneNo, setSafeGoldTransferPhoneNo] = useState(profile?.mobileNumber || "");
  const [safeGoldTransferPinCode, setSafeGoldTransferPinCode] = useState(profile?.pinCode || "");
  const [safeGoldTransferAmount, setSafeGoldTransferAmount] = useState("");
  const [clientReferenceId, setClientReferenceId] = useState("");
  const [invoiceTxId, setInvoiceTxId] = useState("");
  const [kycPanNo, setKycPanNo] = useState("");
  const [kycIdentityType, setKycIdentityType] = useState("aadhaar");
  const [kycIdentityValue, setKycIdentityValue] = useState("");
  const [safeGoldResult, setSafeGoldResult] = useState({});
  const [safeGoldError, setSafeGoldError] = useState("");
  const [safeGoldLoading, setSafeGoldLoading] = useState(false);

  const summary = useMemo(
    () => [
      { label: "Merchant ID", value: merchantId || "Missing" },
      { label: "Augmont uniqueId", value: uniqueId || "Missing" },
      { label: "SafeGold partnerUserId", value: partnerUserId || "Missing" },
      { label: "Phone", value: profile?.mobileNumber || "Missing" }
    ],
    [merchantId, partnerUserId, profile?.mobileNumber, uniqueId]
  );

  const setActionState = (setter, errorSetter) => {
    errorSetter("");
    setter({});
  };

  const loadWorkspace = async () => {
    setWorkspaceLoading(true);
    setWorkspaceError("");
    setWorkspaceResult({});

    if (!merchantId) {
      setWorkspaceLoading(false);
      setWorkspaceError("Merchant ID is missing. Set it through the logged-in session or environment.");
      return;
    }

    try {
      const augmontTasks = uniqueId
        ? Promise.all([
            fetchAugmontUserProfile(uniqueId),
            fetchAugmontPassbook(uniqueId),
            fetchAugmontFdSchemes({ merchantId }),
            fetchAugmontRedeemOrders({ merchantId, uniqueId }),
            fetchAugmontTransferOrders({ merchantId, uniqueId })
          ])
        : Promise.resolve([]);

      const safeGoldTasks = partnerUserId
        ? Promise.all([
            fetchSafeGoldUserBalance({ partnerUserId }),
            fetchSafeGoldUserTransactions({ partnerUserId })
          ])
        : Promise.resolve([]);

      const [augmontResponses, safeGoldResponses] = await Promise.all([
        augmontTasks,
        safeGoldTasks
      ]);

      setWorkspaceResult({
        augmont: uniqueId
          ? {
              profile: augmontResponses[0]?.profile || {},
              passbook: augmontResponses[1]?.passbook || {},
              fdSchemes: augmontResponses[2]?.schemes || [],
              redeemOrders: augmontResponses[3]?.orders || [],
              transferOrders: augmontResponses[4]?.orders || []
            }
          : {
              message: "Augmont uniqueId is not available for this user yet."
            },
        safeGold: partnerUserId
          ? {
              balance: safeGoldResponses[0]?.balance || {},
              transactions: safeGoldResponses[1]?.transactions || []
            }
          : {
              message: "SafeGold partnerUserId is not available for this user yet."
            }
      });

      if (!uniqueId && !partnerUserId) {
        setWorkspaceError("Provider ids are missing for this logged-in user.");
      }
    } finally {
      setWorkspaceLoading(false);
    }
  };

  const handleSkuLookup = async () => {
    setWorkspaceError("");
    setSkuResult({});

    if (!merchantId) {
      setWorkspaceError("Merchant ID is missing.");
      return;
    }

    if (!sku.trim()) {
      setWorkspaceError("Enter a product SKU to fetch Augmont product detail.");
      return;
    }

    setSkuLoading(true);
    const response = await fetchAugmontProductDetail({
      merchantId,
      sku: sku.trim()
    });
    setSkuLoading(false);

    if (!response?.ok) {
      setWorkspaceError(response?.message || "Unable to fetch product detail.");
      return;
    }

    setSkuResult(response.product || {});
  };

  const handleAugmontRedeem = async () => {
    setActionState(setAugmontActionResult, setAugmontActionError);

    if (!merchantId) {
      setAugmontActionError("Merchant ID is missing.");
      return;
    }

    if (!uniqueId || !redeemSku.trim() || !redeemQuantity.trim()) {
      setAugmontActionError("uniqueId, SKU, and quantity are required.");
      return;
    }

    setAugmontActionLoading(true);
    const response = await createAugmontRedeemOrder({
      merchantId,
      request: {
        uniqueId,
        products: [{ sku: redeemSku.trim(), quantity: redeemQuantity.trim() }],
        modeOfPayment: augmontRedeemMode
      }
    });
    setAugmontActionLoading(false);

    if (!response?.ok) {
      setAugmontActionError(response?.message || "Unable to create redeem order.");
      return;
    }

    setAugmontActionResult(response.order || {});
  };

  const handleAugmontTransfer = async () => {
    setActionState(setAugmontActionResult, setAugmontActionError);

    if (!merchantId) {
      setAugmontActionError("Merchant ID is missing.");
      return;
    }

    if (!uniqueId || !receiverUniqueId.trim() || !transferQuantity.trim()) {
      setAugmontActionError("Sender, receiver, and quantity are required.");
      return;
    }

    setAugmontActionLoading(true);
    const response = await createAugmontTransferOrder({
      merchantId,
      request: {
        senderUniqueId: uniqueId,
        receiverUniqueId: receiverUniqueId.trim(),
        metalType: augmontTransferMetalType,
        quantity: transferQuantity.trim()
      }
    });
    setAugmontActionLoading(false);

    if (!response?.ok) {
      setAugmontActionError(response?.message || "Unable to create transfer.");
      return;
    }

    setAugmontActionResult(response.order || {});
  };

  const runSafeGoldAction = async (action) => {
    setActionState(setSafeGoldResult, setSafeGoldError);

    const requiresPartnerUser = ["balance", "transactions", "redeemVerify", "redeemConfirm", "kyc", "transferCreate"];
    if (requiresPartnerUser.includes(action) && !partnerUserId) {
      setSafeGoldError("SafeGold partnerUserId is missing for this account.");
      return;
    }

    if (action === "validate" && (!pinCode.trim() || !productWeight.trim())) {
      setSafeGoldError("Pincode and product weight are required.");
      return;
    }

    if (action === "historical" && (!historicalFrom || !historicalTo)) {
      setSafeGoldError("Select both From and To dates.");
      return;
    }

    if (action === "redeemVerify") {
      if (
        !safeGoldProductCode.trim() ||
        !safeGoldRecipientName.trim() ||
        !safeGoldPhoneNo.trim() ||
        !safeGoldState.trim() ||
        !safeGoldCity.trim() ||
        !pinCode.trim() ||
        !safeGoldAddress.trim() ||
        !safeGoldRedeemPartnerTxId.trim()
      ) {
        setSafeGoldError("Product code, recipient details, address, pincode, and partner transaction ID are required.");
        return;
      }
    }

    if (["redeemConfirm", "redeemStatus", "redeemDispatch"].includes(action) && !redeemTxId.trim()) {
      setSafeGoldError("Redeem txId is required.");
      return;
    }

    if (action === "transferCreate") {
      if (
        !safeGoldTransferName.trim() ||
        !safeGoldTransferEmail.trim() ||
        !safeGoldTransferPhoneNo.trim() ||
        !safeGoldTransferPinCode.trim() ||
        !safeGoldTransferAmount.trim() ||
        !clientReferenceId.trim()
      ) {
        setSafeGoldError("Transfer name, email, phone, pincode, gold amount, and client reference ID are required.");
        return;
      }
    }

    if (action === "transferStatus" && !clientReferenceId.trim()) {
      setSafeGoldError("Client reference ID is required.");
      return;
    }

    if (action === "invoice" && !invoiceTxId.trim()) {
      setSafeGoldError("Invoice txId is required.");
      return;
    }

    if (action === "kyc" && (!kycPanNo.trim() || !kycIdentityValue.trim())) {
      setSafeGoldError("PAN number and identity value are required for KYC update.");
      return;
    }

    setSafeGoldLoading(true);

    const actions = {
      balance: () => fetchSafeGoldUserBalance({ partnerUserId }),
      transactions: () => fetchSafeGoldUserTransactions({ partnerUserId }),
      validate: () =>
        validateSafeGoldPincode({
          pinCode: pinCode.trim(),
          productWeight: productWeight.trim()
        }),
      historical: () =>
        fetchSafeGoldHistorical({
          fromDate: historicalFrom,
          toDate: historicalTo,
          type: historicalType
        }),
      redeemVerify: () =>
        verifySafeGoldRedeem({
          partnerUserId,
          request: {
            productCode: Number(safeGoldProductCode),
            name: safeGoldRecipientName.trim(),
            phoneNo: safeGoldPhoneNo.trim(),
            address: {
              state: safeGoldState.trim(),
              city: safeGoldCity.trim(),
              pincode: pinCode.trim(),
              address: safeGoldAddress.trim(),
              landmark: safeGoldLandmark.trim()
            },
            partnerTransactionId: safeGoldRedeemPartnerTxId.trim()
          }
        }),
      redeemConfirm: () =>
        confirmSafeGoldRedeem({
          partnerUserId,
          txId: redeemTxId.trim()
        }),
      redeemStatus: () => fetchSafeGoldRedeemStatus({ txId: redeemTxId.trim() }),
      redeemDispatch: () => fetchSafeGoldRedeemDispatchStatus({ txId: redeemTxId.trim() }),
      transferCreate: () =>
        createSafeGoldTransfer({
          partnerUserId,
          request: {
            name: safeGoldTransferName.trim(),
            email: safeGoldTransferEmail.trim(),
            phoneNo: safeGoldTransferPhoneNo.trim(),
            pinCode: safeGoldTransferPinCode.trim(),
            goldAmount: Number(safeGoldTransferAmount),
            clientReferenceId: clientReferenceId.trim()
          }
        }),
      transferStatus: () =>
        fetchSafeGoldTransferStatus({
          clientReferenceId: clientReferenceId.trim()
        }),
      invoice: () =>
        fetchSafeGoldInvoice({
          txId: invoiceTxId.trim()
        }),
      kyc: () =>
        updateSafeGoldKyc({
          partnerUserId,
          request: {
            kycRequirement: {
              panNo: kycPanNo.trim(),
              identityType: kycIdentityType,
              identityValue: kycIdentityValue.trim()
            }
          }
        })
    };

    const response = await actions[action]();
    setSafeGoldLoading(false);

    if (!response?.ok) {
      setSafeGoldError(response?.message || "SafeGold action failed.");
      return;
    }

    setSafeGoldResult(
      response?.balance ||
        response?.transactions ||
        response?.validation ||
        response?.data ||
        response?.status ||
        response?.confirmation ||
        response?.invoice ||
        response?.verified ||
        {}
    );
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar />

      <div className="mx-auto max-w-7xl space-y-6 px-6 pb-12 pt-28">
        <div className="overflow-hidden rounded-[2rem] border border-yellow-500/15 bg-[radial-gradient(circle_at_top_left,_rgba(250,204,21,0.18),_transparent_32%),linear-gradient(135deg,_rgba(255,255,255,0.03),_rgba(255,255,255,0))] p-8">
          <p className="text-sm uppercase tracking-[0.24em] text-yellow-300">Goldplatform Workspace</p>
          <h1 className="mt-3 text-4xl font-bold">Augmont And SafeGold Control Center</h1>
          <p className="mt-3 max-w-3xl text-sm text-white/60">
            This workspace stays inside goldplatform after app login. Every action here uses your wrapper APIs only and waits for actual user input instead of sending provider-style hardcoded fields.
          </p>
        </div>

        <Card title="Identifiers" subtitle="Current logged-in mappings available to the wrapper layer">
          <div className="grid gap-4 md:grid-cols-4">
            {summary.map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/8 bg-black/20 p-4">
                <p className="text-xs text-white/45">{item.label}</p>
                <p className="mt-2 break-all text-sm font-medium text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card
            title="Augmont Toolkit"
            subtitle="Workspace snapshot, product detail, redeem, and transfer flows through the wrapper backend"
          >
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={loadWorkspace}
                disabled={workspaceLoading}
                className="rounded-xl bg-yellow-500 px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-60"
              >
                {workspaceLoading ? "Refreshing..." : "Refresh Workspace"}
              </button>
            </div>

            {workspaceError ? (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-200">
                {workspaceError}
              </div>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <input
                value={sku}
                onChange={(event) => setSku(event.target.value)}
                placeholder="Augmont SKU"
                className={inputClassName}
              />
              <button
                type="button"
                onClick={handleSkuLookup}
                disabled={skuLoading}
                className={actionButtonClassName}
              >
                {skuLoading ? "Fetching..." : "Fetch Product"}
              </button>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm font-semibold text-white">Redeem Order</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Field label="SKU">
                  <input value={redeemSku} onChange={(event) => setRedeemSku(event.target.value)} placeholder="Product SKU" className={inputClassName} />
                </Field>
                <Field label="Quantity">
                  <input value={redeemQuantity} onChange={(event) => setRedeemQuantity(event.target.value)} placeholder="1" className={inputClassName} />
                </Field>
                <Field label="Mode of payment">
                  <select value={augmontRedeemMode} onChange={(event) => setAugmontRedeemMode(event.target.value)} className={inputClassName}>
                    <option value="wallet">wallet</option>
                    <option value="UPI">UPI</option>
                    <option value="NET_BANKING">NET_BANKING</option>
                    <option value="CARD">CARD</option>
                  </select>
                </Field>
                <div className="flex items-end">
                  <button type="button" onClick={handleAugmontRedeem} disabled={augmontActionLoading} className={`${actionButtonClassName} w-full`}>
                    {augmontActionLoading ? "Submitting..." : "Create Redeem"}
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm font-semibold text-white">Transfer Order</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Field label="Receiver uniqueId">
                  <input value={receiverUniqueId} onChange={(event) => setReceiverUniqueId(event.target.value)} placeholder="Receiver uniqueId" className={inputClassName} />
                </Field>
                <Field label="Quantity">
                  <input value={transferQuantity} onChange={(event) => setTransferQuantity(event.target.value)} placeholder="0.0100" className={inputClassName} />
                </Field>
                <Field label="Metal type">
                  <select value={augmontTransferMetalType} onChange={(event) => setAugmontTransferMetalType(event.target.value)} className={inputClassName}>
                    <option value="gold">gold</option>
                    <option value="silver">silver</option>
                  </select>
                </Field>
                <div className="flex items-end">
                  <button type="button" onClick={handleAugmontTransfer} disabled={augmontActionLoading} className={`${actionButtonClassName} w-full`}>
                    {augmontActionLoading ? "Submitting..." : "Create Transfer"}
                  </button>
                </div>
              </div>
            </div>

            {augmontActionError ? (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-200">
                {augmontActionError}
              </div>
            ) : null}

            <JsonPanel title="Workspace Data" value={workspaceResult} />
            <JsonPanel title="Product Detail" value={skuResult} />
            <JsonPanel title="Augmont Action Result" value={augmontActionResult} />
          </Card>

          <Card
            title="SafeGold Toolkit"
            subtitle="Balance, transactions, pincode, historical, redeem, transfer, invoice, and KYC through the wrapper backend"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={() => runSafeGoldAction("balance")} disabled={safeGoldLoading} className={actionButtonClassName}>
                Fetch Balance
              </button>
              <button type="button" onClick={() => runSafeGoldAction("transactions")} disabled={safeGoldLoading} className={actionButtonClassName}>
                Fetch Transactions
              </button>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm font-semibold text-white">Pincode Validation</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Field label="Pincode">
                  <input value={pinCode} onChange={(event) => setPinCode(event.target.value)} placeholder="Enter pincode" className={inputClassName} />
                </Field>
                <Field label="Product weight">
                  <input value={productWeight} onChange={(event) => setProductWeight(event.target.value)} placeholder="Enter product weight" className={inputClassName} />
                </Field>
              </div>
              <button type="button" onClick={() => runSafeGoldAction("validate")} disabled={safeGoldLoading} className={`${actionButtonClassName} mt-4`}>
                Validate Pincode
              </button>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm font-semibold text-white">Historical Rates</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <Field label="From">
                  <input type="date" value={historicalFrom} onChange={(event) => setHistoricalFrom(event.target.value)} className={inputClassName} />
                </Field>
                <Field label="To">
                  <input type="date" value={historicalTo} onChange={(event) => setHistoricalTo(event.target.value)} className={inputClassName} />
                </Field>
                <Field label="Type">
                  <select value={historicalType} onChange={(event) => setHistoricalType(event.target.value)} className={inputClassName}>
                    <option value="d">d</option>
                    <option value="w">w</option>
                    <option value="m">m</option>
                  </select>
                </Field>
              </div>
              <button type="button" onClick={() => runSafeGoldAction("historical")} disabled={safeGoldLoading} className={`${actionButtonClassName} mt-4`}>
                Fetch Historical Data
              </button>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm font-semibold text-white">Redeem Flow</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Field label="Product code">
                  <input value={safeGoldProductCode} onChange={(event) => setSafeGoldProductCode(event.target.value)} placeholder="SafeGold product code" className={inputClassName} />
                </Field>
                <Field label="Recipient name">
                  <input value={safeGoldRecipientName} onChange={(event) => setSafeGoldRecipientName(event.target.value)} placeholder="Recipient name" className={inputClassName} />
                </Field>
                <Field label="Phone number">
                  <input value={safeGoldPhoneNo} onChange={(event) => setSafeGoldPhoneNo(event.target.value)} placeholder="Phone number" className={inputClassName} />
                </Field>
                <Field label="State">
                  <input value={safeGoldState} onChange={(event) => setSafeGoldState(event.target.value)} placeholder="State" className={inputClassName} />
                </Field>
                <Field label="City">
                  <input value={safeGoldCity} onChange={(event) => setSafeGoldCity(event.target.value)} placeholder="City" className={inputClassName} />
                </Field>
                <Field label="Partner transaction ID">
                  <input value={safeGoldRedeemPartnerTxId} onChange={(event) => setSafeGoldRedeemPartnerTxId(event.target.value)} placeholder="Partner transaction ID" className={inputClassName} />
                </Field>
                <Field label="Address" hint="This is sent exactly as entered to the wrapper API.">
                  <input value={safeGoldAddress} onChange={(event) => setSafeGoldAddress(event.target.value)} placeholder="Address" className={inputClassName} />
                </Field>
                <Field label="Landmark">
                  <input value={safeGoldLandmark} onChange={(event) => setSafeGoldLandmark(event.target.value)} placeholder="Landmark" className={inputClassName} />
                </Field>
                <Field label="Redeem txId">
                  <input value={redeemTxId} onChange={(event) => setRedeemTxId(event.target.value)} placeholder="Redeem txId" className={inputClassName} />
                </Field>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <button type="button" onClick={() => runSafeGoldAction("redeemVerify")} disabled={safeGoldLoading} className={actionButtonClassName}>
                  Redeem Verify
                </button>
                <button type="button" onClick={() => runSafeGoldAction("redeemConfirm")} disabled={safeGoldLoading} className={actionButtonClassName}>
                  Redeem Confirm
                </button>
                <button type="button" onClick={() => runSafeGoldAction("redeemStatus")} disabled={safeGoldLoading} className={actionButtonClassName}>
                  Redeem Status
                </button>
                <button type="button" onClick={() => runSafeGoldAction("redeemDispatch")} disabled={safeGoldLoading} className={actionButtonClassName}>
                  Dispatch Status
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm font-semibold text-white">Transfer And Invoice</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Field label="Transfer name">
                  <input value={safeGoldTransferName} onChange={(event) => setSafeGoldTransferName(event.target.value)} placeholder="Transfer name" className={inputClassName} />
                </Field>
                <Field label="Transfer email">
                  <input value={safeGoldTransferEmail} onChange={(event) => setSafeGoldTransferEmail(event.target.value)} placeholder="Transfer email" className={inputClassName} />
                </Field>
                <Field label="Transfer phone">
                  <input value={safeGoldTransferPhoneNo} onChange={(event) => setSafeGoldTransferPhoneNo(event.target.value)} placeholder="Transfer phone" className={inputClassName} />
                </Field>
                <Field label="Transfer pincode">
                  <input value={safeGoldTransferPinCode} onChange={(event) => setSafeGoldTransferPinCode(event.target.value)} placeholder="Transfer pincode" className={inputClassName} />
                </Field>
                <Field label="Gold amount">
                  <input value={safeGoldTransferAmount} onChange={(event) => setSafeGoldTransferAmount(event.target.value)} placeholder="Gold amount" className={inputClassName} />
                </Field>
                <Field label="Client reference ID">
                  <input value={clientReferenceId} onChange={(event) => setClientReferenceId(event.target.value)} placeholder="Client reference ID" className={inputClassName} />
                </Field>
                <Field label="Invoice txId">
                  <input value={invoiceTxId} onChange={(event) => setInvoiceTxId(event.target.value)} placeholder="Invoice txId" className={inputClassName} />
                </Field>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <button type="button" onClick={() => runSafeGoldAction("transferCreate")} disabled={safeGoldLoading} className={actionButtonClassName}>
                  Create Transfer
                </button>
                <button type="button" onClick={() => runSafeGoldAction("transferStatus")} disabled={safeGoldLoading} className={actionButtonClassName}>
                  Transfer Status
                </button>
                <button type="button" onClick={() => runSafeGoldAction("invoice")} disabled={safeGoldLoading} className={actionButtonClassName}>
                  Fetch Invoice
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm font-semibold text-white">KYC Update</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <Field label="PAN number">
                  <input value={kycPanNo} onChange={(event) => setKycPanNo(event.target.value)} placeholder="PAN number" className={inputClassName} />
                </Field>
                <Field label="Identity type">
                  <select value={kycIdentityType} onChange={(event) => setKycIdentityType(event.target.value)} className={inputClassName}>
                    <option value="aadhaar">aadhaar</option>
                    <option value="passport">passport</option>
                    <option value="driving_license">driving_license</option>
                    <option value="voter_id">voter_id</option>
                  </select>
                </Field>
                <Field label="Identity value">
                  <input value={kycIdentityValue} onChange={(event) => setKycIdentityValue(event.target.value)} placeholder="Identity value" className={inputClassName} />
                </Field>
              </div>
              <button type="button" onClick={() => runSafeGoldAction("kyc")} disabled={safeGoldLoading} className={`${actionButtonClassName} mt-4`}>
                Update KYC
              </button>
            </div>

            {safeGoldError ? (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-200">
                {safeGoldError}
              </div>
            ) : null}

            {safeGoldLoading ? (
              <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-4 text-sm text-yellow-100">
                Running SafeGold action...
              </div>
            ) : null}

            <JsonPanel title="SafeGold Result" value={safeGoldResult} />
          </Card>
        </div>
      </div>
    </div>
  );
}
