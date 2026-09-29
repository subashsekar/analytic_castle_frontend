"use client";

type FollowUpSuggestionsProps = {
  suggestions: string[];
  disabled?: boolean;
  onSelect: (suggestion: string) => void;
};

export function FollowUpSuggestions({
  suggestions,
  disabled = false,
  onSelect,
}: FollowUpSuggestionsProps) {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2" aria-label="Suggested follow-ups">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion}
          type="button"
          disabled={disabled}
          className="ac-focus-ring ac-press rounded-full border border-border bg-sunken px-3 py-1.5 text-left text-[12.5px] font-medium text-text-2 transition-colors hover:border-signal/40 hover:bg-signal-tint hover:text-signal disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => onSelect(suggestion)}
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}
