"use client";

import { useEffect, useId, type ReactNode } from "react";

export function Dialog({
  open,
  title,
  children,
  actions,
  onClose,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  actions: ReactNode;
  onClose: () => void;
}) {
  const titleId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(4,8,18,0.55)] px-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="ac-modal-enter w-full max-w-[380px] rounded-lg border border-border bg-elevated p-6 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id={titleId} className="text-base font-bold text-text-1">
          {title}
        </h2>
        <div className="mt-2 text-[13px] leading-[1.55] text-text-2">
          {children}
        </div>
        <div className="mt-5 flex justify-end gap-2.5">{actions}</div>
      </div>
    </div>
  );
}
