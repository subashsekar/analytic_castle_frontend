"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { toApiError } from "@/lib/api/errors";

export function useForm<T extends Record<string, string>>(options: {
  initialValues: T;
  validate: (values: T) => Partial<Record<keyof T, string>>;
  onSubmit: (values: T) => Promise<void>;
}) {
  const [values, setValues] = useState(options.initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = options.validate(values);
    setErrors(nextErrors);
    setFormError(null);

    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    setSubmitting(true);
    try {
      await options.onSubmit(values);
    } catch (error) {
      const apiError = toApiError(error);
      if (apiError.fields) {
        setErrors((current) => ({
          ...current,
          ...(apiError.fields as Partial<Record<keyof T, string>>),
        }));
      }
      setFormError(apiError.message);
    } finally {
      setSubmitting(false);
    }
  }

  function reset(nextValues?: T) {
    setValues(nextValues ?? options.initialValues);
    setErrors({});
    setFormError(null);
  }

  return {
    values,
    errors,
    formError,
    submitting,
    handleChange,
    handleSubmit,
    setFormError,
    setValues,
    reset,
  };
}
