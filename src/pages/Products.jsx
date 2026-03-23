import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import SafeGoldProductCard from "../components/SafeGoldProductCard";
import { getUserProfile, setUserProfile } from "../api/authApi";
import {
  createAugmontBuyOrder,
  fetchAugmontProducts,
  getAugmontSession,
  getAugmontUser,
  normalizeAugmontUserProfile,
  setAugmontUser
} from "../api/augmontApi";
import {
  createGoldUser,
  fetchCities,
  fetchStates
} from "../api/goldUserRegistrationApi";
import { fetchSafeGoldProducts } from "../api/safeGoldApi";

const initialPagination = {
  hasMore: false,
  count: 0,
  per_page: 10,
  current_page: 1
};

const paymentModes = ["UPI", "NET_BANKING", "CARD"];

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
  const [augmontStates, setAugmontStates] = useState([]);
  const [augmontCities, setAugmontCities] = useState([]);
  const [selectedStateId, setSelectedStateId] = useState("");
  const [selectedCityId, setSelectedCityId] = useState("");
  const [statesLoading, setStatesLoading] = useState(false);
  const [citiesLoading, setCitiesLoading] = useState(false);
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
    userState: appProfile?.augmontState || "",
    userCity: appProfile?.augmontCity || "",
    kycStatus: appProfile?.augmontKycStatus || "",
    createdAt: appProfile?.augmontCreatedAt || "",
    mobileNumber: appProfile?.mobileNumber || "",
    userEmail: appProfile?.email || "",
    userPincode: appProfile?.pinCode || "",
    userName: appProfile?.fullName || ""
  };
  const onboardingReady = Boolean(uniqueId);

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

  const loadAugmontStates = useCallback(async () => {
    setStatesLoading(true);
    setSetupError("");

    const response = await fetchStates();

    setStatesLoading(false);

    if (!response?.ok) {
      setSetupError(response?.message || "Unable to load states");
      setAugmontStates([]);
      return;
    }

    setAugmontStates(response.states || []);
  }, []);

  const loadAugmontCities = useCallback(async (stateId) => {
    if (!stateId) {
      setAugmontCities([]);
      return;
    }

    setCitiesLoading(true);
    setSetupError("");

    const response = await fetchCities(stateId);

    setCitiesLoading(false);

    if (!response?.ok) {
      setSetupError(response?.message || "Unable to load cities");
      setAugmontCities([]);
      return;
    }

    setAugmontCities(response.cities || []);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadAugmontProducts();
      loadSafeGoldProducts();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadAugmontProducts, loadSafeGoldProducts]);

  useEffect(() => {
    if (!selectedAugmontProduct) return;

    const timeoutId = window.setTimeout(async () => {
      await loadAugmontStates();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadAugmontStates, selectedAugmontProduct]);

  useEffect(() => {
    if (!selectedStateId) return;

    const timeoutId = window.setTimeout(async () => {
      await loadAugmontCities(selectedStateId);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadAugmontCities, selectedStateId]);

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
      setResolvedAugmontUniqueId(nextUniqueId);
      setSelectedStateId("");
      setSelectedCityId("");
      setAugmontCities([]);
      setAugmontStates([]);
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

    if (!sessionMerchantId) {
      setSetupError("Merchant ID is missing. Configure it before creating the Augmont user.");
      return;
    }

    if (!selectedStateId) {
      setSetupError("Select a state to continue with Augmont onboarding.");
      return;
    }

    if (!selectedCityId) {
      setSetupError("Select a city to continue with Augmont onboarding.");
      return;
    }

    if (!appProfile?.mobileNumber || !appProfile?.email || !appProfile?.fullName || !appProfile?.pinCode) {
      setSetupError("App profile is missing full name, email, mobile number, or pincode. Complete the app profile first.");
      return;
    }

    setSetupLoading(true);
    setSetupError("");
    setCreatedAugmontUser(null);

    const nextUniqueId = appProfile?.uniqueId || `AUG-${Date.now()}`;
    const response = await createGoldUser({
      mobileNumber: appProfile.mobileNumber,
      emailId: appProfile.email,
      uniqueId: nextUniqueId,
      userName: appProfile.fullName,
      cityId: selectedCityId,
      stateId: selectedStateId,
      userPincode: appProfile.pinCode
    });

    setSetupLoading(false);

    if (!response?.ok) {
      setSetupError(response?.message || "Unable to create Augmont user");
      return;
    }

    const profile = normalizeAugmontUserProfile(response.data, nextUniqueId);
    const persistedProfile = {
      userName: profile.userName || appProfile?.fullName || "",
      uniqueId: String(profile.uniqueId || nextUniqueId),
      customerMappedId: String(profile.customerMappedId || ""),
      mobileNumber: profile.mobileNumber || appProfile?.mobileNumber || "",
      userEmail: profile.userEmail || appProfile?.email || "",
      userStateId: String(profile.userStateId || selectedStateId),
      userCityId: String(profile.userCityId || selectedCityId),
      userPincode: profile.userPincode || appProfile?.pinCode || "",
      kycStatus: profile.kycStatus || "",
      userState:
        profile.userState ||
        augmontStates.find((item) => item.id === selectedStateId)?.name ||
        "",
      userCity:
        profile.userCity ||
        augmontCities.find((item) => item.id === selectedCityId)?.name ||
        "",
      createdAt: profile.createdAt || "",
      userBankId: profile.userBankId || "",
      userAddressId: profile.userAddressId || ""
    };

    setCreatedAugmontUser(persistedProfile);
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
      augmontState: persistedProfile.userState,
      augmontCity: persistedProfile.userCity,
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
                  Complete the master data and user creation flow first. Once the Augmont user is ready, this same modal unlocks the backend-driven buy order step using the stored `uniqueId`.
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedAugmontProduct(null);
                  setCreatedAugmontUser(null);
                  setAugmontBuyOrder(null);
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
                    {"master/states -> master/cities -> users/create"}
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
                      <div className="rounded-xl border border-white/10 bg-[#111] p-4 text-sm text-white/70">
                        <p className="font-medium text-white">Step 1: Fetch states</p>
                        <p className="mt-2 text-xs text-white/60">
                          The state dropdown uses `payload.result.data` from `master/states`.
                        </p>
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <p className="text-xs text-white/50">
                            {statesLoading
                              ? "Loading states..."
                              : augmontStates.length > 0
                                ? `${augmontStates.length} states loaded`
                                : "No states loaded yet"}
                          </p>
                          <button
                            type="button"
                            onClick={loadAugmontStates}
                            disabled={statesLoading}
                            className="rounded-lg border border-white/10 px-3 py-2 text-xs text-white/75 transition hover:border-cyan-400/30 hover:text-white disabled:opacity-50"
                          >
                            {statesLoading ? "Loading..." : "Retry States"}
                          </button>
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-2 block text-sm text-white/60">Step 2: Select state</span>
                        <select
                          value={selectedStateId}
                          onChange={(event) => {
                            setSelectedStateId(event.target.value);
                            setSelectedCityId("");
                            setAugmontCities([]);
                          }}
                          className="w-full rounded-xl border border-white/10 bg-[#111] px-4 py-3 outline-none"
                          disabled={statesLoading}
                        >
                          <option value="">Select state</option>
                          {augmontStates.map((state) => (
                            <option key={state.id} value={state.id}>
                              {state.name}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="block">
                        <span className="mb-2 block text-sm text-white/60">Step 3: Select city</span>
                        <select
                          value={selectedCityId}
                          onChange={(event) => setSelectedCityId(event.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-[#111] px-4 py-3 outline-none"
                          disabled={!selectedStateId || citiesLoading}
                        >
                          <option value="">Select city</option>
                          {augmontCities.map((city) => (
                            <option key={city.id} value={city.id}>
                              {city.name}
                            </option>
                          ))}
                        </select>
                      </label>

                      <div className="sm:col-span-2 rounded-xl border border-white/10 bg-[#111] p-4 text-sm text-white/70">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-medium text-white">City master data</p>
                            <p className="mt-2 text-xs text-white/60">
                              Cities are requested only after state selection, and the city selection resets whenever the state changes.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => loadAugmontCities(selectedStateId)}
                            disabled={!selectedStateId || citiesLoading}
                            className="rounded-lg border border-white/10 px-3 py-2 text-xs text-white/75 transition hover:border-cyan-400/30 hover:text-white disabled:opacity-50"
                          >
                            {citiesLoading ? "Loading..." : "Retry Cities"}
                          </button>
                        </div>
                        <p className="mt-3 text-xs text-white/50">
                          {!selectedStateId
                            ? "Select a state first to enable the city dropdown."
                            : augmontCities.length > 0
                              ? `${augmontCities.length} cities loaded`
                              : "No cities returned yet for the selected state."}
                        </p>
                      </div>
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
                  disabled={onboardingReady || setupLoading || statesLoading || citiesLoading || buyLoading}
                  className="w-full rounded-xl bg-yellow-500 py-3 font-semibold text-black transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {setupLoading
                    ? "Creating Augmont User..."
                    : onboardingReady
                      ? "Augmont User Ready"
                      : "Create Augmont User"}
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
                    Complete the state, city, and user creation steps to see the Augmont onboarding response here.
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
                          {onboardingProfile?.userState || "NA"}
                        </p>
                      </div>
                      <div className="rounded-xl bg-[#111] p-3">
                        <p className="text-xs text-white/45">City</p>
                        <p className="mt-1 text-sm font-medium text-white">
                          {onboardingProfile?.userCity || "NA"}
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
                        The frontend has fetched states, fetched cities for the selected state, created the Augmont user through the backend wrapper, and stored the returned `uniqueId`, `customerMappedId`, and city/state details for later provider APIs.
                      </p>
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
