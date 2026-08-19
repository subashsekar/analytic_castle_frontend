"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import {
  Home,
  Database,
  Users,
  Settings,
  User,
  LogOut,
  KeyRound,
} from "lucide-react";
import { BrandLockup } from "@/components/brand/brand-lockup";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { WorkspaceSwitcher } from "@/features/workspace/components/workspace-switcher";
import { roleLabel } from "@/lib/auth/permissions";
import { displayName } from "@/lib/utils/names";
import { initials } from "@/lib/utils/initials";
import { Badge } from "@/components/ui/badge";

const ICON_STROKE = 1.5;

const primaryNav = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/data-sources", label: "Data sources", icon: Database },
  { href: "/workspace/members", label: "Team", icon: Users },
  { href: "/workspace/settings", label: "Workspace", icon: Settings },
] as const;

const mobileNav = [
  ...primaryNav,
  { href: "/profile", label: "Profile", icon: User },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-full md:grid md:grid-cols-[var(--sidebar-collapsed)_1fr] xl:grid-cols-[var(--sidebar-width)_1fr]">
      <aside className="sticky top-0 hidden h-screen flex-col gap-6 overflow-y-auto border-r border-white/[0.08] bg-ink-950 px-3 py-5 md:flex">
        <SidebarBrand />
        <SidebarNav collapsedClass="md:justify-center xl:justify-start" />
        <div className="mt-auto hidden w-full flex-col gap-3 border-t border-white/[0.08] pt-4 xl:flex">
          <WorkspaceSwitcher />
          <UserMenu />
        </div>
        <div className="mt-auto flex flex-col items-center gap-3 border-t border-white/[0.08] pt-4 xl:hidden">
          <UserMenu compact />
        </div>
      </aside>

      <div className="flex min-h-full min-w-0 flex-col pb-[72px] md:pb-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-surface/95 px-4 backdrop-blur md:hidden">
          <BrandLockup
            href="/home"
            markSize={28}
            wordmarkSize="sm"
            className="min-w-0"
          />
          <WorkspaceSwitcher />
        </header>

        <main className="ac-page-enter mx-auto w-full max-w-[1180px] flex-1 px-4 py-6 sm:px-5 md:px-5 xl:px-8 xl:py-8">
          {children}
        </main>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 flex items-stretch justify-around border-t border-border bg-surface px-1 py-2 md:hidden"
        aria-label="Primary"
      >
        {mobileNav.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`ac-focus-ring flex min-h-11 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-sm px-1 py-1 text-[10px] font-semibold ${
                active ? "text-signal" : "text-text-3"
              }`}
            >
              <Icon size={18} strokeWidth={ICON_STROKE} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function SidebarBrand() {
  return (
    <div className="flex w-full items-center justify-center gap-2.5 border-b border-white/[0.08] px-2 pb-4 xl:justify-start">
      <span className="hidden text-white xl:inline-flex">
        <BrandLockup href="/home" markSize={44} wordmarkSize="md" />
      </span>
      <span className="xl:hidden">
        <BrandLockup href="/home" markSize={44} markOnly />
      </span>
    </div>
  );
}

function SidebarNav({ collapsedClass = "" }: { collapsedClass?: string }) {
  const pathname = usePathname();

  return (
    <nav className="flex w-full flex-col gap-0.5" aria-label="Workspace">
      <p className="hidden px-2.5 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.07em] text-rail-muted xl:block">
        Workspace
      </p>
      {primaryNav.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            title={item.label}
            className={`ac-focus-ring flex items-center gap-2.5 rounded-sm px-2.5 py-[9px] text-[13.5px] font-medium transition-colors ${collapsedClass} ${
              active
                ? "bg-signal-tint text-white"
                : "text-rail-text hover:bg-white/[0.06] hover:text-white"
            }`}
          >
            <Icon
              size={16}
              strokeWidth={ICON_STROKE}
              className="shrink-0 opacity-85"
            />
            <span className="md:hidden xl:inline">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function UserMenu({ compact = false }: { compact?: boolean }) {
  const { user, me, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const role =
    me?.workspace_role ??
    me?.organization?.role ??
    (user?.is_super_admin ? "SUPER_ADMIN" : (user?.role ?? null));

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  async function handleLogout() {
    setSigningOut(true);
    try {
      await logout();
      router.replace("/login");
    } finally {
      setSigningOut(false);
      setOpen(false);
    }
  }

  return (
    <div className="relative w-full" ref={rootRef}>
      <button
        type="button"
        className={`ac-focus-ring inline-flex w-full items-center gap-2 rounded-sm px-2 py-2 text-left text-[13px] text-rail-text hover:bg-white/[0.06] hover:text-white ${
          compact ? "justify-center px-0" : ""
        }`}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={open ? menuId : undefined}
      >
        <span className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-signal text-xs font-bold text-white">
          {user ? initials(displayName(user)) : "?"}
        </span>
        {!compact ? (
          <span className="min-w-0 flex-1">
            <span className="block truncate font-semibold text-white">
              {user ? displayName(user) : "Account"}
            </span>
            {role ? (
              <span className="mt-0.5 block">
                <Badge>{roleLabel(role)}</Badge>
              </span>
            ) : null}
          </span>
        ) : null}
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          className="ac-dropdown-enter absolute bottom-[calc(100%+6px)] left-0 z-40 min-w-[180px] rounded-sm border border-border bg-elevated p-1.5 shadow-md"
        >
          <Link
            href="/profile"
            role="menuitem"
            className="flex items-center gap-2 rounded-[6px] px-2.5 py-2 text-[13px] text-text-1 hover:bg-sunken"
            onClick={() => setOpen(false)}
          >
            <User size={14} strokeWidth={ICON_STROKE} className="text-text-3" />
            Profile
          </Link>
          <Link
            href="/account/password"
            role="menuitem"
            className="flex items-center gap-2 rounded-[6px] px-2.5 py-2 text-[13px] text-text-1 hover:bg-sunken"
            onClick={() => setOpen(false)}
          >
            <KeyRound
              size={14}
              strokeWidth={ICON_STROKE}
              className="text-text-3"
            />
            Change password
          </Link>
          <hr className="my-1 border-border" />
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 rounded-[6px] px-2.5 py-2 text-left text-[13px] text-text-1 hover:bg-sunken"
            onClick={handleLogout}
            disabled={signingOut}
          >
            <LogOut
              size={14}
              strokeWidth={ICON_STROKE}
              className="text-text-3"
            />
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
