"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { onlyCode } from "@/lib/oneTimeCode";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "maxLength"> & {
  value: string;
  onChange: (code: string) => void;
};

/** A field for an emailed six-digit code. Takes a paste however it was copied
 *  (see onlyCode), and offers the code to the phone's keyboard and autofill.
 *  Takes a ref, so the sign-in can put the cursor in it. */
const CodeInput = forwardRef<HTMLInputElement, Props>(function CodeInput({ value, onChange, ...rest }, ref) {
  return (
    <input
      ref={ref}
      inputMode="numeric"
      autoComplete="one-time-code"
      {...rest}
      value={value}
      onChange={(e) => onChange(onlyCode(e.target.value))}
    />
  );
});

export default CodeInput;
