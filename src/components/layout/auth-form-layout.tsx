import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLockup } from "@/components/brand/brand-lockup";

export function AuthFormLayout({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-full items-center justify-center px-10 py-10">
      <div className="ac-page-enter w-full max-w-[400px] rounded-lg border border-border bg-surface p-10 shadow-lg">
        <div className="mb-6">
          <BrandLockup
            href="/"
            markSize={40}
            wordmarkSize="lg"
          />
        </div>
        <h1 className="text-[22px] font-bold tracking-[-0.01em] text-text-1">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 text-[13px] text-text-3">{description}</p>
        ) : null}
        <div className="mt-6">{children}</div>
        {footer ? (
          <div className="mt-5 text-center text-[12.5px] text-text-3">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function AuthFooterLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className="font-semibold text-link">
      {children}
    </Link>
  );
}
