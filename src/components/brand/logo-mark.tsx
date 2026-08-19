import { LOGO_ALT, LOGO_SRC } from "@/lib/brand";

type LogoMarkProps = {
  size?: number;
  className?: string;
  /** Kept for call-site compatibility; the PNG mark is full-color. */
  stroke?: string;
  /** `mark` crops to the emblem; `lockup` shows the full stacked logo. */
  variant?: "mark" | "lockup";
};

export function LogoMark({
  size = 32,
  className = "",
  variant = "mark",
}: LogoMarkProps) {
  if (variant === "lockup") {
    const width = Math.round(size * 0.95);
    const scaled = Math.round(size * 1.62);
    return (
      <span
        className={`relative inline-block shrink-0 overflow-hidden rounded-md ${className}`}
        style={{ height: size, width }}
      >
        <img
          src={LOGO_SRC}
          alt={LOGO_ALT}
          className="absolute left-1/2 top-1/2 max-w-none -translate-x-1/2 -translate-y-1/2 object-cover"
          style={{ height: scaled, width: scaled }}
        />
      </span>
    );
  }

  const scaled = Math.round(size * 1.85);
  return (
    <span
      className={`relative inline-block shrink-0 overflow-hidden rounded-md ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <img
        src={LOGO_SRC}
        alt=""
        className="absolute left-1/2 top-0 max-w-none -translate-x-1/2 object-cover"
        style={{
          height: scaled,
          width: scaled,
          objectPosition: "center 16%",
        }}
      />
    </span>
  );
}
