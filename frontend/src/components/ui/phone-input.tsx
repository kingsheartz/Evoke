import * as React from "react";
import { z } from "zod";
import { Input, type InputProps } from "@/components/ui/input";

/** Strip non-digit characters — phone fields accept numbers only. */
export function digitsOnlyPhone(value: string): string {
  return value.replace(/\D/g, "");
}

type PhoneInputProps = Omit<InputProps, "type" | "inputMode" | "onChange"> & {
  onChange: (value: string) => void;
};

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value, onChange, onBlur, ...props }, ref) => (
    <Input
      ref={ref}
      type="tel"
      inputMode="numeric"
      autoComplete="tel"
      pattern="[0-9]*"
      value={value ?? ""}
      onChange={(event) => onChange(digitsOnlyPhone(event.target.value))}
      onBlur={onBlur}
      {...props}
    />
  ),
);
PhoneInput.displayName = "PhoneInput";

/** Zod-friendly optional phone — empty string or digits only. */
export function optionalPhoneSchema(message = "Phone must contain numbers only") {
  return z.string().regex(/^\d*$/, message).optional();
}
