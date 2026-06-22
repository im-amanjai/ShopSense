import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CreditCard } from "lucide-react";
import toast from "react-hot-toast";
import MainLayout from "../layouts/MainLayout";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";
import { orderApi } from "../api/services";
import { getApiErrorMessage } from "../api/client";
import { useCartStore } from "../store/cartStore";
import { formatCurrency } from "../utils/format";

const paymentMethods = ["CARD", "UPI", "COD"];

export default function Checkout() {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0]);
  const [isPlacing, setIsPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cart = useCartStore((state) => state.cart);
  const isLoading = useCartStore((state) => state.isLoading);
  const fetchCart = useCartStore((state) => state.fetchCart);

  useEffect(() => {
    fetchCart().catch(() => undefined);
  }, [fetchCart]);

  const handlePlaceOrder = async () => {
    if (!cart || cart.items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsPlacing(true);
    setError(null);
    try {
      const order = await orderApi.placeOrder();
      await orderApi.mockPayment(order.orderId, { paymentMethod, success: true });
      await fetchCart();
      toast.success("Order placed successfully");
      navigate(`/order-success?orderId=${order.orderId}`);
    } catch (placeError) {
      const message = getApiErrorMessage(placeError);
      setError(message);
      toast.error(message);
    } finally {
      setIsPlacing(false);
    }
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <h1 className="text-3xl font-bold text-slate-950 dark:text-white">Checkout</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Place a complete demo order from your local cart.
        </p>

        <div className="mt-8">
          {isLoading && !cart && <LoadingState label="Loading checkout" />}
          {error && <ErrorState message={error} />}
          {!isLoading && (!cart || cart.items.length === 0) && (
            <EmptyState
              icon={CreditCard}
              title="Nothing to checkout"
              message="Your cart is empty."
              action={<Link to="/products" className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white">Browse Products</Link>}
            />
          )}

          {cart && cart.items.length > 0 && (
            <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
              <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Payment Method</h2>
                <div className="mt-5 grid gap-3">
                  {paymentMethods.map((method) => (
                    <label
                      key={method}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition ${
                        paymentMethod === method
                          ? "border-blue-600 bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-100"
                          : "border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-950"
                      }`}
                    >
                      <input
                        type="radio"
                        value={method}
                        checked={paymentMethod === method}
                        onChange={(event) => setPaymentMethod(event.target.value)}
                      />
                      <span className="font-semibold">{method}</span>
                    </label>
                  ))}
                </div>
              </section>

              <aside className="h-fit rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Order Summary</h2>
                <div className="mt-5 space-y-3">
                  {cart.items.map((item) => (
                    <div key={item.itemId} className="flex justify-between gap-4 text-sm">
                      <span className="text-slate-600 dark:text-slate-400">
                        {item.productName} x {item.quantity}
                      </span>
                      <span className="font-semibold">{formatCurrency(item.lineTotal)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 border-t border-slate-200 pt-4 dark:border-slate-800">
                  <div className="flex justify-between text-base">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-blue-700 dark:text-blue-300">{formatCurrency(cart.totalAmount)}</span>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={isPlacing}
                  onClick={handlePlaceOrder}
                  className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {isPlacing ? "Placing order..." : "Place Order"}
                </button>
              </aside>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
