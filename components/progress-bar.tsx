import { clsx } from "clsx";

// PROVIDED. A percentage bar. Pass `failed` to turn it red.
export function ProgressBar({ value, failed }: { value: number; failed?: boolean }) {
  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full bg-neutral-200"
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={clsx("h-full transition-all duration-300", failed ? "bg-red-500" : "bg-blue-500")}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
