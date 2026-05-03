import { forwardRef, type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "accent" | "ghost";
type Size = "sm" | "md" | "lg";

const VARIANT: Record<Variant, string> = {
  primary: "bg-hc-ink text-hc-brand hover:-translate-y-[1px]",
  secondary:
    "border-hc border-hc-ink bg-transparent text-hc-ink hover:bg-hc-ink hover:text-hc-brand",
  accent: "bg-hc-accent text-hc-accent-ink hover:-translate-y-[1px]",
  ghost: "bg-transparent text-hc-ink hover:bg-hc-line-strong",
};

const SIZE: Record<Size, string> = {
  sm: "px-4 py-2 text-hc-button",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3.5 text-base",
};

export type ButtonStyleOpts = {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
};

export function buttonClass({
  variant = "primary",
  size = "md",
  fullWidth = false,
}: ButtonStyleOpts = {}) {
  return [
    "inline-flex cursor-pointer items-center justify-center gap-2 rounded-hc-2 font-sans font-bold transition-transform leading-none",
    VARIANT[variant],
    SIZE[size],
    fullWidth ? "w-full" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & ButtonStyleOpts;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, size, fullWidth, className = "", ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={`${buttonClass({ variant, size, fullWidth })} ${className}`}
      {...rest}
    />
  );
});
