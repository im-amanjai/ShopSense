import { Bot, CheckCircle2, Search, Sparkles, Star, Zap } from "lucide-react";
import headphones from "../../assets/headphones.jpg";
import gamingmouse from "../../assets/gamingmouse.jpg";
import smartwatch from "../../assets/smartwatch.jpg";

interface AuthShowcaseProps {
  mode: "login" | "register";
}

export default function AuthShowcase({ mode }: AuthShowcaseProps) {
  return (
    <aside className="relative hidden min-h-[720px] overflow-hidden rounded-[2rem] border border-white/60 bg-slate-950 p-8 text-white shadow-2xl shadow-slate-900/25 dark:border-slate-800 lg:block">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_14%,rgba(59,130,246,0.45),transparent_30%),radial-gradient(circle_at_85%_18%,rgba(20,184,166,0.30),transparent_26%),linear-gradient(145deg,#020617_0%,#0f172a_48%,#111827_100%)]" />
      <div className="absolute left-10 top-24 h-72 w-72 rounded-full bg-blue-500/25 blur-3xl" />
      <div className="absolute bottom-16 right-8 h-80 w-80 rounded-full bg-cyan-400/15 blur-3xl" />
      <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.18)_1px,transparent_1px)] [background-size:44px_44px]" />

      <div className="relative z-10">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm font-semibold text-blue-100 backdrop-blur">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          ShopSense AI
        </span>

        <h2 className="mt-8 max-w-md text-5xl font-bold tracking-tight">
          Find the perfect product with AI.
        </h2>
        <p className="mt-5 max-w-md text-base leading-7 text-slate-300">
          Receive personalized recommendations, compare products, and discover better options instantly.
        </p>
      </div>

      <div className="relative z-10 mt-10 min-h-[440px]">
        <div className="absolute left-0 top-0 w-[74%] rounded-2xl border border-white/15 bg-white/10 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <div className="flex items-center gap-3 border-b border-white/10 pb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 text-white">
              <Bot className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold">AI recommendation</p>
              <p className="text-xs text-slate-300">Answer generated instantly</p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div className="ml-auto max-w-[82%] rounded-2xl bg-blue-500 px-4 py-3 text-sm font-semibold shadow-lg shadow-blue-500/25">
              Best headphones under ₹5000
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <div className="flex gap-3">
                <img src={headphones} alt="Sony headphones" className="h-20 w-20 rounded-xl bg-white object-contain p-2" />
                <div className="min-w-0">
                  <p className="text-sm font-bold">Sony WH-CH720N</p>
                  <div className="mt-1 flex items-center gap-2 text-sm">
                    <span className="inline-flex items-center gap-1 text-amber-300">
                      <Star className="h-4 w-4 fill-current" aria-hidden="true" />
                      4.5
                    </span>
                    <span className="font-bold text-blue-100">₹4,999</span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-300">
                    Recommended for battery life and noise cancellation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute right-0 top-32 w-[54%] rounded-2xl border border-white/15 bg-white/95 p-3 text-slate-950 shadow-2xl shadow-black/30">
          <div className="relative rounded-xl bg-slate-100 p-3">
            <span className="absolute right-2 top-2 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-700">
              AI Recommended
            </span>
            <img src={smartwatch} alt="Smart watch" className="mx-auto h-32 w-full object-contain" />
          </div>
          <p className="mt-3 line-clamp-2 text-sm font-bold">FitPulse AMOLED Smart Watch</p>
          <div className="mt-2 flex items-center justify-between">
            <span className="font-bold text-blue-700">₹2,999</span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-500">
              <Star className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
              4.5
            </span>
          </div>
        </div>

        <div className="absolute bottom-16 left-8 w-[46%] rounded-2xl border border-white/15 bg-white/10 p-4 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400 text-slate-950">
              <Search className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold">Semantic Search</p>
              <p className="text-xs text-slate-300">Intent-aware results</p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-3 right-10 w-[50%] rounded-2xl border border-white/15 bg-white/10 p-4 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <div className="flex gap-3">
            <img src={gamingmouse} alt="Gaming mouse" className="h-14 w-14 rounded-xl bg-white object-contain p-1.5" />
            <div>
              <p className="text-sm font-semibold">Smart comparison</p>
              <p className="mt-1 text-xs text-slate-300">3 better options found</p>
            </div>
          </div>
        </div>

        <div className="absolute right-8 top-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-blue-100 shadow-xl backdrop-blur-xl">
          <CheckCircle2 className="mr-2 inline h-4 w-4 text-emerald-300" aria-hidden="true" />
          {mode === "login" ? "Welcome back" : "Start in seconds"}
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-3 gap-3">
        {[
          ["95%", "Match score"],
          ["1.2s", "AI response"],
          ["10K+", "Products"],
        ].map(([value, label]) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
            <p className="text-2xl font-bold">{value}</p>
            <p className="mt-1 text-xs text-slate-300">{label}</p>
          </div>
        ))}
      </div>

      <div className="absolute bottom-7 left-8 z-10 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-slate-200 backdrop-blur">
        <Zap className="h-4 w-4 text-amber-300" aria-hidden="true" />
        Personalized shopping in a clean frontend demo
      </div>
    </aside>
  );
}
