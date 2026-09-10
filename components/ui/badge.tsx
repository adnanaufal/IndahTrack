import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive/15 text-destructive border-destructive/20 hover:bg-destructive/20",
        outline: "text-foreground border-border",
        success:
          "border-emerald-500/25 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold",
        warning:
          "border-amber-500/25 bg-amber-500/15 text-amber-700 dark:text-amber-300 font-semibold",
        info:
          "border-sky-500/20 bg-sky-500/15 text-sky-600 dark:text-sky-400",
        purple:
          "border-purple-500/20 bg-purple-500/15 text-purple-600 dark:text-purple-400",
        rose:
          "border-rose-500/25 bg-rose-500/15 text-rose-700 dark:text-rose-300 font-semibold",
        pink:
          "border-pink-500/25 bg-pink-500/15 text-pink-700 dark:text-pink-300 font-semibold",
        mocha:
          "border-amber-900/25 bg-amber-950/10 text-amber-950 dark:text-amber-200 font-semibold",
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

export { Badge, badgeVariants }
