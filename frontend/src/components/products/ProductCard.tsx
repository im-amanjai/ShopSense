import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";
import type { ProductResponse, RecommendationResponse, SemanticSearchResponse } from "../../types/api";
import { formatCurrency } from "../../utils/format";
import RatingStars from "../ui/RatingStars";

type ProductLike = ProductResponse | RecommendationResponse | SemanticSearchResponse;

interface ProductCardProps {
  product: ProductLike;
  compact?: boolean;
}

function getProductId(product: ProductLike) {
  return "id" in product ? product.id : product.productId;
}

export default function ProductCard({ product, compact = false }: ProductCardProps) {
  const productId = getProductId(product);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const addItem = useCartStore((state) => state.addItem);

  const handleAdd = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to add items to your cart.");
      return;
    }

    try {
      await addItem(productId, 1);
      toast.success("Added to cart");
    } catch {
      toast.error("Unable to add item to cart");
    }
  };

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
      <Link to={`/products/${productId}`} className="block bg-slate-50 p-4 dark:bg-slate-950">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className={`${compact ? "h-36" : "h-48"} w-full object-contain`}
            loading="lazy"
          />
        ) : (
          <div className={`${compact ? "h-36" : "h-48"} flex w-full items-center justify-center rounded-md bg-slate-100 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-400`}>
            No image
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {product.brand || product.categoryName || "ShopSense"}
          </p>
          <Link to={`/products/${productId}`} className="mt-1 block">
            <h3 className="line-clamp-2 text-base font-semibold text-slate-950 transition group-hover:text-blue-700 dark:text-white dark:group-hover:text-blue-300">
              {product.name}
            </h3>
          </Link>
          <div className="mt-2">
            <RatingStars value={product.averageRating ?? 0} />
          </div>
          {"reason" in product && product.reason && (
            <p className="mt-3 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
              {product.reason}
            </p>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
            {formatCurrency(product.price)}
          </p>
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}
