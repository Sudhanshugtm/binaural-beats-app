"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Circle } from "lucide-react";
import { cn } from "@/lib/utils";

const CustomRadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn("grid gap-2", className)}
      {...props}
      ref={ref}
    />
  );
});
CustomRadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const CustomRadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, children, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "group relative w-full rounded-lg border-2 border-transparent bg-black/20 p-4 transition-all hover:border-purple-500/50 hover:bg-black/30 data-[state=checked]:border-purple-500 data-[state=checked]:bg-black/40",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-x-2">
        <div className="aspect-square h-4 w-4 rounded-full border border-purple-500/50 group-hover:border-purple-500">
          <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
            <Circle className="h-2.5 w-2.5 fill-purple-500 text-current" />
          </RadioGroupPrimitive.Indicator>
        </div>
        {children}
      </div>
    </RadioGroupPrimitive.Item>
  );
});
CustomRadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

export { CustomRadioGroup, CustomRadioGroupItem };