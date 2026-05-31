"use client";

import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const Command = ({ className, ...props }: React.ComponentProps<typeof CommandPrimitive>) => (
  <CommandPrimitive className={cn("flex h-full w-full flex-col overflow-hidden rounded-lg bg-popover text-popover-foreground", className)} {...props} />
);

function CommandDialog({ children, ...props }: React.ComponentProps<typeof Dialog>) {
  return (
    <Dialog {...props}>
      <DialogContent className="overflow-hidden p-0">
        <Command>{children}</Command>
      </DialogContent>
    </Dialog>
  );
}

function CommandInput({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div className="flex items-center border-b px-3">
      <Search className="mr-2 size-4 shrink-0 opacity-50" />
      <CommandPrimitive.Input className={cn("flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50", className)} {...props} />
    </div>
  );
}

const CommandList = ({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.List>) => <CommandPrimitive.List className={cn("max-h-72 overflow-y-auto overflow-x-hidden", className)} {...props} />;
const CommandEmpty = (props: React.ComponentProps<typeof CommandPrimitive.Empty>) => <CommandPrimitive.Empty className="py-6 text-center text-sm" {...props} />;
const CommandGroup = ({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Group>) => <CommandPrimitive.Group className={cn("overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground", className)} {...props} />;
const CommandSeparator = ({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Separator>) => <CommandPrimitive.Separator className={cn("-mx-1 h-px bg-border", className)} {...props} />;

function CommandItem({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return <CommandPrimitive.Item className={cn("relative flex cursor-default select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent-light data-[disabled=true]:opacity-50", className)} {...props} />;
}

const CommandShortcut = ({ className, ...props }: React.ComponentProps<"span">) => <span className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)} {...props} />;

export { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut };
