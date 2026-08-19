"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/use-auth";

export function WorkspaceSwitcher() {
  const { me, workspace, switchWorkspace, isSwitchingWorkspace } = useAuth();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const workspaces = me?.workspaces ?? [];

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

  if (!workspace) {
    return null;
  }

  return (
    <div className="relative w-full max-w-full" ref={rootRef}>
      <button
        type="button"
        className="ac-focus-ring inline-flex h-9 w-full max-w-52 items-center gap-2 truncate rounded-sm border border-border-strong bg-sunken px-3 text-[13px] font-medium text-text-1 transition-colors hover:border-text-3 md:max-w-full"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        disabled={isSwitchingWorkspace}
      >
        <span className="min-w-0 flex-1 truncate text-left">
          {isSwitchingWorkspace ? "Switching…" : workspace.name}
        </span>
        <ChevronDown
          size={14}
          strokeWidth={1.5}
          className="shrink-0 text-text-3"
        />
      </button>

      {open ? (
        <ul
          role="listbox"
          className="ac-dropdown-enter absolute left-0 z-40 mt-1.5 min-w-full overflow-hidden rounded-sm border border-border bg-elevated p-1.5 shadow-md"
        >
          {workspaces.map((item) => {
            const selected = item.id === workspace.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className="flex w-full items-center gap-2 rounded-[6px] px-2.5 py-2 text-left text-[13px] text-text-1 hover:bg-sunken"
                  onClick={async () => {
                    setOpen(false);
                    if (item.id !== workspace.id) {
                      await switchWorkspace(item);
                    }
                  }}
                >
                  <span className="min-w-0 flex-1 truncate">{item.name}</span>
                  {selected ? (
                    <Check size={14} strokeWidth={1.5} className="text-signal" />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
