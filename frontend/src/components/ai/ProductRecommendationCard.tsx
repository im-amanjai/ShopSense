import { Link } from "react-router-dom";
import type { ShoppingAssistantProductResponse } from "../../types/api";
import { formatCurrency } from "../../utils/format";
import RatingStars from "../ui/RatingStars";

interface ProductRecommendationCardProps {
  product: ShoppingAssistantProductResponse;
}

export default function ProductRecommendationCard({ product }: ProductRecommendationCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <h3 className="line-clamp-2 text-sm font-semibold text-slate-950 dark:text-white">
        {product.name}
      </h3>
      <p className="mt-1 text-xs text-slate-500">{product.brand || "Recommended product"}</p>
      <p className="mt-2 font-semibold text-blue-700 dark:text-blue-300">
        {formatCurrency(product.price)}
      </p>
      <div className="mt-2">
        <RatingStars value={product.averageRating ?? 0} />
      </div>
      {product.reason && (
        <p className="mt-2 line-clamp-2 text-xs text-slate-600 dark:text-slate-400">{product.reason}</p>
      )}
      <Link
        to={`/products/${product.productId}`}
        className="mt-3 block rounded-md bg-blue-600 px-3 py-2 text-center text-xs font-semibold text-white transition hover:bg-blue-700"
      >
        View Product
      </Link>
    </div>
  );
}
