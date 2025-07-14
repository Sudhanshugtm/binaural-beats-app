import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 relative overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-gradient-start via-gradient-middle to-gradient-end text-primary-foreground hover:from-gradient-start/90 hover:via-gradient-middle/90 hover:to-gradient-end/90 shadow-zen-md hover:shadow-zen-lg hover:scale-[1.02] active:scale-[0.98] font-semibold border-2 border-primary/20 hover:border-primary/40 backdrop-blur-sm",
        destructive:
          "bg-gradient-to-r from-destructive to-destructive/90 text-destructive-foreground hover:from-destructive/90 hover:to-destructive/80 shadow-zen-md hover:shadow-zen-lg hover:scale-[1.02] active:scale-[0.98] border-2 border-destructive/20 hover:border-destructive/40 backdrop-blur-sm",
        outline:
          "border-2 border-primary/40 bg-background/80 backdrop-blur-sm hover:bg-primary/10 hover:text-primary hover:border-primary/60 hover:shadow-zen-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
        secondary:
          "bg-gradient-to-r from-secondary to-secondary/90 text-secondary-foreground hover:from-secondary/90 hover:to-secondary/80 shadow-zen-sm hover:shadow-zen-md hover:scale-[1.02] active:scale-[0.98] border-2 border-secondary/20 hover:border-secondary/40 backdrop-blur-sm",
        ghost: "hover:bg-primary/10 hover:text-primary hover:shadow-zen-sm hover:scale-[1.02] active:scale-[0.98] backdrop-blur-sm",
        link: "text-primary underline-offset-4 hover:underline font-bold hover:scale-[1.02] active:scale-[0.98]",
      },
      size: {
        default: "h-11 px-5 py-2 text-base",
        sm: "h-10 rounded-md px-4 text-base",
        lg: "h-12 rounded-md px-8 text-lg",
        icon: "h-11 w-11 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {/* Shimmer effect overlay */}
        <span className="absolute inset-0 -top-[1px] -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-all duration-700 group-hover:left-[100%] pointer-events-none" />
        {props.children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }