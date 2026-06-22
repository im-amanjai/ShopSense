import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  LineChart,
  MessageSquareText,
  Search,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react";
import MainLayout from "../layouts/MainLayout";
import ProductCard from "../components/products/ProductCard";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";
import { productApi, recommendationApi } from "../api/services";
import { getApiErrorMessage } from "../api/client";
import type { ProductResponse, RecommendationResponse } from "../types/api";
import { formatCurrency } from "../utils/format";

export default function Home() {
  const [featured, setFeatured] = useState<ProductResponse[]>([]);
  const [popular, setPopular] = useState<RecommendationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadHome() {
      try {
        const [productPage, popularProducts] = await Promise.all([
          productApi.search({ size: 4 }),
          recommendationApi.popular(),
        ]);

        if (!cancelled) {
          setFeatured(productPage.content);
          setPopular(popularProducts.slice(0, 4));
        }
      } catch (loadError) {
        if (!cancelled) setError(getApiErrorMessage(loadError));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadHome();
    return () => {
      cancelled = true;
    };
  }, []);

  const heroProduct = featured[0];
  const secondaryProduct = featured[2] ?? featured[1];

  return (
    <MainLayout>
      <section className="relative overflow-hidden border-b border-slate-200 bg-[radial-gradient(circle_at_18%_12%,rgba(37,99,235,0.16),transparent_34%),radial-gradient(circle_at_90%_8%,rgba(14,165,233,0.18),transparent_30%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] dark:border-slate-800 dark:bg-[radial-gradient(circle_at_18%_12%,rgba(59,130,246,0.20),transparent_34%),radial-gradient(circle_at_88%_10%,rgba(20,184,166,0.16),transparent_30%),linear-gradient(180deg,#020617_0%,#0f172a_100%)]">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:py-20">
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3 py-1 text-sm font-semibold text-blue-700 shadow-sm backdrop-blur dark:border-blue-900/70 dark:bg-slate-950/70 dark:text-blue-200">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              AI-powered shopping workspace
            </span>

            <h1 className="mt-7 max-w-3xl text-5xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-6xl lg:text-7xl">
              Shop smarter with AI-powered product discovery.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              Discover products, compare alternatives, and receive personalized
              recommendations from a polished frontend experience built for fast
              backend integration later.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 py-3 font-semibold text-white shadow-xl shadow-slate-900/15 transition hover:-translate-y-0.5 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
              >
                Start Shopping
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <a
                href="#ai-showcase"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white/80 px-5 py-3 font-semibold text-slate-800 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-blue-400 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-200 dark:hover:border-blue-500 dark:hover:text-blue-200"
              >
                Try AI Assistant
              </a>
            </div>

            <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
              {[
                ["10K+", "Products"],
                ["5K+", "Users"],
                ["95%", "Satisfaction"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-lg border border-slate-200 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/50">
                  <p className="text-2xl font-bold text-slate-950 dark:text-white">{value}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div id="ai-showcase" className="relative min-h-[600px] lg:min-h-[660px]">
            <div className="absolute left-8 top-10 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl dark:bg-blue-500/20" />
            <div className="absolute bottom-12 right-4 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl dark:bg-teal-400/10" />

            <div className="relative mx-auto max-w-[620px]">
              <div className="absolute left-0 top-8 z-20 w-[78%] rounded-lg border border-slate-200 bg-white/95 p-4 shadow-2xl shadow-slate-900/10 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 dark:shadow-black/30 sm:w-[68%]">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
                    <Bot className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-950 dark:text-white">ShopSense AI</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Recommendation ready</p>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="ml-auto max-w-[86%] rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-blue-600/20">
                    Best headphones under ₹5000
                  </div>
                  <div className="rounded-lg bg-slate-100 p-4 dark:bg-slate-900">
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">AI pick</p>
                    <div className="mt-3 flex gap-3">
                      {heroProduct?.imageUrl && (
                        <img src={heroProduct.imageUrl} alt="" className="h-16 w-16 rounded-lg bg-white object-contain p-1 dark:bg-slate-950" />
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-950 dark:text-white">{heroProduct?.name ?? "Sony WH-CH720N"}</p>
                        <div className="mt-1 flex items-center gap-2 text-sm">
                          <span className="inline-flex items-center gap-1 text-amber-500">
                            <Star className="h-4 w-4 fill-current" aria-hidden="true" />
                            {heroProduct?.averageRating?.toFixed(1) ?? "4.5"}
                          </span>
                          <span className="font-bold text-blue-700 dark:text-blue-300">
                            {formatCurrency(heroProduct?.price ?? 4999)}
                          </span>
                        </div>
                        <Link to={`/products/${heroProduct?.id ?? 1}`} className="mt-3 inline-flex rounded-md bg-slate-950 px-3 py-2 text-xs font-semibold text-white dark:bg-blue-600">
                          View Product
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute right-0 top-44 z-10 w-[72%] rounded-lg border border-slate-200 bg-white p-4 shadow-2xl shadow-blue-950/10 transition hover:-translate-y-1 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/30 sm:w-[58%]">
                <div className="relative overflow-hidden rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
                  <span className="absolute right-3 top-3 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
                    AI Recommended
                  </span>
                  {secondaryProduct?.imageUrl && (
                    <img src={secondaryProduct.imageUrl} alt={secondaryProduct.name} className="mx-auto h-44 w-full object-contain" />
                  )}
                </div>
                <h2 className="mt-4 line-clamp-2 text-lg font-bold text-slate-950 dark:text-white">
                  {secondaryProduct?.name ?? "FitPulse AMOLED Smart Watch"}
                </h2>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xl font-bold text-blue-700 dark:text-blue-300">{formatCurrency(secondaryProduct?.price ?? 2999)}</p>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-amber-500">
                    <Star className="h-4 w-4 fill-current" aria-hidden="true" />
                    {secondaryProduct?.averageRating?.toFixed(1) ?? "4.5"}
                  </span>
                </div>
              </div>

              <div className="absolute left-4 top-[460px] z-30 grid w-[90%] grid-cols-2 gap-3 sm:left-10 sm:w-[72%]">
                {[
                  { icon: Search, title: "Semantic Search", tone: "bg-blue-600" },
                  { icon: Sparkles, title: "Personalized Picks", tone: "bg-violet-600" },
                  { icon: LineChart, title: "Smart Comparison", tone: "bg-slate-900 dark:bg-slate-700" },
                  { icon: TrendingUp, title: "Price Tracking", tone: "bg-emerald-600" },
                ].map((feature) => (
                  <div key={feature.title} className="rounded-lg border border-slate-200 bg-white/90 p-3 shadow-xl shadow-slate-900/10 backdrop-blur transition hover:-translate-y-1 dark:border-slate-800 dark:bg-slate-950/90">
                    <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-md text-white ${feature.tone}`}>
                      <feature.icon className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{feature.title}</p>
                  </div>
                ))}
              </div>

              <div className="absolute right-8 top-4 z-30 hidden rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 shadow-lg backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 dark:text-slate-200 sm:inline-flex">
                <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" aria-hidden="true" />
                3 products compared
              </div>

              <div className="absolute bottom-0 right-10 z-30 hidden rounded-lg border border-slate-200 bg-white/90 p-3 shadow-xl backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 sm:block">
                <div className="flex items-center gap-2">
                  <MessageSquareText className="h-4 w-4 text-blue-600 dark:text-blue-300" aria-hidden="true" />
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">Answer in 1.2s</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white py-12 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-950 dark:text-white">Featured Products</h2>
              <p className="mt-1 text-slate-600 dark:text-slate-400">Curated mock products for the storefront demo.</p>
            </div>
            <Link to="/products" className="text-sm font-semibold text-blue-700 dark:text-blue-300">
              View all
            </Link>
          </div>

          {isLoading && <LoadingState label="Loading storefront" />}
          {error && !isLoading && <ErrorState message={error} />}
          {!isLoading && !error && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} compact />
              ))}
            </div>
          )}
        </div>
      </section>

      {popular.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <h2 className="text-2xl font-bold text-slate-950 dark:text-white">Popular Recommendations</h2>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            These use the same typed service layer an API can connect to later.
          </p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {popular.map((product) => (
              <ProductCard key={product.productId} product={product} compact />
            ))}
          </div>
        </section>
      )}
    </MainLayout>
  );
}
