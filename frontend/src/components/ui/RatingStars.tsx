import { Star } from "lucide-react";

interface RatingStarsProps {
  value?: number | null;
  label?: string;
}

export default function RatingStars({ value = 0, label }: RatingStarsProps) {
  const rounded = Math.round(value ?? 0);

  return (
    <div
      className="flex items-center gap-1 text-amber-500"
      aria-label={label || `${value?.toFixed(1) ?? "0.0"} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={`h-4 w-4 ${index < rounded ? "fill-current" : "text-slate-300 dark:text-slate-700"}`}
          aria-hidden="true"
        />
      ))}
      <span className="ml-1 text-sm font-medium text-slate-600 dark:text-slate-400">
        {(value ?? 0).toFixed(1)}
      </span>
    </div>
  );
}
