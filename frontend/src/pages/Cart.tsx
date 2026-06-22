import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgePercent,
  CreditCard,
  Heart,
  Home,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Trash2,
  Truck,
  Wallet,
} from "lucide-react";
import toast from "react-hot-toast";
import MainLayout from "../layouts/MainLayout";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";
import { useCartStore } from "../store/cartStore";
import { formatCurrency } from "../utils/format";

const shippingAmount = 99;
const taxRate = 0.08;

export default function Cart() {
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("Card");
  const cart = useCartStore((state) => state.cart);
  const isLoading = useCartStore((state) => state.isLoading);
  const error = useCartStore((state) => state.error);
  const fetchCart = useCartStore((state) => state.fetchCart);
  const updateItem = useCartStore((state) => state.updateItem);
  const removeItem = useCartStore((state) => state.removeItem);

  useEffect(() => {
    fetchCart().catch(() => undefined);
  }, [fetchCart]);

  const subtotal = cart?.totalAmount ?? 0;
  const shipping = subtotal > 0 ? shippingAmount : 0;
  const discount = appliedCoupon ? Math.round(subtotal * 0.1) : 0;
  const tax = subtotal > 0 ? Math.round((subtotal - discount) * taxRate) : 0;
  const total = Math.max(0, subtotal - discount + shipping + tax);

  const deliveryDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 3);
    return new Intl.DateTimeFormat("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
    }).format(date);
  }, []);

  const handleQuantity = async (itemId: number, productId: number, quantity: number) => {
    try {
      if (quantity < 1) {
        await removeItem(itemId);
      } else {
        await updateItem(itemId, productId, quantity);
      }
    } catch {
      toast.error("Unable to update cart");
    }
  };

  const handleApplyCoupon = () => {
    if (!coupon.trim()) {
      toast.error("Enter a coupon code");
      return;
    }

    setAppliedCoupon(coupon.trim().toUpperCase());
    toast.success("Coupon applied");
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] dark:bg-[linear-gradient(180deg,#020617_0%,#0f172a_100%)]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3 py-1 text-sm font-semibold text-blue-700 shadow-sm dark:border-blue-900 dark:bg-slate-950/70 dark:text-blue-200">
                <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                Premium checkout flow
              </span>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
                Shopping Cart
              </h1>
              <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-400">
                Review your items, apply offers, choose a payment preview, and continue to checkout.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-200">
              <ShieldCheck className="h-5 w-5 text-emerald-500" aria-hidden="true" />
              Secure demo checkout
            </div>
          </div>

          {isLoading && !cart && <LoadingState label="Loading cart" />}
          {error && !isLoading && (
            <ErrorState message={error} actionLabel="Retry" onAction={() => fetchCart().catch(() => undefined)} />
          )}
          {!isLoading && !error && (!cart || cart.items.length === 0) && (
            <EmptyState
              icon={ShoppingBag}
              title="Your cart is empty"
              message="Add products from the catalog to start checkout."
              action={
                <Link to="/products" className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
                  Browse Products
                </Link>
              }
            />
          )}

          {cart && cart.items.length > 0 && (
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_390px]">
              <section className="space-y-4">
                {cart.items.map((item) => (
                  <article
                    key={item.itemId}
                    className="group overflow-hidden rounded-lg border border-slate-200 bg-white/90 shadow-sm shadow-slate-900/5 backdrop-blur transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-black/20"
                  >
                    <div className="grid gap-5 p-4 sm:grid-cols-[132px_1fr] sm:p-5 xl:grid-cols-[150px_1fr_auto]">
                      <Link
                        to={`/products/${item.productId}`}
                        className="flex aspect-square items-center justify-center rounded-lg bg-slate-50 p-3 dark:bg-slate-950"
                      >
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.productName} className="h-full w-full object-contain transition group-hover:scale-105" />
                        ) : (
                          <span className="text-xs text-slate-500">No image</span>
                        )}
                      </Link>

                      <div className="min-w-0">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
                              AI matched item
                            </p>
                            <Link
                              to={`/products/${item.productId}`}
                              className="mt-1 block text-xl font-bold text-slate-950 transition hover:text-blue-700 dark:text-white dark:hover:text-blue-300"
                            >
                              {item.productName}
                            </Link>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                              Premium pick selected for everyday use, strong rating, and excellent value. Ready for API-backed product descriptions later.
                            </p>
                          </div>

                          <p className="text-left text-xl font-bold text-slate-950 dark:text-white sm:text-right">
                            {formatCurrency(item.lineTotal)}
                          </p>
                        </div>

                        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="inline-flex w-fit items-center rounded-lg border border-slate-200 bg-slate-50 p-1 shadow-inner dark:border-slate-700 dark:bg-slate-950">
                            <button
                              type="button"
                              onClick={() => handleQuantity(item.itemId, item.productId, item.quantity - 1)}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-700 transition hover:bg-white hover:shadow-sm dark:text-slate-200 dark:hover:bg-slate-800"
                              aria-label={`Decrease quantity for ${item.productName}`}
                            >
                              <Minus className="h-4 w-4" aria-hidden="true" />
                            </button>
                            <span className="w-12 text-center text-sm font-bold text-slate-950 dark:text-white">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => handleQuantity(item.itemId, item.productId, item.quantity + 1)}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-700 transition hover:bg-white hover:shadow-sm dark:text-slate-200 dark:hover:bg-slate-800"
                              aria-label={`Increase quantity for ${item.productName}`}
                            >
                              <Plus className="h-4 w-4" aria-hidden="true" />
                            </button>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => toast.success("Saved for later")}
                              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-blue-950 dark:hover:text-blue-200"
                            >
                              <Heart className="h-4 w-4" aria-hidden="true" />
                              Save For Later
                            </button>
                            <button
                              type="button"
                              onClick={() => removeItem(item.itemId).catch(() => toast.error("Unable to remove item"))}
                              className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-900/60 dark:hover:bg-red-950/40"
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                              Remove
                            </button>
                          </div>
                        </div>

                        <div className="mt-5 grid gap-3 border-t border-slate-100 pt-4 text-sm dark:border-slate-800 sm:grid-cols-3">
                          <div>
                            <p className="text-slate-500 dark:text-slate-400">Unit price</p>
                            <p className="font-semibold text-slate-950 dark:text-white">{formatCurrency(item.priceAtTime)}</p>
                          </div>
                          <div>
                            <p className="text-slate-500 dark:text-slate-400">Delivery</p>
                            <p className="font-semibold text-slate-950 dark:text-white">{deliveryDate}</p>
                          </div>
                          <div>
                            <p className="text-slate-500 dark:text-slate-400">Return window</p>
                            <p className="font-semibold text-slate-950 dark:text-white">7 days</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </section>

              <aside className="lg:sticky lg:top-24 lg:self-start">
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/30">
                  <div className="border-b border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
                    <h2 className="text-xl font-bold text-slate-950 dark:text-white">Order Summary</h2>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                      {cart.items.length} item{cart.items.length === 1 ? "" : "s"} ready for checkout
                    </p>
                  </div>

                  <div className="space-y-5 p-5">
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                        <span className="font-semibold text-slate-950 dark:text-white">{formatCurrency(subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Shipping</span>
                        <span className="font-semibold text-slate-950 dark:text-white">{formatCurrency(shipping)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Estimated tax</span>
                        <span className="font-semibold text-slate-950 dark:text-white">{formatCurrency(tax)}</span>
                      </div>
                      {appliedCoupon && (
                        <div className="flex justify-between text-emerald-700 dark:text-emerald-300">
                          <span>Coupon ({appliedCoupon})</span>
                          <span className="font-semibold">-{formatCurrency(discount)}</span>
                        </div>
                      )}
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                      <label htmlFor="coupon" className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                        <BadgePercent className="h-4 w-4 text-blue-600 dark:text-blue-300" aria-hidden="true" />
                        Coupon Code
                      </label>
                      <div className="mt-3 flex gap-2">
                        <input
                          id="coupon"
                          value={coupon}
                          onChange={(event) => setCoupon(event.target.value)}
                          placeholder="TRY10"
                          className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          className="rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
                        >
                          Apply
                        </button>
                      </div>
                    </div>

                    <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-200">
                          <Home className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-950 dark:text-white">Delivery Address</p>
                          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                            Demo Shopper, Bengaluru, Karnataka 560001
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                      <p className="font-semibold text-slate-950 dark:text-white">Payment Method</p>
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {[
                          { label: "Card", icon: CreditCard },
                          { label: "UPI", icon: Smartphone },
                          { label: "COD", icon: Wallet },
                        ].map((method) => (
                          <button
                            key={method.label}
                            type="button"
                            onClick={() => setPaymentMethod(method.label)}
                            className={`rounded-lg border p-3 text-center text-xs font-semibold transition ${
                              paymentMethod === method.label
                                ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-200"
                                : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-950"
                            }`}
                          >
                            <method.icon className="mx-auto mb-1 h-5 w-5" aria-hidden="true" />
                            {method.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-slate-200 pt-5 dark:border-slate-800">
                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Total</p>
                          <p className="text-3xl font-bold text-slate-950 dark:text-white">{formatCurrency(total)}</p>
                        </div>
                        <div className="text-right text-sm">
                          <p className="font-semibold text-slate-950 dark:text-white">{paymentMethod}</p>
                          <p className="text-slate-500 dark:text-slate-400">selected</p>
                        </div>
                      </div>
                    </div>

                    <Link
                      to="/checkout"
                      className="group inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3.5 font-bold text-white shadow-xl shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
                    >
                      Proceed To Checkout
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
                    </Link>

                    <div className="flex items-center justify-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                      <Truck className="h-4 w-4" aria-hidden="true" />
                      Free returns and fast delivery preview
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
