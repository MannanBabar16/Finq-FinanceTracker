import * as AvatarPrimitive from "@radix-ui/react-avatar";
import * as React from "react";
import { cn, getInitials } from "@/lib/utils";

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root ref={ref} className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)} {...props} />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image ref={ref} className={cn("aspect-square h-full w-full", className)} {...props} />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

function AvatarFallback({ className, label = "U", ...props }: React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback> & { label?: string }) {
  return (
    <AvatarPrimitive.Fallback className={cn("flex h-full w-full items-center justify-center bg-primary/20 text-sm font-semibold text-primary", className)} {...props}>
      {getInitials(label)}
    </AvatarPrimitive.Fallback>
  );
}

export { Avatar, AvatarFallback, AvatarImage };
