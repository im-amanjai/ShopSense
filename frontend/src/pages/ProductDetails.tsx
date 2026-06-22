import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { MessageSquare, ShoppingCart } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import toast from "react-hot-toast";
import MainLayout from "../layouts/MainLayout";
import ProductCard from "../components/products/ProductCard";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";
import RatingStars from "../components/ui/RatingStars";
import { getApiErrorMessage } from "../api/client";
import { productApi, reviewApi } from "../api/services";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";
import type { ProductResponse, RecommendationResponse, ReviewResponse } from "../types/api";
import { formatCurrency, formatDate } from "../utils/format";

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().max(2000, "Comment cannot exceed 2000 characters").optional(),
});

type ReviewForm = z.infer<typeof reviewSchema>;

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const productId = Number(id);
  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [similar, setSimilar] = useState<RecommendationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const addItem = useCartStore((state) => state.addItem);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReviewForm>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 5, comment: "" },
  });

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      if (!Number.isFinite(productId)) {
        setError("Invalid product id");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const [productData, reviewData, similarData] = await Promise.all([
          productApi.findById(productId),
          reviewApi.findApproved(productId),
          productApi.similar(productId),
        ]);

        if (!cancelled) {
          setProduct(productData);
          setReviews(reviewData);
          setSimilar(similarData.slice(0, 4));
        }
      } catch (loadError) {
        if (!cancelled) setError(getApiErrorMessage(loadError));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadProduct();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  const handleAdd = async () => {
    if (!product) return;
    if (!isAuthenticated) {
      toast.error("Please log in to add items to your cart.");
      navigate("/login");
      return;
    }

    try {
      await addItem(product.id, 1);
      toast.success("Added to cart");
    } catch {
      toast.error("Unable to add item");
    }
  };

  const onReviewSubmit = async (values: ReviewForm) => {
    if (!isAuthenticated) {
      toast.error("Please log in to leave a review.");
      navigate("/login");
      return;
    }

    try {
      await reviewApi.create(productId, values);
      toast.success("Review submitted for moderation");
      reset({ rating: 5, comment: "" });
      const nextReviews = await reviewApi.findApproved(productId);
      setReviews(nextReviews);
    } catch (submitError) {
      toast.error(getApiErrorMessage(submitError));
    }
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {isLoading && <LoadingState label="Loading product" />}
        {error && !isLoading && <ErrorState message={error} />}
        {!isLoading && !error && product && (
          <>
            <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="h-[420px] w-full object-contain" />
                ) : (
                  <div className="flex h-[420px] items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                    No image available
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
                  {product.categoryName || "Product"}
                </p>
                <h1 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white sm:text-5xl">
                  {product.name}
                </h1>
                <div className="mt-4">
                  <RatingStars value={product.averageRating ?? 0} />
                </div>
                <p className="mt-5 text-3xl font-bold text-blue-700 dark:text-blue-300">
                  {formatCurrency(product.price)}
                </p>
                {product.brand && (
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">Brand: {product.brand}</p>
                )}
                <p className="mt-6 leading-7 text-slate-700 dark:text-slate-300">
                  {product.description || "No description has been added for this product."}
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleAdd}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
                  >
                    <ShoppingCart className="h-5 w-5" aria-hidden="true" />
                    Add to Cart
                  </button>
                  <Link
                    to="/checkout"
                    onClick={(event) => {
                      if (!isAuthenticated) {
                        event.preventDefault();
                        navigate("/login");
                      }
                    }}
                    className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-800 transition hover:border-blue-500 hover:text-blue-700 dark:border-slate-700 dark:text-slate-200 dark:hover:text-blue-300"
                  >
                    Checkout
                  </Link>
                </div>
              </div>
            </section>

            <section className="mt-12 grid gap-8 lg:grid-cols-[1fr_380px]">
              <div>
                <h2 className="text-2xl font-bold text-slate-950 dark:text-white">Reviews</h2>
                <div className="mt-5 space-y-4">
                  {reviews.length === 0 ? (
                    <EmptyState icon={MessageSquare} title="No reviews yet" message="Submitted demo reviews appear here immediately." />
                  ) : (
                    reviews.map((review) => (
                      <article key={review.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <h3 className="font-semibold text-slate-950 dark:text-white">{review.userName}</h3>
                            <p className="text-xs text-slate-500">{formatDate(review.createdAt)}</p>
                          </div>
                          <RatingStars value={review.rating} />
                        </div>
                        {review.comment && <p className="mt-3 text-slate-700 dark:text-slate-300">{review.comment}</p>}
                      </article>
                    ))
                  )}
                </div>
              </div>

              <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Write a Review</h2>
                <form onSubmit={handleSubmit(onReviewSubmit)} className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="rating" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Rating
                    </label>
                    <select
                      id="rating"
                      {...register("rating", { valueAsNumber: true })}
                      className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    >
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <option key={rating} value={rating}>
                          {rating} stars
                        </option>
                      ))}
                    </select>
                    {errors.rating && <p className="mt-1 text-sm text-red-600">{errors.rating.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="comment" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Comment
                    </label>
                    <textarea
                      id="comment"
                      rows={4}
                      {...register("comment")}
                      className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                    {errors.comment && <p className="mt-1 text-sm text-red-600">{errors.comment.message}</p>}
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:bg-slate-400"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Review"}
                  </button>
                </form>
              </aside>
            </section>

            {similar.length > 0 && (
              <section className="mt-12">
                <h2 className="text-2xl font-bold text-slate-950 dark:text-white">Similar Products</h2>
                <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {similar.map((item) => (
                    <ProductCard key={item.productId} product={item} compact />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}
