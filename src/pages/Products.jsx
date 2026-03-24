import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import SafeGoldProductCard from "../components/SafeGoldProductCard";
import { getUserProfile, setUserProfile } from "../api/authApi";
import {
  createAugmontAddress,
  createAugmontBuyOrder,
  fetchAugmontUserProfile,
  createAugmontUser,
  createAugmontUserBank,
  fetchAugmontAddresses,
  fetchAugmontKycProfile,
  fetchAugmontProducts,
  getAugmontSession,
  getAugmontUser,
  normalizeAugmontUserProfile,
  updateAugmontUser,
  updateAugmontKyc,
  setAugmontUser
} from "../api/augmontApi";
import { fetchSafeGoldProducts } from "../api/safeGoldApi";

const initialPagination = {
  hasMore: false,
  count: 0,
  per_page: 10,
  current_page: 1
};

const paymentModes = ["UPI", "NET_BANKING", "CARD"];
const buildGeneratedUniqueId = () =>
  `AUG-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

const formatPrice = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

const getDefaultQuantity = (product) => {
  const weight = Number.parseFloat(product?.productWeight || "0");
  if (!Number.isFinite(weight) || weight <= 0) return "0.1000";
  return weight.toFixed(4);
};

function ErrorBanner({ message, meta, onRetry }) {
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center">
      <p className="text-red-300">{message}</p>
      {meta && <p className="mt-2 text-xs text-white/60">Provider: {meta}</p>}
      <button
        onClick={onRetry}
        className="mt-4 rounded-xl bg-yellow-500 px-6 py-2 text-black"
      >
        Retry
      </button>
    </div>
  );
}

export default function Products() {
  const navigate = useNavigate();
  const PRODUCT_SELECTION_KEY = "selectedGoldProduct";

  const [augmontProducts, setAugmontProducts] = useState([]);
  const [augmontPagination, setAugmontPagination] = useState(initialPagination);
  const [augmontLoading, setAugmontLoading] = useState(true);
  const [augmontLoadingMore, setAugmontLoadingMore] = useState(false);
  const [augmontError, setAugmontError] = useState("");
  const [augmontErrorMeta, setAugmontErrorMeta] = useState("");

  const [safeGoldProducts, setSafeGoldProducts] = useState([]);
  const [safeGoldLoading, setSafeGoldLoading] = useState(true);
  const [safeGoldError, setSafeGoldError] = useState("");

  const [selectedAugmontProduct, setSelectedAugmontProduct] = useState(null);
  const [augmontBuyForm, setAugmontBuyForm] = useState({
    quantity: "0.1000",
    modeOfPayment: "UPI"
  });
  const [resolvedAugmontUniqueId, setResolvedAugmontUniqueId] = useState("");
  const [createdAugmontUser, setCreatedAugmontUser] = useState(null);
  const [augmontBuyOrder, setAugmontBuyOrder] = useState(null);
  const [augmontAddresses, setAugmontAddresses] = useState([]);
  const [augmontKycProfile, setAugmontKycProfile] = useState(null);
  const [onboardingForm, setOnboardingForm] = useState({
    userName: "",
    mobileNumber: "",
    emailId: "",
    stateName: "",
    cityName: "",
    userPincode: "",
    accountName: "",
    accountNumber: "",
    ifscCode: "",
    address: "",
    kycPayload: ""
  });
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupError, setSetupError] = useState("");
  const [buyLoading, setBuyLoading] = useState(false);
  const [buyError, setBuyError] = useState("");
  const productRequestRef = useRef({
    inFlight: false,
    key: ""
  });

  const appProfile = getUserProfile();
  const augmontUser = getAugmontUser();
  const sessionMerchantId =
    getAugmontSession()?.merchantId ||
    import.meta.env.VITE_AUGMONT_MERCHANT_ID?.trim() ||
    "";
  const uniqueId = resolvedAugmontUniqueId || augmontUser?.uniqueId || appProfile?.uniqueId || "";
  const customerMappedId =
    createdAugmontUser?.customerMappedId ||
    augmontUser?.customerMappedId ||
    appProfile?.customerMappedId ||
    "";
  const onboardingProfile = createdAugmontUser || augmontUser || {
    uniqueId: appProfile?.uniqueId || "",
    customerMappedId: appProfile?.customerMappedId || "",
    userStateId: appProfile?.augmontStateId || "",
    userCityId: appProfile?.augmontCityId || "",
    stateName: appProfile?.augmontState || "",
    cityName: appProfile?.augmontCity || "",
    userState: appProfile?.augmontState || "",
    userCity: appProfile?.augmontCity || "",
    kycStatus: appProfile?.augmontKycStatus || "",
    createdAt: appProfile?.augmontCreatedAt || "",
    mobileNumber: appProfile?.mobileNumber || "",
    userEmail: appProfile?.email || "",
    userPincode: appProfile?.pinCode || "",
    userName: appProfile?.fullName || ""
  };
  const onboardingReady = Boolean(
    createdAugmontUser?.profileCompleted ||
      createdAugmontUser?.customerMappedId ||
      augmontUser?.profileCompleted ||
      augmontUser?.customerMappedId ||
      appProfile?.customerMappedId
  );

  const loadAugmontProducts = useCallback(async ({ page = 1, append = false } = {}) => {
    const requestKey = `${page}-10-${append ? "append" : "replace"}`;

    if (productRequestRef.current.inFlight) {
      if (productRequestRef.current.key === requestKey) {
        return;
      }

      return;
    }

    productRequestRef.current = {
      inFlight: true,
      key: requestKey
    };

    if (append) {
      setAugmontLoadingMore(true);
    } else {
      setAugmontLoading(true);
      setAugmontError("");
      setAugmontErrorMeta("");
    }

    const response = await fetchAugmontProducts(
      page,
      10,
      sessionMerchantId
    );

    if (!response?.ok) {
      setAugmontError(response?.message || "Failed to fetch Augmont products");
      setAugmontErrorMeta(response?.providerUrl || "");
      if (!append) {
        setAugmontProducts([]);
      }
      setAugmontLoading(false);
      setAugmontLoadingMore(false);
      productRequestRef.current = {
        inFlight: false,
        key: ""
      };
      return;
    }

    setAugmontProducts((current) =>
      append ? [...current, ...response.products] : response.products
    );
    setAugmontPagination(response.pagination);
    setAugmontLoading(false);
    setAugmontLoadingMore(false);
    productRequestRef.current = {
      inFlight: false,
      key: ""
    };
  }, [sessionMerchantId]);

  const loadSafeGoldProducts = useCallback(async () => {
    setSafeGoldLoading(true);
    setSafeGoldError("");

    const response = await fetchSafeGoldProducts();

    if (!response?.ok) {
      setSafeGoldError(response?.message || "Failed to fetch SafeGold products");
      setSafeGoldProducts([]);
      setSafeGoldLoading(false);
      return;
    }

    setSafeGoldProducts(response.products);
    setSafeGoldLoading(false);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadAugmontProducts();
      loadSafeGoldProducts();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadAugmontProducts, loadSafeGoldProducts]);

  const handleProductClick = (sku) => {
    if (!sku) return;
    navigate(`/products?sku=${encodeURIComponent(sku)}`);
  };

  const handleBuyProduct = (source, product) => {
    if (!product) return;

    if (source === "augmont") {
      const nextUniqueId =
        augmontUser?.uniqueId || appProfile?.uniqueId || "";

      setSelectedAugmontProduct(product);
      setAugmontBuyForm({
        quantity: getDefaultQuantity(product),
        modeOfPayment: "UPI"
      });
      setCreatedAugmontUser(null);
      setAugmontBuyOrder(null);
      setAugmontAddresses([]);
      setAugmontKycProfile(null);
      setResolvedAugmontUniqueId(nextUniqueId);
      setOnboardingForm({
        userName:
          augmontUser?.userName ||
          appProfile?.fullName ||
          "",
        mobileNumber:
          augmontUser?.mobileNumber ||
          appProfile?.mobileNumber ||
          "",
        emailId:
          augmontUser?.userEmail ||
          appProfile?.email ||
          "",
        stateName:
          augmontUser?.stateName ||
          augmontUser?.userState ||
          appProfile?.augmontState ||
          "",
        cityName:
          augmontUser?.cityName ||
          augmontUser?.userCity ||
          appProfile?.augmontCity ||
          "",
        userPincode:
          augmontUser?.userPincode ||
          appProfile?.pinCode ||
          "",
        accountName:
          augmontUser?.userName ||
          appProfile?.fullName ||
          "",
        accountNumber: "",
        ifscCode: "",
        address: "",
        kycPayload: ""
      });
      setSetupError("");
      setBuyError("");
      return;
    }

    const selectedProduct = {
      source,
      id: product?.skuNumber || product?.id || "",
      name: product?.title || "Gold Product",
      price: Number(product?.price ?? 0),
      image: product?.image || "",
      sku: product?.skuNumber || "",
      description: product?.description || "",
      metal: product?.metal || "",
      purity: product?.purity || "",
      weight: product?.weight ?? null,
      brand: product?.brand || "",
      dispatchTime: product?.dispatchTime || "",
      certification: product?.certification || "",
      raw: product
    };

    localStorage.setItem(PRODUCT_SELECTION_KEY, JSON.stringify(selectedProduct));
    navigate("/portfolio?tab=buy", {
      state: {
        selectedProduct
      }
    });
  };

  const handleCreateAugmontUser = async () => {
    if (!selectedAugmontProduct) return;
    const trimmedStateName = onboardingForm.stateName.trim();
    const trimmedCityName = onboardingForm.cityName.trim();
    const trimmedAddress = onboardingForm.address.trim();
    const trimmedAccountNumber = onboardingForm.accountNumber.trim();
    const trimmedAccountName = onboardingForm.accountName.trim();
    const trimmedIfscCode = onboardingForm.ifscCode.trim();

    if (!sessionMerchantId) {
      setSetupError("Merchant ID is missing. Configure it before creating the Augmont user.");
      return;
    }

    if (!trimmedStateName || !trimmedCityName) {
      setSetupError("State and city names are required for Augmont onboarding.");
      return;
    }

    if (!onboardingForm.userPincode.trim()) {
      setSetupError("Pincode is required for Augmont onboarding.");
      return;
    }

    if (!trimmedAccountNumber || !trimmedAccountName || !trimmedIfscCode) {
      setSetupError("Bank account number, account name, and IFSC are required.");
      return;
    }

    if (!trimmedAddress) {
      setSetupError("Address is required so the wrapper can create the saved address.");
      return;
    }

    if (!appProfile?.mobileNumber || !appProfile?.email || !appProfile?.fullName || !appProfile?.pinCode) {
      setSetupError("App profile is missing full name, email, mobile number, or pincode. Complete the app profile first.");
      return;
    }

    setSetupLoading(true);
    setSetupError("");
    setCreatedAugmontUser(null);
    setAugmontAddresses([]);
    setAugmontKycProfile(null);

    const nextUniqueId = uniqueId || buildGeneratedUniqueId();
    const userRequest = {
      mobileNumber: onboardingForm.mobileNumber || appProfile?.mobileNumber || "",
      emailId: onboardingForm.emailId || appProfile?.email || "",
      uniqueId: nextUniqueId,
      userName: onboardingForm.userName || appProfile?.fullName || "",
      stateName: trimmedStateName,
      cityName: trimmedCityName,
      userPincode: onboardingForm.userPincode || appProfile?.pinCode || ""
    };
    const createResponse = onboardingReady
      ? await updateAugmontUser({
          merchantId: sessionMerchantId,
          uniqueId: nextUniqueId,
          request: userRequest
        })
      : await createAugmontUser(userRequest, sessionMerchantId);

    if (!createResponse?.ok) {
      setSetupLoading(false);
      setSetupError(
        createResponse?.message ||
          (onboardingReady ? "Unable to update Augmont user" : "Unable to create Augmont user")
      );
      return;
    }

    const profileResponse = await fetchAugmontUserProfile(nextUniqueId);

    if (!profileResponse?.ok) {
      setSetupLoading(false);
      setSetupError(profileResponse?.message || "User created, but profile lookup failed.");
      return;
    }

    const bankResponse = await createAugmontUserBank({
      merchantId: sessionMerchantId,
      uniqueId: nextUniqueId,
      request: {
        accountNumber: trimmedAccountNumber,
        accountName: trimmedAccountName,
        ifscCode: trimmedIfscCode
      }
    });

    if (!bankResponse?.ok) {
      setSetupLoading(false);
      setSetupError(bankResponse?.message || "User created, but bank creation failed.");
      return;
    }

    const addressCreateResponse = await createAugmontAddress({
      merchantId: sessionMerchantId,
      uniqueId: nextUniqueId,
      request: {
        address: trimmedAddress
      }
    });

    if (!addressCreateResponse?.ok) {
      setSetupLoading(false);
      setSetupError(
        addressCreateResponse?.message || "User and bank created, but address creation failed."
      );
      return;
    }

    const addressesResponse = await fetchAugmontAddresses(nextUniqueId, sessionMerchantId);
    const nextAddresses = addressesResponse?.ok ? addressesResponse.addresses || [] : [];

    let nextKycProfile = null;
    if (onboardingForm.kycPayload.trim()) {
      let parsedKycPayload = null;

      try {
        parsedKycPayload = JSON.parse(onboardingForm.kycPayload);
      } catch {
        setSetupLoading(false);
        setSetupError("KYC payload must be valid JSON when provided.");
        return;
      }

      const kycUpdateResponse = await updateAugmontKyc({
        merchantId: sessionMerchantId,
        uniqueId: nextUniqueId,
        request: parsedKycPayload
      });

      if (!kycUpdateResponse?.ok) {
        setSetupLoading(false);
        setSetupError(kycUpdateResponse?.message || "KYC update failed.");
        return;
      }
    }

    const kycProfileResponse = await fetchAugmontKycProfile(nextUniqueId, sessionMerchantId);
    if (kycProfileResponse?.ok) {
      nextKycProfile = kycProfileResponse.kycProfile || null;
    }

    setSetupLoading(false);
    const profile = normalizeAugmontUserProfile(profileResponse.profile, nextUniqueId);
    const persistedProfile = {
      userName:
        profile.userName ||
        onboardingForm.userName ||
        appProfile?.fullName ||
        "",
      uniqueId: String(profile.uniqueId || nextUniqueId),
      customerMappedId: String(profile.customerMappedId || ""),
      mobileNumber:
        profile.mobileNumber ||
        onboardingForm.mobileNumber ||
        appProfile?.mobileNumber ||
        "",
      userEmail:
        profile.userEmail ||
        onboardingForm.emailId ||
        appProfile?.email ||
        "",
      emailId:
        profile.userEmail ||
        onboardingForm.emailId ||
        appProfile?.email ||
        "",
      userStateId: String(profile.userStateId || ""),
      userCityId: String(profile.userCityId || ""),
      userPincode:
        profile.userPincode ||
        onboardingForm.userPincode ||
        appProfile?.pinCode ||
        "",
      kycStatus:
        profile.kycStatus ||
        nextKycProfile?.kycStatus ||
        nextKycProfile?.status ||
        "",
      stateName:
        profile.stateName ||
        profile.userState ||
        trimmedStateName,
      cityName:
        profile.cityName ||
        profile.userCity ||
        trimmedCityName,
      userState:
        profile.userState || profile.stateName || trimmedStateName,
      userCity:
        profile.userCity || profile.cityName || trimmedCityName,
      createdAt: profile.createdAt || "",
      userBankId: profile.userBankId || "",
      userAddressId: profile.userAddressId || "",
      profileCompleted: true
    };

    setCreatedAugmontUser(persistedProfile);
    setAugmontAddresses(nextAddresses);
    setAugmontKycProfile(nextKycProfile);
    setResolvedAugmontUniqueId(persistedProfile.uniqueId);
    setAugmontUser(persistedProfile);
    setUserProfile({
      fullName: appProfile?.fullName || persistedProfile.userName || "",
      email: appProfile?.email || persistedProfile.userEmail || "",
      mobileNumber: appProfile?.mobileNumber || persistedProfile.mobileNumber || "",
      pinCode: appProfile?.pinCode || persistedProfile.userPincode || "",
      uniqueId: persistedProfile.uniqueId,
      partnerUserId: appProfile?.partnerUserId || "",
      customerMappedId: persistedProfile.customerMappedId,
      augmontStateId: persistedProfile.userStateId,
      augmontCityId: persistedProfile.userCityId,
      augmontState: persistedProfile.stateName || persistedProfile.userState,
      augmontCity: persistedProfile.cityName || persistedProfile.userCity,
      augmontKycStatus: persistedProfile.kycStatus,
      augmontCreatedAt: persistedProfile.createdAt
    });
  };

  const handleCreateAugmontBuyOrder = async () => {
    if (!selectedAugmontProduct) return;

    if (!uniqueId) {
      setBuyError("Complete Augmont user onboarding before placing the buy order.");
      return;
    }

    if (!augmontBuyForm.quantity) {
      setBuyError("Quantity is required.");
      return;
    }

    setBuyLoading(true);
    setBuyError("");
    setAugmontBuyOrder(null);

    const response = await createAugmontBuyOrder({
      merchantId: sessionMerchantId,
      request: {
        metalType: String(selectedAugmontProduct?.metalType || "gold").toLowerCase(),
        quantity: augmontBuyForm.quantity,
        uniqueId,
        modeOfPayment: augmontBuyForm.modeOfPayment
      }
    });

    setBuyLoading(false);

    if (!response?.ok) {
      setBuyError(response?.message || "Unable to place Augmont buy order");
      return;
    }

    setAugmontBuyOrder(response.order || {});
  };

  const unifiedProducts = [
    ...augmontProducts.map((product) => ({
      source: "augmont",
      id: product?.sku || product?.id,
      product
    })),
    ...safeGoldProducts.map((product) => ({
      source: "safegold",
      id: product?.skuNumber || product?.id,
      product
    }))
  ];

  const initialLoading = augmontLoading || safeGoldLoading;
  const isEmpty =
    !initialLoading &&
    unifiedProducts.length === 0 &&
    !augmontError &&
    !safeGoldError;

  return (
    <div className="bg-black text-white">
      <Navbar />

      <main className="pt-20">
        <section className="px-6 py-28 lg:px-20">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-4 text-center text-4xl font-bold">
              Gold Products
            </h2>

            <p className="mx-auto mb-10 max-w-2xl text-center text-white/60">
              Explore our live gold product catalog in one unified product feed.
            </p>

            {(augmontLoading || safeGoldLoading) && unifiedProducts.length === 0 && (
              <div className="rounded-2xl border border-white/10 bg-[#111] p-8 text-center text-gray-400">
                Loading products...
              </div>
            )}

            {!initialLoading && augmontError && (
              <div className="mb-6">
                <ErrorBanner
                  message={augmontError}
                  meta={augmontErrorMeta}
                  onRetry={() => loadAugmontProducts({ page: 1, append: false })}
                />
              </div>
            )}

            {!initialLoading && safeGoldError && (
              <div className="mb-6">
                <ErrorBanner
                  message={safeGoldError}
                  onRetry={loadSafeGoldProducts}
                />
              </div>
            )}

            {!initialLoading && unifiedProducts.length > 0 && (
              <>
                <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#111] p-4 text-sm text-gray-300 sm:flex-row sm:items-center sm:justify-between">
                  <p>Showing {unifiedProducts.length} products</p>
                  <p>
                    Augmont: {augmontProducts.length} • SafeGold: {safeGoldProducts.length}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {unifiedProducts.map((item) =>
                    item.source === "augmont" ? (
                      <ProductCard
                        key={`augmont-${item.id}`}
                        product={item.product}
                        onClick={handleProductClick}
                        onBuy={(product) => handleBuyProduct("augmont", product)}
                      />
                    ) : (
                      <SafeGoldProductCard
                        key={`safegold-${item.id}`}
                        product={item.product}
                        onClick={handleProductClick}
                        onBuy={(product) => handleBuyProduct("safegold", product)}
                      />
                    )
                  )}
                </div>

                {augmontPagination?.hasMore && (
                  <div className="mt-10 flex justify-center">
                    <button
                      onClick={() =>
                        loadAugmontProducts({
                          page: (augmontPagination?.current_page || 1) + 1,
                          append: true
                        })
                      }
                      disabled={augmontLoadingMore}
                      className="rounded-xl bg-yellow-500 px-6 py-3 font-semibold text-black disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {augmontLoadingMore ? "Loading more..." : "Load More Products"}
                    </button>
                  </div>
                )}
              </>
            )}

            {isEmpty && (
              <div className="rounded-2xl border border-white/10 bg-[#111] p-8 text-center text-gray-400">
                No products found.
              </div>
            )}
          </div>
        </section>
      </main>

      {selectedAugmontProduct ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-3xl border border-white/10 bg-[#0f0f0f] p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-yellow-300">
                  Augmont User Onboarding
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-white">
                  {selectedAugmontProduct.name}
                </h3>
                <p className="mt-2 text-sm text-white/55">
                  Complete the wrapper onboarding flow here. The frontend stays on app auth for login, then uses goldplatform wrapper APIs only for Augmont user, bank, address, and KYC profile setup.
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedAugmontProduct(null);
                  setCreatedAugmontUser(null);
                  setAugmontBuyOrder(null);
                  setAugmontAddresses([]);
                  setAugmontKycProfile(null);
                  setSetupError("");
                  setBuyError("");
                }}
                className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:border-red-500/30 hover:text-red-200"
              >
                Close
              </button>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-4 rounded-2xl border border-white/10 bg-black/20 p-5">
                <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
                  <p className="text-sm font-semibold text-cyan-200">
                    Required onboarding flow
                  </p>
                  <p className="mt-2 text-xs text-white/60">
                    {"users/create -> users/profile -> users/banks/create -> users/addresses/create -> users/addresses/list -> users/kyc/profile"}
                  </p>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-white/45">Resolved uniqueId</p>
                      <p className="mt-1 break-all text-sm font-medium text-white">
                        {uniqueId || "Will be created after setup"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-white/45">Setup status</p>
                      <p className="mt-1 text-sm font-medium text-white">
                        {onboardingReady ? "User ready for later Augmont APIs" : "Onboarding required"}
                      </p>
                    </div>
                  </div>

                  {!onboardingReady ? (
                    <div className="mt-4 space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block">
                          <span className="mb-2 block text-sm text-white/60">User name</span>
                          <input
                            type="text"
                            value={onboardingForm.userName}
                            onChange={(event) =>
                              setOnboardingForm((current) => ({
                                ...current,
                                userName: event.target.value
                              }))
                            }
                            className="w-full rounded-xl border border-white/10 bg-[#111] px-4 py-3 outline-none"
                          />
                        </label>

                        <label className="block">
                          <span className="mb-2 block text-sm text-white/60">Mobile number</span>
                          <input
                            type="tel"
                            value={onboardingForm.mobileNumber}
                            onChange={(event) =>
                              setOnboardingForm((current) => ({
                                ...current,
                                mobileNumber: event.target.value
                              }))
                            }
                            className="w-full rounded-xl border border-white/10 bg-[#111] px-4 py-3 outline-none"
                          />
                        </label>

                        <label className="block">
                          <span className="mb-2 block text-sm text-white/60">Email</span>
                          <input
                            type="email"
                            value={onboardingForm.emailId}
                            onChange={(event) =>
                              setOnboardingForm((current) => ({
                                ...current,
                                emailId: event.target.value
                              }))
                            }
                            className="w-full rounded-xl border border-white/10 bg-[#111] px-4 py-3 outline-none"
                          />
                        </label>

                        <label className="block">
                          <span className="mb-2 block text-sm text-white/60">Pincode</span>
                          <input
                            type="text"
                            value={onboardingForm.userPincode}
                            onChange={(event) =>
                              setOnboardingForm((current) => ({
                                ...current,
                                userPincode: event.target.value
                              }))
                            }
                            className="w-full rounded-xl border border-white/10 bg-[#111] px-4 py-3 outline-none"
                          />
                        </label>

                        <label className="block">
                          <span className="mb-2 block text-sm text-white/60">State name</span>
                          <input
                            type="text"
                            value={onboardingForm.stateName}
                            onChange={(event) =>
                              setOnboardingForm((current) => ({
                                ...current,
                                stateName: event.target.value
                              }))
                            }
                            className="w-full rounded-xl border border-white/10 bg-[#111] px-4 py-3 outline-none"
                            placeholder="Telangana"
                          />
                        </label>

                        <label className="block">
                          <span className="mb-2 block text-sm text-white/60">City name</span>
                          <input
                            type="text"
                            value={onboardingForm.cityName}
                            onChange={(event) =>
                              setOnboardingForm((current) => ({
                                ...current,
                                cityName: event.target.value
                              }))
                            }
                            className="w-full rounded-xl border border-white/10 bg-[#111] px-4 py-3 outline-none"
                            placeholder="Hyderabad"
                          />
                        </label>

                        <label className="block">
                          <span className="mb-2 block text-sm text-white/60">Bank account name</span>
                          <input
                            type="text"
                            value={onboardingForm.accountName}
                            onChange={(event) =>
                              setOnboardingForm((current) => ({
                                ...current,
                                accountName: event.target.value
                              }))
                            }
                            className="w-full rounded-xl border border-white/10 bg-[#111] px-4 py-3 outline-none"
                          />
                        </label>

                        <label className="block">
                          <span className="mb-2 block text-sm text-white/60">Bank account number</span>
                          <input
                            type="text"
                            value={onboardingForm.accountNumber}
                            onChange={(event) =>
                              setOnboardingForm((current) => ({
                                ...current,
                                accountNumber: event.target.value
                              }))
                            }
                            className="w-full rounded-xl border border-white/10 bg-[#111] px-4 py-3 outline-none"
                          />
                        </label>

                        <label className="block sm:col-span-2">
                          <span className="mb-2 block text-sm text-white/60">IFSC code</span>
                          <input
                            type="text"
                            value={onboardingForm.ifscCode}
                            onChange={(event) =>
                              setOnboardingForm((current) => ({
                                ...current,
                                ifscCode: event.target.value
                              }))
                            }
                            className="w-full rounded-xl border border-white/10 bg-[#111] px-4 py-3 outline-none"
                          />
                        </label>

                        <label className="block sm:col-span-2">
                          <span className="mb-2 block text-sm text-white/60">Address</span>
                          <textarea
                            value={onboardingForm.address}
                            onChange={(event) =>
                              setOnboardingForm((current) => ({
                                ...current,
                                address: event.target.value
                              }))
                            }
                            className="min-h-[96px] w-full rounded-xl border border-white/10 bg-[#111] px-4 py-3 outline-none"
                            placeholder="Flat 101, Test Residency, Hyderabad"
                          />
                        </label>

                        <label className="block sm:col-span-2">
                          <span className="mb-2 block text-sm text-white/60">
                            Optional KYC JSON payload
                          </span>
                          <textarea
                            value={onboardingForm.kycPayload}
                            onChange={(event) =>
                              setOnboardingForm((current) => ({
                                ...current,
                                kycPayload: event.target.value
                              }))
                            }
                            className="min-h-[120px] w-full rounded-xl border border-white/10 bg-[#111] px-4 py-3 font-mono text-sm outline-none"
                            placeholder='{"panNumber":"ABCDE1234F"}'
                          />
                          <p className="mt-2 text-xs text-white/45">
                            Use the current wrapper contract fields here if KYC update is needed.
                          </p>
                        </label>
                      </div>
                    </div>
                  ) : null}

                  {setupError ? (
                    <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-200">
                      {setupError}
                    </div>
                  ) : null}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-white/45">Merchant ID</p>
                    <p className="mt-1 text-sm font-medium text-white">{sessionMerchantId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/45">Unique ID</p>
                    <p className="mt-1 break-all text-sm font-medium text-white">
                      {uniqueId || "Missing uniqueId"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-white/45">Customer mapped ID</p>
                    <p className="mt-1 text-sm font-medium text-white">
                      {customerMappedId || "Will be available after user creation"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-white/45">Selected product</p>
                    <p className="mt-1 text-sm font-medium text-white">
                      {selectedAugmontProduct.name}
                    </p>
                  </div>
                </div>

                {onboardingReady ? (
                  <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-4">
                    <p className="text-sm font-semibold text-yellow-200">
                      Buy order create is now available
                    </p>
                    <p className="mt-2 text-xs text-white/60">
                      The app login is done, the Augmont user is ready, and this step now calls `orders/buy/create` using the stored `uniqueId`. Backend fills provider-managed fields internally.
                    </p>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-2 block text-sm text-white/60">Quantity</span>
                        <input
                          type="number"
                          value={augmontBuyForm.quantity}
                          onChange={(event) =>
                            setAugmontBuyForm((current) => ({
                              ...current,
                              quantity: event.target.value
                            }))
                          }
                          className="w-full rounded-xl border border-white/10 bg-[#111] px-4 py-3 outline-none"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-2 block text-sm text-white/60">Mode of payment</span>
                        <select
                          value={augmontBuyForm.modeOfPayment}
                          onChange={(event) =>
                            setAugmontBuyForm((current) => ({
                              ...current,
                              modeOfPayment: event.target.value
                            }))
                            }
                          className="w-full rounded-xl border border-white/10 bg-[#111] px-4 py-3 outline-none"
                        >
                          {paymentModes.map((mode) => (
                            <option key={mode} value={mode}>
                              {mode}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    {buyError ? (
                      <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-200">
                        {buyError}
                      </div>
                    ) : null}

                    <button
                      onClick={handleCreateAugmontBuyOrder}
                      disabled={buyLoading}
                      className="mt-4 w-full rounded-xl bg-yellow-500 py-3 font-semibold text-black transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {buyLoading ? "Placing Buy Order..." : "Confirm Buy Order"}
                    </button>
                  </div>
                ) : null}

                <button
                  onClick={handleCreateAugmontUser}
                  disabled={setupLoading || buyLoading}
                  className="w-full rounded-xl bg-yellow-500 py-3 font-semibold text-black transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {setupLoading
                    ? "Running Wrapper Onboarding..."
                    : onboardingReady
                      ? "Re-run Wrapper Onboarding"
                      : "Run Wrapper Onboarding"}
                </button>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <p className="text-sm font-semibold text-white">
                  {augmontBuyOrder ? "Buy Order Success" : "Created User Profile"}
                </p>
                <p className="mt-2 text-xs text-white/50">
                  {augmontBuyOrder
                    ? "On success, the UI uses `payload.result.data` from the buy-order create response."
                    : "On success, the UI uses `payload.result.data` from the user-create response and stores the returned identifiers for later Augmont flows."}
                </p>

                {!onboardingReady ? (
                  <div className="mt-6 rounded-xl border border-dashed border-white/10 p-6 text-sm text-white/45">
                    Complete the wrapper onboarding form to see Augmont profile, KYC, and address data here.
                  </div>
                ) : augmontBuyOrder ? (
                  <div className="mt-6 space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl bg-[#111] p-3">
                        <p className="text-xs text-white/45">Bought quantity</p>
                        <p className="mt-1 text-sm font-medium text-white">
                          {augmontBuyOrder.quantity || "NA"}
                        </p>
                      </div>
                      <div className="rounded-xl bg-[#111] p-3">
                        <p className="text-xs text-white/45">Total amount</p>
                        <p className="mt-1 text-sm font-medium text-white">
                          Rs {formatPrice(augmontBuyOrder.totalAmount)}
                        </p>
                      </div>
                      <div className="rounded-xl bg-[#111] p-3">
                        <p className="text-xs text-white/45">Pre-tax amount</p>
                        <p className="mt-1 text-sm font-medium text-white">
                          Rs {formatPrice(augmontBuyOrder.preTaxAmount)}
                        </p>
                      </div>
                      <div className="rounded-xl bg-[#111] p-3">
                        <p className="text-xs text-white/45">Rate</p>
                        <p className="mt-1 text-sm font-medium text-white">
                          Rs {formatPrice(augmontBuyOrder.rate)}
                        </p>
                      </div>
                      <div className="rounded-xl bg-[#111] p-3">
                        <p className="text-xs text-white/45">Transaction ID</p>
                        <p className="mt-1 break-all text-sm font-medium text-white">
                          {augmontBuyOrder.transactionId || "NA"}
                        </p>
                      </div>
                      <div className="rounded-xl bg-[#111] p-3">
                        <p className="text-xs text-white/45">Invoice number</p>
                        <p className="mt-1 text-sm font-medium text-white">
                          {augmontBuyOrder.invoiceNumber || "NA"}
                        </p>
                      </div>
                      <div className="rounded-xl bg-[#111] p-3">
                        <p className="text-xs text-white/45">Reference type</p>
                        <p className="mt-1 text-sm font-medium text-white">
                          {augmontBuyOrder.referenceType || "NA"}
                        </p>
                      </div>
                      <div className="rounded-xl bg-[#111] p-3">
                        <p className="text-xs text-white/45">Reference ID</p>
                        <p className="mt-1 break-all text-sm font-medium text-white">
                          {augmontBuyOrder.referenceId || "NA"}
                        </p>
                      </div>
                      <div className="rounded-xl bg-[#111] p-3">
                        <p className="text-xs text-white/45">Merchant transaction ID</p>
                        <p className="mt-1 break-all text-sm font-medium text-white">
                          {augmontBuyOrder.merchantTransactionId || "NA"}
                        </p>
                      </div>
                      <div className="rounded-xl bg-[#111] p-3">
                        <p className="text-xs text-white/45">Updated gold balance</p>
                        <p className="mt-1 text-sm font-medium text-white">
                          {augmontBuyOrder.goldBalance ?? "NA"}
                        </p>
                      </div>
                      <div className="rounded-xl bg-[#111] p-3">
                        <p className="text-xs text-white/45">Updated silver balance</p>
                        <p className="mt-1 text-sm font-medium text-white">
                          {augmontBuyOrder.silverBalance ?? "NA"}
                        </p>
                      </div>
                      <div className="rounded-xl bg-[#111] p-3">
                        <p className="text-xs text-white/45">Buyer</p>
                        <p className="mt-1 text-sm font-medium text-white">
                          {augmontBuyOrder.userName || "NA"}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
                      <p className="text-sm font-semibold text-cyan-200">Tax Breakdown</p>
                      <p className="mt-2 text-sm text-white/75">
                        Total tax amount: Rs {formatPrice(augmontBuyOrder?.taxes?.totalTaxAmount)}
                      </p>
                      <pre className="mt-3 overflow-auto whitespace-pre-wrap break-words text-xs text-white/60">
                        {JSON.stringify(augmontBuyOrder?.taxes?.taxSplit || {}, null, 2)}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl bg-[#111] p-3">
                        <p className="text-xs text-white/45">User name</p>
                        <p className="mt-1 text-sm font-medium text-white">
                          {onboardingProfile?.userName || "NA"}
                        </p>
                      </div>
                      <div className="rounded-xl bg-[#111] p-3">
                        <p className="text-xs text-white/45">Unique ID</p>
                        <p className="mt-1 break-all text-sm font-medium text-white">
                          {onboardingProfile?.uniqueId || "NA"}
                        </p>
                      </div>
                      <div className="rounded-xl bg-[#111] p-3">
                        <p className="text-xs text-white/45">Customer mapped ID</p>
                        <p className="mt-1 text-sm font-medium text-white">
                          {onboardingProfile?.customerMappedId || "NA"}
                        </p>
                      </div>
                      <div className="rounded-xl bg-[#111] p-3">
                        <p className="text-xs text-white/45">Mobile number</p>
                        <p className="mt-1 text-sm font-medium text-white">
                          {onboardingProfile?.mobileNumber || "NA"}
                        </p>
                      </div>
                      <div className="rounded-xl bg-[#111] p-3">
                        <p className="text-xs text-white/45">Email</p>
                        <p className="mt-1 break-all text-sm font-medium text-white">
                          {onboardingProfile?.userEmail || "NA"}
                        </p>
                      </div>
                      <div className="rounded-xl bg-[#111] p-3">
                        <p className="text-xs text-white/45">KYC status</p>
                        <p className="mt-1 text-sm font-medium text-white">
                          {onboardingProfile?.kycStatus || "NA"}
                        </p>
                      </div>
                      <div className="rounded-xl bg-[#111] p-3">
                        <p className="text-xs text-white/45">State</p>
                        <p className="mt-1 text-sm font-medium text-white">
                          {onboardingProfile?.stateName || onboardingProfile?.userState || "NA"}
                        </p>
                      </div>
                      <div className="rounded-xl bg-[#111] p-3">
                        <p className="text-xs text-white/45">City</p>
                        <p className="mt-1 text-sm font-medium text-white">
                          {onboardingProfile?.cityName || onboardingProfile?.userCity || "NA"}
                        </p>
                      </div>
                      <div className="rounded-xl bg-[#111] p-3">
                        <p className="text-xs text-white/45">State ID</p>
                        <p className="mt-1 text-sm font-medium text-white">
                          {onboardingProfile?.userStateId || "NA"}
                        </p>
                      </div>
                      <div className="rounded-xl bg-[#111] p-3">
                        <p className="text-xs text-white/45">City ID</p>
                        <p className="mt-1 text-sm font-medium text-white">
                          {onboardingProfile?.userCityId || "NA"}
                        </p>
                      </div>
                      <div className="rounded-xl bg-[#111] p-3">
                        <p className="text-xs text-white/45">Pincode</p>
                        <p className="mt-1 text-sm font-medium text-white">
                          {onboardingProfile?.userPincode || "NA"}
                        </p>
                      </div>
                      <div className="rounded-xl bg-[#111] p-3">
                        <p className="text-xs text-white/45">Created at</p>
                        <p className="mt-1 text-sm font-medium text-white">
                          {onboardingProfile?.createdAt || "NA"}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
                      <p className="text-sm font-semibold text-cyan-200">What is done</p>
                      <p className="mt-2 text-sm text-white/75">
                        The frontend has created the Augmont user, fetched the linked profile, created the bank record, created an address, fetched saved addresses, and loaded the KYC profile using wrapper APIs only.
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-[#111] p-4">
                      <p className="text-sm font-semibold text-white">Saved addresses</p>
                      <div className="mt-3 space-y-2 text-sm text-white/70">
                        {augmontAddresses.length === 0 ? (
                          <p>No saved addresses returned yet.</p>
                        ) : (
                          augmontAddresses.map((address, index) => (
                            <div key={`${address?.id || address?.addressId || index}`} className="rounded-lg border border-white/10 p-3">
                              <p>{address?.address || address?.fullAddress || "Saved address"}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-[#111] p-4">
                      <p className="text-sm font-semibold text-white">KYC profile</p>
                      <pre className="mt-3 overflow-auto whitespace-pre-wrap break-words text-xs text-white/60">
                        {JSON.stringify(augmontKycProfile || {}, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <Footer />
    </div>
  );
}
