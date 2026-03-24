import { useState } from "react";
import { Coins, PackageCheck } from "lucide-react";

const formatPrice = (price) =>
  Number(price || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

function SafeGoldProductCard({ product, onClick, onBuy }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleOpen = () => {
    onClick(product?.skuNumber);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleOpen();
        }
      }}
      className="overflow-hidden rounded-2xl border border-gray-800 bg-[#111] text-left transition hover:-translate-y-1.5"
    >
      {product?.image ? (
        <div className="flex h-48 w-full items-center justify-center bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.08),_transparent_70%)] p-5">
          <img
            src={product.image}
            alt={product?.title || "SafeGold product"}
            className="h-full w-full object-contain"
          />
        </div>
      ) : (
        <div className="flex h-48 w-full items-center justify-center bg-gray-800">
          <Coins size={40} />
        </div>
      )}

      <div className="p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-lg font-bold">
            {product?.title || "SafeGold Product"}
          </h3>

          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              product?.available
                ? "bg-green-500/20 text-green-300"
                : "bg-red-500/20 text-red-300"
            }`}
          >
            {product?.available ? "In Stock" : "Unavailable"}
          </span>
        </div>

        <p className="mb-4 text-xl text-yellow-400">
          Rs. {formatPrice(product?.price)}
        </p>

        {isExpanded && (
          <>
            <div className="mb-4 grid grid-cols-2 gap-2 text-sm text-gray-300">
              <p>Weight: {product?.weight ?? "NA"}g</p>
              <p>Metal: {product?.metal || "NA"}</p>
              <p>Stamp: {product?.purity || "NA"}</p>
              <p>Brand: {product?.brand || "NA"}</p>
              <p>Dispatch: {product?.dispatchTime || "NA"}</p>
              <p>SKU: {product?.skuNumber || "NA"}</p>
            </div>

            {product?.highlights?.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-yellow-400">
                  Highlights
                </p>
                <div className="space-y-1 text-sm text-gray-400">
                  {product.highlights.slice(0, 3).map((highlight) => (
                    <p key={highlight} className="line-clamp-1">
                      {highlight}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2 text-sm text-gray-400">
              {product?.certification && (
                <p>Certification: {product.certification}</p>
              )}
              {product?.packaging && <p>Packaging: {product.packaging}</p>}
              {product?.dimensions && <p>Dimensions: {product.dimensions}</p>}
              {product?.thickness && <p>Thickness: {product.thickness}</p>}
              {product?.refundPolicy && (
                <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                  <div className="mb-1 flex items-center gap-2 text-yellow-400">
                    <PackageCheck size={14} />
                    <span className="text-xs font-semibold uppercase tracking-wide">
                      Refund Policy
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{product.refundPolicy}</p>
                </div>
              )}
            </div>
          </>
        )}

        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onBuy?.(product);
            }}
            className="rounded-xl bg-yellow-500 px-4 py-2 text-sm font-semibold text-black transition hover:scale-105"
          >
            Buy Now
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="flex w-full items-center justify-end gap-3 text-sm text-gray-400 transition hover:text-yellow-400"
          >
            <span>{isExpanded ? "Show Less" : "View Details"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default SafeGoldProductCard;
