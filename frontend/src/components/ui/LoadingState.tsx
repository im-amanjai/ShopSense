interface LoadingStateProps {
  label?: string;
}

export default function LoadingState({ label = "Loading" }: LoadingStateProps) {
  return (
    <div className="flex min-h-40 items-center justify-center rounded-lg border border-slate-200 bg-white/80 p-8 text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-300">
      <div className="flex items-center gap-3">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        <span className="font-medium">{label}</span>
      </div>
    </div>
  );
}
