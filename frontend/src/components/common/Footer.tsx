import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-950 dark:text-white">ShopSense</h2>
            <p className="mt-4 leading-relaxed text-slate-600 dark:text-slate-400">
              AI-powered shopping built around real catalog, cart, order,
              review, and recommendation APIs.
            </p>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-slate-950 dark:text-white">Quick Links</h3>
            <div className="flex flex-col gap-3 text-sm">
              <Link to="/">Home</Link>
              <Link to="/products">Products</Link>
              <Link to="/cart">Cart</Link>
              <Link to="/orders">Orders</Link>
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-slate-950 dark:text-white">Capabilities</h3>
            <div className="flex flex-col gap-3 text-sm">
              <span>Semantic search</span>
              <span>Recommendations</span>
              <span>Review moderation</span>
              <span>Mock payment flow</span>
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-slate-950 dark:text-white">Ready For Integration</h3>
            <div className="flex flex-col gap-3 text-sm">
              <span>Typed service layer</span>
              <span>Mock customer workflows</span>
              <span>Customer and admin roles</span>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 text-sm text-slate-500 dark:border-slate-800 md:flex-row">
          <p>© 2026 ShopSense. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
