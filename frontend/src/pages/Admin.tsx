import { useEffect, useMemo, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import MainLayout from "../layouts/MainLayout";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";
import { adminApi, categoryApi, productApi } from "../api/services";
import { getApiErrorMessage } from "../api/client";
import type { CategoryResponse, InventoryResponse, ProductRequest, ProductResponse, ReviewResponse } from "../types/api";
import { formatCurrency } from "../utils/format";

type Tab = "analytics" | "products" | "inventory" | "reviews";

const emptyForm: ProductRequest = {
  name: "",
  slug: "",
  description: "",
  price: 0,
  brand: "",
  imageUrl: "",
  categoryId: 0,
};

export default function Admin() {
  const [tab, setTab] = useState<Tab>("analytics");
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [inventory, setInventory] = useState<InventoryResponse[]>([]);
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [form, setForm] = useState<ProductRequest>(emptyForm);
  const [initialStock, setInitialStock] = useState(50);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [stockDrafts, setStockDrafts] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAdminData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [productPage, categoryList, inventoryList, reviewList] = await Promise.all([
        productApi.search({ size: 100 }),
        categoryApi.findAll(),
        adminApi.findInventory(),
        adminApi.findPendingReviews(),
      ]);
      setProducts(productPage.content);
      setCategories(categoryList);
      setInventory(inventoryList);
      setReviews(reviewList);
      setStockDrafts(Object.fromEntries(inventoryList.map((item) => [item.productId, item.quantityAvailable])));
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const metrics = useMemo(() => {
    const stock = inventory.reduce((sum, item) => sum + item.quantityAvailable, 0);
    const catalogValue = products.reduce((sum, product) => {
      const item = inventory.find((entry) => entry.productId === product.id);
      return sum + product.price * (item?.quantityAvailable ?? 0);
    }, 0);
    return { stock, catalogValue };
  }, [inventory, products]);

  const analytics = useMemo(() => {
    const inventoryByProductId = new Map(inventory.map((item) => [item.productId, item]));

    const categoryValueMap = products.reduce<Record<string, number>>((acc, product) => {
      const category = product.categoryName || "Uncategorized";
      const quantity = inventoryByProductId.get(product.id)?.quantityAvailable ?? 0;
      acc[category] = (acc[category] ?? 0) + product.price * quantity;
      return acc;
    }, {});

    const categoryValues = Object.entries(categoryValueMap)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);

    const maxCategoryValue = Math.max(...categoryValues.map((item) => item.value), 1);
    const maxStock = Math.max(...inventory.map((item) => item.quantityAvailable), 1);

    const topStock = [...inventory]
      .sort((a, b) => b.quantityAvailable - a.quantityAvailable)
      .slice(0, 6)
      .map((item) => ({
        label: item.productName,
        value: item.quantityAvailable,
        percentage: Math.round((item.quantityAvailable / maxStock) * 100),
      }));

    const sentimentCounts = reviews.reduce<Record<string, number>>((acc, review) => {
      acc[review.sentiment] = (acc[review.sentiment] ?? 0) + 1;
      return acc;
    }, {});

    return {
      categoryValues: categoryValues.map((item) => ({
        ...item,
        percentage: Math.round((item.value / maxCategoryValue) * 100),
      })),
      topStock,
      sentimentCounts,
    };
  }, [inventory, products, reviews]);

  const resetForm = () => {
    setForm(emptyForm);
    setInitialStock(50);
    setEditingId(null);
  };

  const saveProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.categoryId) {
      toast.error("Choose a category");
      return;
    }

    try {
      if (editingId) {
        await adminApi.updateProduct(editingId, form);
        toast.success("Product updated");
      } else {
        const product = await adminApi.createProduct(form);
        await adminApi.updateInventory(product.id, { quantityAvailable: initialStock });
        toast.success("Product added");
      }
      resetForm();
      await loadAdminData();
    } catch (saveError) {
      toast.error(getApiErrorMessage(saveError));
    }
  };

  const editProduct = (product: ProductResponse) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description ?? "",
      price: product.price,
      brand: product.brand ?? "",
      imageUrl: product.imageUrl ?? "",
      categoryId: product.categoryId,
    });
    setTab("products");
  };

  const deleteProduct = async (id: number) => {
    try {
      await adminApi.deleteProduct(id);
      toast.success("Product removed from storefront");
      await loadAdminData();
    } catch (deleteError) {
      toast.error(getApiErrorMessage(deleteError));
    }
  };

  const saveStock = async (productId: number) => {
    try {
      await adminApi.updateInventory(productId, { quantityAvailable: stockDrafts[productId] ?? 0 });
      toast.success("Inventory updated");
      await loadAdminData();
    } catch (stockError) {
      toast.error(getApiErrorMessage(stockError));
    }
  };

  const moderateReview = async (reviewId: number, status: "APPROVED" | "REJECTED") => {
    try {
      await adminApi.moderateReview(reviewId, status);
      toast.success(`Review ${status.toLowerCase()}`);
      await loadAdminData();
    } catch (reviewError) {
      toast.error(getApiErrorMessage(reviewError));
    }
  };

  const generateEmbeddings = async () => {
    try {
      const message = await adminApi.generateEmbeddings();
      toast.success(message);
    } catch (aiError) {
      toast.error(getApiErrorMessage(aiError));
    }
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">Admin</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">Store Control Center</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">Manage catalog, inventory, AI preparation, and review moderation.</p>
          </div>
          <button onClick={generateEmbeddings} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
            Generate AI Embeddings
          </button>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {(["analytics", "products", "inventory", "reviews"] as Tab[]).map((item) => (
            <button
              key={item}
              onClick={() => setTab(item)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize ${tab === item ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-200"}`}
            >
              {item}
            </button>
          ))}
        </div>

        {isLoading && <LoadingState label="Loading admin data" />}
        {error && !isLoading && <ErrorState message={error} actionLabel="Retry" onAction={loadAdminData} />}

        {!isLoading && !error && tab === "analytics" && (
          <section className="mt-8 space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              {[
                ["Products", products.length],
                ["Stock Units", metrics.stock],
                ["Pending Reviews", reviews.length],
                ["Catalog Value", formatCurrency(metrics.catalogValue)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <p className="text-sm text-slate-500">{label}</p>
                  <p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">{value}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-950 dark:text-white">Catalog Value by Category</h2>
                    <p className="text-sm text-slate-500">Inventory value generated from admin-added products.</p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-200">
                    Live
                  </span>
                </div>

                <div className="mt-6 space-y-4">
                  {analytics.categoryValues.length === 0 && <p className="text-sm text-slate-500">No category data yet.</p>}
                  {analytics.categoryValues.map((item) => (
                    <div key={item.label}>
                      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                        <span className="font-semibold text-slate-700 dark:text-slate-200">{item.label}</span>
                        <span className="text-slate-500">{formatCurrency(item.value)}</span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div className="h-full rounded-full bg-blue-600" style={{ width: `${item.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h2 className="text-lg font-bold text-slate-950 dark:text-white">Stock Health</h2>
                <p className="text-sm text-slate-500">Top stocked products across inventory.</p>

                <div className="mt-6 space-y-4">
                  {analytics.topStock.length === 0 && <p className="text-sm text-slate-500">No inventory data yet.</p>}
                  {analytics.topStock.map((item) => (
                    <div key={item.label}>
                      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                        <span className="truncate font-semibold text-slate-700 dark:text-slate-200">{item.label}</span>
                        <span className="shrink-0 text-slate-500">{item.value} units</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div className="h-full rounded-full bg-cyan-500" style={{ width: `${item.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
                <h2 className="text-lg font-bold text-slate-950 dark:text-white">Product Mix</h2>
                <p className="text-sm text-slate-500">Number of products listed in each category.</p>

                <div className="mt-6 flex h-64 items-end gap-3 border-b border-l border-slate-200 px-2 pb-2 dark:border-slate-800">
                  {categories.map((category) => {
                    const count = products.filter((product) => product.categoryId === category.id).length;
                    const maxCount = Math.max(...categories.map((entry) => products.filter((product) => product.categoryId === entry.id).length), 1);
                    const height = Math.max((count / maxCount) * 100, count > 0 ? 10 : 2);
                    return (
                      <div key={category.id} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                        <div className="text-xs font-semibold text-slate-500">{count}</div>
                        <div className="w-full rounded-t-lg bg-gradient-to-t from-blue-600 to-cyan-400" style={{ height: `${height}%` }} />
                        <div className="w-full truncate text-center text-xs text-slate-500">{category.name}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h2 className="text-lg font-bold text-slate-950 dark:text-white">AI Review Signals</h2>
                <p className="text-sm text-slate-500">Pending reviews grouped by AI sentiment.</p>

                <div className="mt-6 space-y-3">
                  {(["POSITIVE", "NEUTRAL", "NEGATIVE", "TOXIC", "SPAM"] as const).map((sentiment) => {
                    const count = analytics.sentimentCounts[sentiment] ?? 0;
                    return (
                      <div key={sentiment} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-950">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{sentiment}</span>
                        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-700 shadow-sm dark:bg-slate-900 dark:text-slate-200">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        )}

        {!isLoading && !error && tab === "products" && (
          <section className="mt-8 grid gap-6 lg:grid-cols-[360px_1fr]">
            <form onSubmit={saveProduct} className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white">{editingId ? "Edit Product" : "Add Product"}</h2>
              {(["name", "slug", "brand", "imageUrl"] as const).map((key) => (
                <input key={key} value={form[key] ?? ""} onChange={(event) => setForm({ ...form, [key]: event.target.value })} placeholder={key} className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
              ))}
              <textarea value={form.description ?? ""} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="description" className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
              <input type="number" value={form.price} onChange={(event) => setForm({ ...form, price: Number(event.target.value) })} placeholder="price" className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
              {!editingId && (
                <input type="number" value={initialStock} onChange={(event) => setInitialStock(Number(event.target.value))} placeholder="initial stock" className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
              )}
              <select value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: Number(event.target.value) })} className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white">
                <option value={0}>Choose category</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
              <div className="mt-4 flex gap-2">
                <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">{editingId ? "Save" : "Add"}</button>
                {editingId && <button type="button" onClick={resetForm} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold">Cancel</button>}
              </div>
            </form>

            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              {products.map((product) => (
                <div key={product.id} className="grid gap-3 border-b border-slate-100 p-4 last:border-b-0 dark:border-slate-800 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <p className="font-semibold text-slate-950 dark:text-white">{product.name}</p>
                    <p className="text-sm text-slate-500">{product.categoryName} · {formatCurrency(product.price)} · {product.slug}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => editProduct(product)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold">Edit</button>
                    <button onClick={() => deleteProduct(product.id)} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {!isLoading && !error && tab === "inventory" && (
          <section className="mt-8 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {inventory.map((item) => (
              <div key={item.productId} className="grid gap-3 border-b border-slate-100 p-4 last:border-b-0 dark:border-slate-800 md:grid-cols-[1fr_180px_auto] md:items-center">
                <div>
                  <p className="font-semibold text-slate-950 dark:text-white">{item.productName}</p>
                  <p className="text-sm text-slate-500">Reserved: {item.reservedQuantity}</p>
                </div>
                <input type="number" value={stockDrafts[item.productId] ?? 0} onChange={(event) => setStockDrafts({ ...stockDrafts, [item.productId]: Number(event.target.value) })} className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
                <button onClick={() => saveStock(item.productId)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Update</button>
              </div>
            ))}
          </section>
        )}

        {!isLoading && !error && tab === "reviews" && (
          <section className="mt-8 space-y-3">
            {reviews.length === 0 && <p className="rounded-lg bg-slate-100 p-4 text-slate-600 dark:bg-slate-900 dark:text-slate-300">No pending reviews.</p>}
            {reviews.map((review) => (
              <article key={review.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                  <div>
                    <p className="font-semibold text-slate-950 dark:text-white">{review.productName}</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{review.comment || "No comment"}</p>
                    <p className="mt-2 text-xs uppercase tracking-wide text-slate-500">{review.sentiment} · confidence {Math.round((review.aiConfidence ?? 0) * 100)}%</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => moderateReview(review.id, "REJECTED")} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600">Reject</button>
                    <button onClick={() => moderateReview(review.id, "APPROVED")} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">Approve</button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </MainLayout>
  );
}
