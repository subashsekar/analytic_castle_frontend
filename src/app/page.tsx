import Link from "next/link";
import { BrandLockup } from "@/components/brand/brand-lockup";
import { LandingAuthLinks } from "@/features/auth/components/landing-auth-links";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-border bg-surface/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <BrandLockup
            href="/"
            markSize={28}
            wordmarkSize="sm"
          />
          <LandingAuthLinks />
        </div>
      </header>

      <main className="ac-page-enter mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-4 py-16 sm:px-6 sm:py-20">
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.1em] text-text-3">
          AI Data Analyst Employee
        </p>
        <h1 className="max-w-xl text-[32px] font-bold leading-10 tracking-[-0.02em] text-text-1 sm:text-[40px] sm:leading-[48px]">
          <span className="text-text-1">Analytic</span>
          <span className="text-wordmark-muted">Castle</span>
        </h1>
        <p className="mt-5 max-w-xl text-base leading-6 text-text-2">
          Connect your data. Ask questions. Discover insights.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/register">
            <Button className="h-[42px] px-5 font-bold">Get started</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" className="h-[42px] px-5 font-bold">
              Sign in
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
