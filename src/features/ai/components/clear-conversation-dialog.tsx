"use client";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

export function ClearConversationDialog({
  open,
  clearing,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  clearing: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      title="End this conversation?"
      actions={
        <>
          <Button variant="ghost" onClick={onCancel} disabled={clearing}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={clearing}
            loading={clearing}
          >
            {clearing ? "Ending…" : "End conversation"}
          </Button>
        </>
      }
    >
      This marks the conversation as complete. You can start a new conversation
      anytime. Workspace context stays the same.
    </Dialog>
  );
}
