import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Mail, LockKeyhole, CircleUserRound  } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import toast from "react-hot-toast";
import MainLayout from "../layouts/MainLayout";
import AuthShowcase from "../components/auth/AuthShowcase";
import { useAuthStore } from "../store/authStore";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

interface LocationState {
  from?: {
    pathname?: string;
  };
}

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginForm) => {
    try {
      await login(values);
      toast.success("Logged in successfully");
      const state = location.state as LocationState | null;
      navigate(state?.from?.pathname || "/dashboard", { replace: true });
    } catch {
      toast.error("Login failed. Check your credentials.");
    }
  };

  return (
    <MainLayout>
      <div className="bg-[radial-gradient(circle_at_16%_10%,rgba(37,99,235,0.12),transparent_28%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-4 py-8 dark:bg-[radial-gradient(circle_at_16%_10%,rgba(59,130,246,0.16),transparent_28%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] sm:px-6 lg:py-12">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
          <AuthShowcase mode="login" />

          <section className="flex min-h-[calc(100vh-180px)] items-center justify-center lg:min-h-[720px]">
            <div className="w-full max-w-md">
              <div className="mb-8 text-center lg:text-left">
                <span className="inline-flex rounded-full border border-blue-200 bg-white/80 px-3 py-1 text-sm font-semibold text-blue-700 shadow-sm dark:border-blue-900 dark:bg-slate-950/70 dark:text-blue-200">
                  Secure access
                </span>
                <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-950 dark:text-white">
                  Welcome back
                </h1>
                <p className="mt-3 text-slate-600 dark:text-slate-400">
                  Sign in to continue shopping, managing orders, and using AI recommendations.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-2xl shadow-slate-900/10 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-black/30 sm:p-8">
                <button
                  type="button"
                  onClick={() => toast("Google login placeholder")}
                  className="inline-flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-800"
                >
                  <CircleUserRound  className="h-5 w-5" aria-hidden="true" />
                  Continue with Google
                </button>

                <div className="my-6 flex items-center gap-3">
                  <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">or email</span>
                  <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Email
                    </label>
                    <div className="relative mt-2">
                      <Mail className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-slate-400" aria-hidden="true" />
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@shopsense.ai"
                        {...register("email")}
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pl-11 text-slate-950 shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                      />
                    </div>
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Password
                      </label>
                      <button type="button" className="text-sm font-semibold text-blue-700 hover:text-blue-800 dark:text-blue-300">
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative mt-2">
                      <LockKeyhole className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-slate-400" aria-hidden="true" />
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="Enter password"
                        {...register("password")}
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pl-11 pr-12 text-slate-950 shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((show) => !show)}
                        className="absolute right-3 top-3.5 text-slate-500 transition hover:text-slate-800 dark:hover:text-slate-200"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
                  </div>

                  <label className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                    <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-blue-600" />
                    Remember me on this device
                  </label>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-xl bg-blue-600 px-4 py-3.5 font-bold text-white shadow-xl shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    {isLoading ? "Signing in..." : "Login"}
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
                  Don&apos;t have an account?{" "}
                  <Link to="/register" className="font-bold text-blue-700 dark:text-blue-300">
                    Create one
                  </Link>
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
