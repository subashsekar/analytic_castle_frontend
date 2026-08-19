"use client";

import { Eye, EyeOff } from "lucide-react";
import {
  useState,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

export function Field({
  id,
  label,
  error,
  hint,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="mb-0">
        {label}
      </Label>
      <Input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {error ? (
        <p id={`${id}-error`} className="text-[11.5px] text-error">
          {error}
        </p>
      ) : hint ? (
        <p className="text-[11.5px] text-text-3">{hint}</p>
      ) : null}
    </div>
  );
}

export function PasswordField({
  id,
  label,
  error,
  hint,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
  error?: string;
  hint?: ReactNode;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="mb-0">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className="pr-10"
          {...props}
        />
        <button
          type="button"
          className="ac-focus-ring absolute right-2.5 top-1/2 -translate-y-1/2 rounded-sm p-1 text-text-3 hover:text-text-1"
          onClick={() => setVisible((value) => !value)}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? (
            <EyeOff size={16} strokeWidth={1.5} />
          ) : (
            <Eye size={16} strokeWidth={1.5} />
          )}
        </button>
      </div>
      {error ? (
        <p id={`${id}-error`} className="text-[11.5px] text-error">
          {error}
        </p>
      ) : hint ? (
        <p className="text-[11.5px] text-text-3">{hint}</p>
      ) : null}
    </div>
  );
}

export function SelectField({
  id,
  label,
  error,
  hint,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="mb-0">
        {label}
      </Label>
      <Select
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      >
        {children}
      </Select>
      {error ? (
        <p id={`${id}-error`} className="text-[11.5px] text-error">
          {error}
        </p>
      ) : hint ? (
        <p className="text-[11.5px] text-text-3">{hint}</p>
      ) : null}
    </div>
  );
}
