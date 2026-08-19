"use client";

import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function DeleteDataSourceDialog({
  open,
  name,
  deleting,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  name: string;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      title={`Delete "${name}"?`}
      actions={
        <>
          <Button variant="ghost" onClick={onCancel} disabled={deleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={deleting}
            loading={deleting}
          >
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        </>
      }
    >
      This removes the data source and its stored connection. This can&apos;t be
      undone.
    </Dialog>
  );
}
