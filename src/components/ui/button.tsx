import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive"
  | "link"
  | "icon";

type Size = "md" | "sm";

const variants: Record<Variant, string> = {
  primary:
    "bg-signal text-white hover:bg-signal-hover active:bg-signal-active ac-focus-ring disabled:opacity-40",
  secondary:
    "bg-ink-800 text-white hover:opacity-90 ac-focus-ring disabled:opacity-40 [[data-theme=light]_&]:bg-text-1",
  outline:
    "border border-border-strong bg-transparent text-text-1 hover:bg-sunken hover:border-text-3 ac-focus-ring disabled:opacity-40",
  ghost:
    "bg-transparent text-text-1 hover:bg-sunken ac-focus-ring disabled:opacity-40",
  destructive:
    "bg-error text-white hover:brightness-110 ac-focus-ring disabled:opacity-40 [[data-theme=dark]_&]:text-[#1a0a0a]",
  link: "h-auto bg-transparent p-0 text-link font-semibold underline decoration-transparent hover:decoration-link",
  icon: "size-9 shrink-0 border border-border bg-transparent p-0 text-text-2 hover:bg-sunken hover:text-text-1 ac-focus-ring disabled:opacity-40 [&_svg]:size-[17px]",
};

const sizes: Record<Size, string> = {
  md: "h-[38px] px-4 text-[13.5px]",
  sm: "h-8 px-3 text-[12.5px]",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  loading = false,
  children,
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children?: ReactNode;
}) {
  const sizeClass = variant === "icon" || variant === "link" ? "" : sizes[size];

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`ac-press inline-flex items-center justify-center gap-[7px] rounded-sm font-semibold transition-[background,border-color,color,box-shadow,transform] duration-100 ease-out active:scale-[0.97] disabled:cursor-not-allowed disabled:active:scale-100 ${sizeClass} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <span
          className="ac-spinner size-[14px] rounded-full border-2 border-white/40 border-t-white"
          style={{ animation: "ac-spin .7s linear infinite" }}
          aria-hidden
        />
      ) : null}
      {children}
    </button>
  );
}
