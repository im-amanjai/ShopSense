import { useEffect, useState } from "react";
import { Package } from "lucide-react";
import MainLayout from "../layouts/MainLayout";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";
import { orderApi } from "../api/services";
import { getApiErrorMessage } from "../api/client";
import type { OrderResponse } from "../types/api";
import { formatCurrency, formatDate } from "../utils/format";

export default function Orders() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadOrders() {
      try {
        const data = await orderApi.findMyOrders();
        if (!cancelled) setOrders(data);
      } catch (loadError) {
        if (!cancelled) setError(getApiErrorMessage(loadError));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadOrders();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <h1 className="text-3xl font-bold text-slate-950 dark:text-white">My Orders</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Demo orders are saved locally and use the same shape expected by the future API.
        </p>

        <div className="mt-8">
          {isLoading && <LoadingState label="Loading orders" />}
          {error && !isLoading && <ErrorState message={error} />}
          {!isLoading && !error && orders.length === 0 && (
            <EmptyState icon={Package} title="No orders yet" message="Placed orders will appear here." />
          )}
          {!isLoading && !error && orders.length > 0 && (
            <div className="space-y-5">
              {orders.map((order) => (
                <article key={order.orderId} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                    <div>
                      <p className="text-sm text-slate-500">Order #{order.orderId}</p>
                      <h2 className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">
                        {order.items.map((item) => item.productName).join(", ")}
                      </h2>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-200">
                        {order.orderStatus}
                      </span>
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>
                  <div className="mt-5 border-t border-slate-200 pt-4 dark:border-slate-800">
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span className="text-blue-700 dark:text-blue-300">{formatCurrency(order.totalAmount)}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
