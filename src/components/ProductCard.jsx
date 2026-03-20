import { Coins } from "lucide-react";
import { motion } from "framer-motion";

const formatPrice = (price) =>
  Number(price || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

function ProductCard({ product, onClick }) {
  const isActive = String(product?.status || "").toLowerCase() === "active";

  return (
    <motion.button
      type="button"
      whileHover={{ y: -6 }}
      onClick={() => onClick(product?.sku)}
      className="overflow-hidden rounded-2xl border border-gray-800 bg-[#111] text-left"
    >
      {product?.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product?.name || "Product"}
          className="h-48 w-full object-cover"
        />
      ) : (
        <div className="flex h-48 w-full items-center justify-center bg-gray-800">
          <Coins size={40} />
        </div>
      )}

      <div className="p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold">
            {product?.name || "Untitled Product"}
          </h3>

          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              isActive
                ? "bg-green-500/20 text-green-300"
                : "bg-red-500/20 text-red-300"
            }`}
          >
            {isActive ? "Active" : "Inactive"}
          </span>
        </div>

        <p className="mb-4 text-xl text-yellow-400">
          Rs. {formatPrice(product?.basePrice)}
        </p>

        <div className="mb-4 grid grid-cols-2 gap-2 text-sm text-gray-300">
          <p>Metal: {product?.metalType || "NA"}</p>
          <p>Purity: {product?.purity || "NA"}</p>
          <p>Weight: {product?.productWeight || "NA"}g</p>
          <p>Redeem: {product?.redeemWeight || "NA"}g</p>
        </div>

        {product?.description ? (
          <p className="mb-4 line-clamp-4 text-sm text-gray-400">
            {product.description}
          </p>
        ) : (
          <p className="mb-4 text-sm text-gray-500">
            Product description is not available.
          </p>
        )}

        <div className="flex items-center justify-end gap-3 text-sm text-gray-400">
          <span>View Details</span>
        </div>
      </div>
    </motion.button>
  );
}

export default ProductCard;
