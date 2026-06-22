import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import MainLayout from "../layouts/MainLayout";
import ProductCard from "../components/products/ProductCard";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";
import { categoryApi, productApi } from "../api/services";
import { getApiErrorMessage } from "../api/client";
import type { CategoryResponse, ProductResponse } from "../types/api";

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState(searchParams.get("query") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");

  const activeQuery = searchParams.get("query") || undefined;
  const activeCategory = searchParams.get("category") || undefined;

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      setIsLoading(true);
      setError(null);
      try {
        const [productPage, categoryList] = await Promise.all([
          productApi.search({ query: activeQuery, category: activeCategory, size: 24 }),
          categoryApi.findAll(),
        ]);

        if (!cancelled) {
          setProducts(productPage.content);
          setCategories(categoryList);
        }
      } catch (loadError) {
        if (!cancelled) setError(getApiErrorMessage(loadError));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadProducts();
    return () => {
      cancelled = true;
    };
  }, [activeCategory, activeQuery]);

  const heading = useMemo(() => {
    if (activeQuery) return `Search results for "${activeQuery}"`;
    if (activeCategory) return activeCategory;
    return "Products";
  }, [activeCategory, activeQuery]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = new URLSearchParams();
    if (query.trim()) next.set("query", query.trim());
    if (category) next.set("category", category);
    setSearchParams(next);
  };

  const handleCategory = (value: string) => {
    setCategory(value);
    const next = new URLSearchParams(searchParams);
    if (value) next.set("category", value);
    else next.delete("category");
    setSearchParams(next);
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
              Catalog
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white sm:text-4xl">
              {heading}
            </h1>
            <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-400">
              Products are loaded from local mock data using API-ready types and filters.
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="product-search" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Search
                </label>
                <div className="relative mt-2">
                  <Search className="pointer-events-none absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                  <input
                    id="product-search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Headphones, shoes..."
                    className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="category" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Category
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  <option value="">All categories</option>
                  {categories.map((item) => (
                    <option key={item.id} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Apply Filters
              </button>
            </form>

            <div className="mt-6 border-t border-slate-200 pt-5 dark:border-slate-800">
              <h2 className="text-sm font-semibold text-slate-950 dark:text-white">Browse</h2>
              <div className="mt-3 grid gap-2">
                <button
                  type="button"
                  onClick={() => handleCategory("")}
                  className="rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  All products
                </button>
                {categories.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleCategory(item.name)}
                    className="rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <section>
            {isLoading && <LoadingState label="Loading products" />}
            {error && !isLoading && (
              <ErrorState message={error} actionLabel="Try again" onAction={() => setSearchParams(searchParams)} />
            )}
            {!isLoading && !error && products.length === 0 && (
              <EmptyState
                icon={Search}
                title="No products found"
                message="Try a broader search or clear the selected category."
              />
            )}
            {!isLoading && !error && products.length > 0 && (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
