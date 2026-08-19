"use client";

import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { METADATA_SEARCH_MAX_QUERY_LENGTH } from "@/features/schema-explorer/types";

export function MetadataSearch({
  id,
  label,
  value,
  onChange,
  placeholder,
  maxLength = METADATA_SEARCH_MAX_QUERY_LENGTH,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  maxLength?: number;
}) {
  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Input
        id={id}
        type="search"
        value={value}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value.slice(0, maxLength))}
        placeholder={placeholder}
        autoComplete="off"
        className="h-9 pr-9"
      />
      {value ? (
        <button
          type="button"
          className="ac-focus-ring absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1 text-text-3 hover:text-text-1"
          onClick={() => onChange("")}
          aria-label={`Clear ${label.toLowerCase()}`}
        >
          <X size={14} strokeWidth={1.5} />
        </button>
      ) : null}
    </div>
  );
}
