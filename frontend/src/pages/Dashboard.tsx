import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, ShoppingCart, Sparkles, Star } from "lucide-react";
import MainLayout from "../layouts/MainLayout";
import ProductCard from "../components/products/ProductCard";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";
import { orderApi, recommendationApi } from "../api/services";
import { getApiErrorMessage } from "../api/client";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";
import type { OrderResponse, RecommendationResponse } from "../types/api";
import { formatCurrency, initials } from "../utils/format";

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const cartCount = useCartStore((state) => state.itemCount);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        const [orderData, recommendationData] = await Promise.all([
          orderApi.findMyOrders(),
          recommendationApi.forMe(),
        ]);

        if (!cancelled) {
          setOrders(orderData);
          setRecommendations(recommendationData.slice(0, 4));
        }
      } catch (loadError) {
        if (!cancelled) setError(getApiErrorMessage(loadError));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadDashboard();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalSpent = orders.reduce((total, order) => total + Number(order.totalAmount), 0);

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white">
                {initials(user?.name)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-950 dark:text-white">{user?.name}</h1>
                <p className="text-slate-600 dark:text-slate-400">{user?.email}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
                  {user?.role}
                </p>
              </div>
            </div>
            <Link to="/orders" className="rounded-lg bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-blue-700">
              View Orders
            </Link>
          </div>
        </section>

        {isLoading && <div className="mt-8"><LoadingState label="Loading dashboard" /></div>}
        {error && !isLoading && <div className="mt-8"><ErrorState message={error} /></div>}

        {!isLoading && !error && (
          <>
            <section className="mt-8 grid gap-5 md:grid-cols-3">
              {[
                { icon: Package, label: "Orders", value: orders.length.toString() },
                { icon: ShoppingCart, label: "Cart Items", value: cartCount.toString() },
                { icon: Star, label: "Total Spent", value: formatCurrency(totalSpent) },
              ].map((stat) => (
                <div key={stat.label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <stat.icon className="h-5 w-5 text-blue-700 dark:text-blue-300" aria-hidden="true" />
                  <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">{stat.label}</p>
                  <p className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">{stat.value}</p>
                </div>
              ))}
            </section>

            <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-950 dark:text-white">Recent Orders</h2>
                <Link to="/orders" className="text-sm font-semibold text-blue-700 dark:text-blue-300">View all</Link>
              </div>
              {orders.length === 0 ? (
                <p className="text-sm text-slate-600 dark:text-slate-400">No orders yet.</p>
              ) : (
                <div className="space-y-3">
                  {orders.slice(0, 3).map((order) => (
                    <div key={order.orderId} className="flex flex-col justify-between gap-2 rounded-lg bg-slate-50 p-4 dark:bg-slate-950 sm:flex-row sm:items-center">
                      <div>
                        <p className="font-semibold text-slate-950 dark:text-white">Order #{order.orderId}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{order.orderStatus} · {order.paymentStatus}</p>
                      </div>
                      <p className="font-bold text-blue-700 dark:text-blue-300">{formatCurrency(order.totalAmount)}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="mt-8">
              <div className="mb-5 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-700 dark:text-blue-300" aria-hidden="true" />
                <h2 className="text-xl font-bold text-slate-950 dark:text-white">Recommended For You</h2>
              </div>
              {recommendations.length === 0 ? (
                <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                  Recommendations will improve as you view, review, and order products.
                </p>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {recommendations.map((product) => (
                    <ProductCard key={product.productId} product={product} compact />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </MainLayout>
  );
}
