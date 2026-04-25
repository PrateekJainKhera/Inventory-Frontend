'use client'

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 truncate",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Department-style badge with CSS variables
        department:
          "border-transparent bg-[color-mix(in_srgb,rgb(var(--color-primary))_10%,white)] text-[rgb(var(--color-primary))]",
        // Module type style badge
        module:
          "border-transparent bg-[color-mix(in_srgb,rgb(var(--color-purple))_10%,white)] text-[rgb(var(--color-purple))]",
        // Status badges
        success:
          "border-transparent bg-[rgb(var(--color-success-subtle))] text-[rgb(var(--color-success))]",
        warning:
          "border-transparent bg-yellow-100 text-yellow-800",
        danger:
          "border-transparent bg-red-100 text-red-800",
        info:
          "border-transparent bg-blue-100 text-blue-800",
        // Additional color variants for departments
        purple:
          "border-transparent bg-purple-100 text-purple-800",
        pink:
          "border-transparent bg-pink-100 text-pink-800",
        orange:
          "border-transparent bg-orange-100 text-orange-800",
        teal:
          "border-transparent bg-teal-100 text-teal-800",
        cyan:
          "border-transparent bg-cyan-100 text-cyan-800",
        indigo:
          "border-transparent bg-indigo-100 text-indigo-800",
        violet:
          "border-transparent bg-violet-100 text-violet-800",
        amber:
          "border-transparent bg-amber-100 text-amber-800",
        lime:
          "border-transparent bg-lime-100 text-lime-800",
        emerald:
          "border-transparent bg-emerald-100 text-emerald-800",
        sky:
          "border-transparent bg-sky-100 text-sky-800",
        rose:
          "border-transparent bg-rose-100 text-rose-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

Badge.displayName = 'Badge'

export { Badge, badgeVariants }