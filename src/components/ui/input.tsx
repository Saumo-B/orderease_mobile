
import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    if (type === 'color') {
      return (
        <input
          type={type}
          className={cn(
            "p-0 border-none cursor-pointer",
            "w-6 h-6 rounded-md",
            "appearance-none bg-transparent",
            "[&::-webkit-color-swatch-wrapper]:p-0",
            "[&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border",
            className
          )}
          ref={ref}
          {...props}
        />
      )
    }
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }

    