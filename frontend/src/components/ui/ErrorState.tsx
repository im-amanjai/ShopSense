import { AlertCircle } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function ErrorState({
  title = "Something went wrong",
  message,
  actionLabel,
  onAction,
}: ErrorStateProps) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-900 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-100">
      <div className="flex gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 flex-none" aria-hidden="true" />
        <div>
          <h2 className="font-semibold">{title}</h2>
          <p className="mt-1 text-sm opacity-90">{message}</p>
          {actionLabel && onAction && (
            <button
              type="button"
              onClick={onAction}
              className="mt-4 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
            >
              {actionLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
