import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import MainLayout from "../layouts/MainLayout";

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <MainLayout>
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300">
          <CheckCircle2 className="h-9 w-9" aria-hidden="true" />
        </div>
        <h1 className="mt-6 text-4xl font-bold text-slate-950 dark:text-white">
          Order Placed Successfully
        </h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
          Your demo order was created from the local cart and saved for the Orders page.
        </p>

        {orderId && (
          <div className="mx-auto mt-8 max-w-sm rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-500">Order ID</p>
            <p className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">#{orderId}</p>
          </div>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/orders" className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">
            View Orders
          </Link>
          <Link to="/products" className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-800 hover:border-blue-500 hover:text-blue-700 dark:border-slate-700 dark:text-slate-200">
            Continue Shopping
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}
