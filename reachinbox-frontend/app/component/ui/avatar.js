"use client";

import React from "react";
import { cn } from "../../lib/utils";

export function Avatar({ className, children }) {
  return (
    <div
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function AvatarImage({ src, alt, className }) {
  if (!src) return null;

  return (
    <img
      src={src}
      alt={alt}
      className={cn("h-full w-full object-cover", className)}
    />
  );
}

export function AvatarFallback({ className, children }) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-muted text-sm font-medium",
        className,
      )}
    >
      {children}
    </div>
  );
}
