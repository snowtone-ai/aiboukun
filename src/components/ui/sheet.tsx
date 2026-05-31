"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;
const SheetPortal = SheetPrimitive.Portal;

function SheetOverlay({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return <SheetPrimitive.Overlay className={cn("fixed inset-0 z-50 bg-black/40", className)} {...props} />;
}

function SheetContent({ className, children, side = "right", ...props }: React.ComponentProps<typeof SheetPrimitive.Content> & { side?: "top" | "right" | "bottom" | "left" }) {
  const sides = {
    top: "inset-x-0 top-0 border-b",
    right: "inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
    bottom: "inset-x-0 bottom-0 border-t",
    left: "inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
  };
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content className={cn("fixed z-50 bg-card p-6 shadow-lg", sides[side], className)} {...props}>
        {children}
        <SheetPrimitive.Close className="absolute right-4 top-4 rounded-full p-1 opacity-70 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <X className="size-4" />
          <span className="sr-only">閉じる</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

const SheetHeader = ({ className, ...props }: React.ComponentProps<"div">) => <div className={cn("flex flex-col gap-2 text-left", className)} {...props} />;
const SheetFooter = ({ className, ...props }: React.ComponentProps<"div">) => <div className={cn("mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end", className)} {...props} />;
const SheetTitle = ({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) => <SheetPrimitive.Title className={cn("text-lg font-semibold", className)} {...props} />;
const SheetDescription = ({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Description>) => <SheetPrimitive.Description className={cn("text-sm text-muted-foreground", className)} {...props} />;

export { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetOverlay, SheetPortal, SheetTitle, SheetTrigger };
