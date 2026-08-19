export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`ac-skeleton rounded-sm ${className}`}
      style={{
        background:
          "linear-gradient(90deg, var(--sunken) 25%, var(--border) 50%, var(--sunken) 75%)",
        backgroundSize: "200% 100%",
        animation: "ac-shimmer 1.6s infinite",
      }}
      aria-hidden
    />
  );
}
