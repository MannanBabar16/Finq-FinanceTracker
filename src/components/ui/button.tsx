import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-medium transition-[transform,box-shadow,background-color,border-color,color] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.985] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_14px_36px_-20px_hsl(var(--foreground)/0.45)] hover:translate-y-[-1px] hover:bg-primary/92 hover:shadow-[0_18px_38px_-22px_hsl(var(--foreground)/0.52)]",
        secondary:
          "panel-strong text-secondary-foreground hover:translate-y-[-1px] hover:bg-secondary/80 hover:shadow-[0_16px_34px_-24px_hsl(var(--foreground)/0.32)]",
        outline:
          "border border-border/80 bg-background/35 hover:translate-y-[-1px] hover:border-border hover:bg-secondary/60 hover:shadow-[0_14px_34px_-24px_hsl(var(--foreground)/0.25)]",
        ghost: "hover:translate-y-[-1px] hover:bg-secondary/70",
        destructive: "bg-destructive text-destructive-foreground hover:translate-y-[-1px] hover:bg-destructive/90",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-xl px-3",
        lg: "h-11 px-6",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }), "surface-shine")}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
