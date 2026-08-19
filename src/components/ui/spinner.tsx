export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <div
      className="flex items-center gap-2 text-[13px] text-text-3"
      role="status"
      aria-live="polite"
    >
      <span
        className="ac-spinner inline-block size-3.5 rounded-full border-2 border-border-strong border-t-signal"
        style={{ animation: "ac-spin .7s linear infinite" }}
        aria-hidden
      />
      <span>{label}</span>
    </div>
  );
}

export function PageSpinner({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex min-h-48 items-center justify-center">
      <Spinner label={label} />
    </div>
  );
}
