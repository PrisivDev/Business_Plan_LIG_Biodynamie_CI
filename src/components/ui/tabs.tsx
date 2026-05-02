"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "relative inline-flex h-auto w-fit flex-wrap items-center justify-start gap-1 rounded-2xl p-1.5",
        "bg-[#0C1F1A]/[0.04]",
        "shadow-[inset_0_1px_3px_rgba(0,0,0,0.03)]",
        "border border-[#0C1F1A]/[0.04]",
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "group relative z-10 inline-flex items-center justify-center gap-1.5 whitespace-nowrap",
        "rounded-[10px] px-4 py-2 text-[13px] font-medium leading-5",
        "transition-all duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)]",
        "cursor-pointer select-none",

        /* ── Inactive ── */
        "text-[#5B6B7D]/50",
        "hover:text-[#2A3A4D]",
        "hover:bg-white/40",

        /* ── Active ── */
        "data-[state=active]:bg-white",
        "data-[state=active]:text-[#0C1F1A]",
        "data-[state=active]:font-semibold",
        "data-[state=active]:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_14px_rgba(61,219,181,0.12)]",
        "data-[state=active]:ring-1 data-[state=active]:ring-[#3DDBB5]/20",

        /* ── Focus ── */
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3DDBB5]/40",

        /* ── Disabled ── */
        "disabled:pointer-events-none disabled:opacity-40",

        /* ── Icons ── */
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",

        /* ── Accent bar: bottom gradient pill ── */
        "after:absolute after:bottom-[1px] after:left-1/2 after:-translate-x-1/2",
        "after:h-[3px] after:w-0 after:rounded-full",
        "after:bg-gradient-to-r after:from-[#3DDBB5] after:via-[#2A7A65] after:to-[#3DDBB5]",
        "after:transition-all after:duration-300 after:ease-[cubic-bezier(0.34,1.56,0.64,1)]",
        "data-[state=active]:after:w-6",
        "hover:after:w-3",
        "after:opacity-0 hover:after:opacity-40 data-[state=active]:after:opacity-100",

        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
