import Link from "next/link";
import { LogoMark } from "@/components/brand/logo-mark";
import { LOGO_ALT } from "@/lib/brand";

type BrandLockupProps = {
  href?: string;
  markSize?: number;
  wordmarkSize?: "sm" | "md" | "lg";
  markOnly?: boolean;
  className?: string;
  markStroke?: string;
  onClick?: () => void;
};

const LOCKUP_HEIGHT: Record<"sm" | "md" | "lg", number> = {
  sm: 56,
  md: 76,
  lg: 108,
};

export function BrandLockup({
  href = "/",
  markSize = 24,
  wordmarkSize = "md",
  markOnly = false,
  className = "",
  onClick,
}: BrandLockupProps) {
  const content = markOnly ? (
    <span className={`inline-flex items-center ${className}`}>
      <LogoMark size={markSize} variant="mark" />
      <span className="sr-only">{LOGO_ALT}</span>
    </span>
  ) : (
    <span className={`inline-flex items-center ${className}`}>
      <LogoMark size={LOCKUP_HEIGHT[wordmarkSize]} variant="lockup" />
    </span>
  );

  if (!href) {
    return content;
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className="inline-flex items-center text-inherit no-underline"
      aria-label={`${LOGO_ALT} home`}
    >
      {content}
    </Link>
  );
}
