"use client";

import { useTheme } from "@/providers/theme-provider";

/** Product settings Dark mode control (handoff settings row). */
export function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  const on = theme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label="Dark mode"
      className={`ac-focus-ring relative h-[22px] w-10 shrink-0 rounded-full transition-colors duration-100 ease-out ${
        on ? "bg-signal" : "bg-border-strong"
      }`}
      onClick={() => setTheme(on ? "light" : "dark")}
    >
      <span
        className={`absolute top-[2px] size-[18px] rounded-full bg-white transition-transform duration-100 ease-out ${
          on ? "left-5" : "left-[2px]"
        }`}
      />
    </button>
  );
}
