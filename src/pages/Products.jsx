import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import SafeGoldProductCard from "../components/SafeGoldProductCard";
import { fetchAugmontProducts, loginAugmont } from "../api/augmontApi";
import { fetchSafeGoldProducts } from "../api/safeGoldApi";

const initialPagination = {
  hasMore: false,
  count: 0,
  per_page: 10,
  current_page: 1
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
  const [augmontSession, setAugmontSession] = useState(null);
  const [augmontLoading, setAugmontLoading] = useState(true);
  const [augmontLoadingMore, setAugmontLoadingMore] = useState(false);
  const [augmontError, setAugmontError] = useState("");
  const [augmontErrorMeta, setAugmontErrorMeta] = useState("");

  const [safeGoldProducts, setSafeGoldProducts] = useState([]);
  const [safeGoldLoading, setSafeGoldLoading] = useState(true);
  const [safeGoldError, setSafeGoldError] = useState("");

  const loadAugmontProducts = async ({ page = 1, append = false } = {}) => {
    if (append) {
      setAugmontLoadingMore(true);
    } else {
      setAugmontLoading(true);
      setAugmontError("");
      setAugmontErrorMeta("");
    }

    let session = augmontSession;

    if (!session?.token || !session?.merchantId || !append) {
      const loginResponse = await loginAugmont({
        force: !append
      });

      if (!loginResponse?.ok) {
        setAugmontError(
          loginResponse?.message || "Failed to log in to Augmont"
        );
        setAugmontLoading(false);
        setAugmontLoadingMore(false);
        return;
      }

      session = {
        token: loginResponse.token,
        merchantId: loginResponse.merchantId
      };
      setAugmontSession(session);
    }

    const response = await fetchAugmontProducts(
      page,
      10,
      session.token,
      session.merchantId
    );

    if (!response?.ok) {
      setAugmontError(response?.message || "Failed to fetch Augmont products");
      setAugmontErrorMeta(response?.providerUrl || "");
      if (!append) {
        setAugmontProducts([]);
      }
      setAugmontLoading(false);
      setAugmontLoadingMore(false);
      return;
    }

    setAugmontProducts((current) =>
      append ? [...current, ...response.products] : response.products
    );
    setAugmontPagination(response.pagination);
    setAugmontLoading(false);
    setAugmontLoadingMore(false);
  };

  const loadSafeGoldProducts = async () => {
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
  };

  useEffect(() => {
    loadAugmontProducts();
    loadSafeGoldProducts();
  }, []);

  const handleProductClick = (sku) => {
    if (!sku) return;
    navigate(`/products?sku=${encodeURIComponent(sku)}`);
  };

  const handleBuyProduct = (source, product) => {
    if (!product) return;

    const selectedProduct = {
      source,
      id:
        source === "augmont"
          ? product?.sku || product?.id || ""
          : product?.skuNumber || product?.id || "",
      name: product?.name || product?.title || "Gold Product",
      price: Number(product?.basePrice ?? product?.price ?? 0),
      image: product?.imageUrl || product?.image || "",
      sku: product?.sku || product?.skuNumber || "",
      description: product?.description || "",
      metal: product?.metalType || product?.metal || "",
      purity: product?.purity || "",
      weight: product?.productWeight ?? product?.weight ?? null,
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

      <Footer />
    </div>
  );
}
