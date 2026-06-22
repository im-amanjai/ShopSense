import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { Chrome, Eye, EyeOff, LockKeyhole, Mail, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import toast from "react-hot-toast";
import MainLayout from "../layouts/MainLayout";
import AuthShowcase from "../components/auth/AuthShowcase";
import { useAuthStore } from "../store/authStore";

const registerSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
    terms: z.boolean().refine((value) => value, "Accept the terms to continue"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const registerUser = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "", terms: false },
  });

  const onSubmit = async (values: RegisterForm) => {
    try {
      await registerUser({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      toast.success("Account created");
      navigate("/dashboard", { replace: true });
    } catch {
      toast.error("Registration failed");
    }
  };

  return (
    <MainLayout>
      <div className="bg-[radial-gradient(circle_at_16%_10%,rgba(37,99,235,0.12),transparent_28%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-4 py-8 dark:bg-[radial-gradient(circle_at_16%_10%,rgba(59,130,246,0.16),transparent_28%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] sm:px-6 lg:py-12">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
          <AuthShowcase mode="register" />

          <section className="flex min-h-[calc(100vh-180px)] items-center justify-center lg:min-h-[720px]">
            <div className="w-full max-w-md">
              <div className="mb-8 text-center lg:text-left">
                <span className="inline-flex rounded-full border border-blue-200 bg-white/80 px-3 py-1 text-sm font-semibold text-blue-700 shadow-sm dark:border-blue-900 dark:bg-slate-950/70 dark:text-blue-200">
                  Start free
                </span>
                <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-950 dark:text-white">
                  Create your account
                </h1>
                <p className="mt-3 text-slate-600 dark:text-slate-400">
                  Build your demo shopping profile and explore personalized product discovery.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-2xl shadow-slate-900/10 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-black/30 sm:p-8">
                <button
                  type="button"
                  onClick={() => toast("Google signup placeholder")}
                  className="inline-flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-800"
                >
                  <Chrome className="h-5 w-5" aria-hidden="true" />
                  Sign up with Google
                </button>

                <div className="my-6 flex items-center gap-3">
                  <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">or email</span>
                  <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Full Name
                    </label>
                    <div className="relative mt-2">
                      <User className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-slate-400" aria-hidden="true" />
                      <input
                        id="name"
                        type="text"
                        autoComplete="name"
                        placeholder="Demo Shopper"
                        {...register("name")}
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pl-11 text-slate-950 shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                      />
                    </div>
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                  </div>

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

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Password
                      </label>
                      <div className="relative mt-2">
                        <LockKeyhole className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-slate-400" aria-hidden="true" />
                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="new-password"
                          placeholder="6+ characters"
                          {...register("password")}
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pl-11 pr-11 text-slate-950 shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
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

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Confirm
                      </label>
                      <div className="relative mt-2">
                        <LockKeyhole className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-slate-400" aria-hidden="true" />
                        <input
                          id="confirmPassword"
                          type={showPassword ? "text" : "password"}
                          autoComplete="new-password"
                          placeholder="Repeat"
                          {...register("confirmPassword")}
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pl-11 text-slate-950 shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                        />
                      </div>
                      {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}
                    </div>
                  </div>

                  <label className="flex items-start gap-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                    <input type="checkbox" {...register("terms")} className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600" />
                    <span>
                      I agree to the terms and privacy policy for this frontend demo.
                    </span>
                  </label>
                  {errors.terms && <p className="-mt-2 text-sm text-red-600">{errors.terms.message}</p>}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-xl bg-blue-600 px-4 py-3.5 font-bold text-white shadow-xl shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    {isLoading ? "Creating account..." : "Create Account"}
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
                  Already have an account?{" "}
                  <Link to="/login" className="font-bold text-blue-700 dark:text-blue-300">
                    Login
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
