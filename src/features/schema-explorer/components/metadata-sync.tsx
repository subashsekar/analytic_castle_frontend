"use client";

import { Button } from "@/components/ui/button";

export function MetadataSync({
  onSync,
  syncing,
  disabled = false,
}: {
  onSync: () => void;
  syncing: boolean;
  disabled?: boolean;
}) {
  return (
    <Button onClick={onSync} disabled={disabled || syncing} loading={syncing}>
      {syncing ? "Synchronizing…" : "Synchronize metadata"}
    </Button>
  );
}
