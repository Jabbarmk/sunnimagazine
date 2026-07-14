"use client";

import Link from "next/link";
import type { ReactNode } from "react";

// Shared outlined-pill action button for dashboard list rows (Edit, Delete,
// Deactivate, Publish, etc). Larger tap target + readable text than the old
// bare text links, color-coded by intent, consistent across every list page.

export type RowActionVariant = "default" | "primary" | "success" | "warning" | "danger";

const VARIANT_CLASSES: Record<RowActionVariant, string> = {
  default: "border-gray-200 text-gray-600 hover:bg-gray-50",
  primary: "border-blue-200 text-blue-600 hover:bg-blue-50",
  success: "border-green-200 text-green-600 hover:bg-green-50",
  warning: "border-amber-200 text-amber-600 hover:bg-amber-50",
  danger: "border-red-200 text-red-500 hover:bg-red-50",
};

const BASE =
  "inline-flex items-center justify-center gap-1 px-3.5 py-1.5 rounded-full border text-[13px] font-medium whitespace-nowrap transition-colors disabled:opacity-50 disabled:pointer-events-none";

type CommonProps = {
  children: ReactNode;
  variant?: RowActionVariant;
  className?: string;
};

type ButtonProps = CommonProps & {
  href?: undefined;
  onClick: () => void;
  disabled?: boolean;
};

type LinkProps = CommonProps & {
  href: string;
  onClick?: undefined;
  disabled?: undefined;
};

export default function RowActionButton(props: ButtonProps | LinkProps) {
  const { children, variant = "default", className = "" } = props;
  const cls = `${BASE} ${VARIANT_CLASSES[variant]} ${className}`;

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} className={cls}>
        {children}
      </Link>
    );
  }

  const { onClick, disabled } = props as ButtonProps;
  return (
    <button onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}
