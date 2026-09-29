"use client";

import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AI_MAX_MESSAGE_CHARS } from "@/features/ai/types";

export function MessageInput({
  value,
  onChange,
  onSend,
  disabled = false,
  sending = false,
  placeholder = "Ask a question…",
  helper,
}: {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  sending?: boolean;
  placeholder?: string;
  helper?: string;
}) {
  const inputId = "ai-analyst-message";
  const canSend = !disabled && !sending && value.trim().length > 0;

  return (
    <div className="border-t border-border p-3 sm:p-4">
      <form
        className="flex items-end gap-2 rounded-lg border border-border-strong bg-surface p-2 pl-3 shadow-sm"
        onSubmit={(event) => {
          event.preventDefault();
          if (canSend) {
            onSend();
          }
        }}
      >
        <label htmlFor={inputId} className="sr-only">
          Ask the AI Analyst
        </label>
        <textarea
          id={inputId}
          rows={2}
          maxLength={AI_MAX_MESSAGE_CHARS}
          value={value}
          disabled={disabled || sending}
          placeholder={placeholder}
          className="max-h-32 min-h-[44px] flex-1 resize-none bg-transparent py-2 text-[13.5px] text-text-1 outline-none placeholder:text-text-3 disabled:cursor-not-allowed"
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              if (canSend) {
                onSend();
              }
            }
          }}
        />
        <Button
          type="submit"
          variant="primary"
          className="size-10 shrink-0 rounded-sm px-0"
          disabled={!canSend}
          loading={sending}
          aria-label="Send message"
        >
          <Send size={16} strokeWidth={1.6} />
        </Button>
      </form>
      <p className="mt-2 text-[11.5px] text-text-3">
        {value.length}/{AI_MAX_MESSAGE_CHARS}
        {helper ? ` · ${helper}` : null}
      </p>
    </div>
  );
}
