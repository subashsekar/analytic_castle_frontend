"use client";

import Link from "next/link";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { Button } from "@/components/ui/button";

export function LandingAuthLinks() {
  const { status } = useAuth();

  if (status === "authenticated") {
    return (
      <Link href="/home">
        <Button size="sm">Open workspace</Button>
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3 text-[13px]">
      <Link
        href="/login"
        className="font-semibold text-text-2 hover:text-text-1"
      >
        Sign in
      </Link>
      <Link href="/register">
        <Button size="sm">Create account</Button>
      </Link>
    </div>
  );
}
