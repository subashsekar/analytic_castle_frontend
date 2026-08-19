import type { InputHTMLAttributes } from "react";

export function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  const invalid =
    props["aria-invalid"] === true || props["aria-invalid"] === "true";

  return (
    <input
      className={`h-10 w-full rounded-sm border bg-sunken px-3 text-[13.5px] text-text-1 outline-none transition-[border-color,box-shadow,background] duration-[120ms] ease-out placeholder:text-text-3 hover:border-text-3 focus:border-signal focus:bg-surface focus:shadow-[0_0_0_3px_var(--signal-tint)] disabled:cursor-not-allowed disabled:opacity-50 ${
        invalid ? "border-error" : "border-border-strong"
      } ${className}`}
      {...props}
    />
  );
}
