"use client";

import Link from "next/link";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { forwardRef, useRef } from "react";
import { cn } from "@/lib/cn";

type BaseProps = {
  children: React.ReactNode;
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  magnetic?: boolean;
};

type AsButton = BaseProps & {
  href?: undefined;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
};

type AsLink = BaseProps & {
  href: string;
  target?: string;
};

type Props = AsButton | AsLink;

const SIZE_CLS = {
  sm: "px-5 py-2 text-[10px]",
  md: "px-7 py-3 text-[11px]",
  lg: "px-9 py-4 text-[12px]",
};

const VARIANT_CLS: Record<NonNullable<BaseProps["variant"]>, string> = {
  primary: cn(
    "text-gold bg-indigo border border-gold/40",
    "hover:border-gold hover:tracking-[0.4em]",
    "hover:shadow-[0_0_32px_rgba(212,168,75,0.45)]",
    "active:scale-[0.97]",
  ),
  outline: cn(
    "text-indigo bg-transparent border border-indigo/50",
    "hover:border-indigo hover:bg-indigo hover:text-gold hover:tracking-[0.4em]",
    "hover:shadow-[0_0_26px_rgba(27,27,58,0.3)]",
    "active:scale-[0.97]",
  ),
  ghost: cn(
    "text-indigo bg-transparent",
    "hover:text-gold hover:tracking-[0.36em]",
    "active:scale-[0.97]",
  ),
};

const BASE_CLS = cn(
  "relative overflow-hidden group kerning select-none inline-flex items-center justify-center gap-2",
  "transition-all duration-500 ease-out",
  "disabled:opacity-40 disabled:pointer-events-none",
  "rounded-[1px] btn-ethereal",
);

function Inner({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Rotating conic halo — visible on hover via CSS */}
      <span aria-hidden className="btn-conic-halo" />
      {/* Shimmer sweep */}
      <span
        aria-hidden
        className="absolute inset-0 -translate-x-[120%] bg-gradient-to-r from-transparent via-gold/30 to-transparent group-hover:translate-x-[120%] transition-transform duration-[900ms] ease-out pointer-events-none"
      />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </>
  );
}

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(props, ref) {
  const {
    children,
    variant = "primary",
    size = "md",
    className,
    magnetic = true,
  } = props;

  const classes = cn(BASE_CLS, SIZE_CLS[size], VARIANT_CLS[variant], className);

  const localRef = useRef<HTMLElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { damping: 20, stiffness: 260 });
  const sy = useSpring(my, { damping: 20, stiffness: 260 });

  const onMove = (e: React.MouseEvent) => {
    if (!magnetic || !localRef.current) return;
    const rect = localRef.current.getBoundingClientRect();
    mx.set((e.clientX - rect.left - rect.width / 2) * 0.2);
    my.set((e.clientY - rect.top - rect.height / 2) * 0.2);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  // Link rendering
  if ("href" in props && props.href) {
    const { href, target } = props;
    return (
      <motion.span
        ref={localRef as React.RefObject<HTMLSpanElement>}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={magnetic ? { x: sx, y: sy, display: "inline-block" } : undefined}
      >
        <Link
          href={href}
          target={target}
          className={classes}
          data-cursor="hover"
        >
          <Inner>{children}</Inner>
        </Link>
      </motion.span>
    );
  }

  // Button rendering
  const { onClick, type = "button", disabled } = props as AsButton;
  return (
    <motion.button
      ref={(node) => {
        localRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
      }}
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={magnetic ? { x: sx, y: sy } : undefined}
      className={classes}
      data-cursor="hover"
    >
      <Inner>{children}</Inner>
    </motion.button>
  );
});
