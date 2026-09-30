"use client"

import * as React from "react"
import { cn } from "cn"

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export const isMac =
  typeof navigator !== "undefined" && /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent)

/** Renders "Mod-Shift-X" as ⌘⇧X on macOS and Ctrl+Shift+X elsewhere. */
export function formatShortcut(shortcut: string) {
  const parts = shortcut.split("-")
  if (isMac) {
    return parts
      .map((p) =>
        p === "Mod" ? "⌘" : p === "Shift" ? "⇧" : p === "Alt" ? "⌥" : p === "Ctrl" ? "⌃" : p.toUpperCase()
      )
      .join("")
  }
  return parts.map((p) => (p === "Mod" ? "Ctrl" : p.length === 1 ? p.toUpperCase() : p)).join("+")
}

export const ToolbarButton = React.forwardRef<
  HTMLButtonElement,
  {
    label: string
    shortcut?: string
    active?: boolean
    disabled?: boolean
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
    /** Optional: when used as a `render` element the trigger supplies children. */
    children?: React.ReactNode
    className?: string
  } & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick">
>(function ToolbarButton({ label, shortcut, active, disabled, onClick, children, className, ...rest }, ref) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            ref={ref}
            type="button"
            aria-label={label}
            aria-pressed={active}
            disabled={disabled}
            // Keep the editor selection when clicking toolbar buttons.
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClick}
            className={cn(
              "inline-flex h-8 min-w-8 shrink-0 items-center justify-center gap-1 rounded-md px-1.5 text-sm text-foreground/80 transition-colors outline-none",
              "hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50",
              "disabled:pointer-events-none disabled:opacity-40",
              "[&_svg]:size-4 [&_svg]:shrink-0",
              active && "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary",
              className
            )}
            {...rest}
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <span>{label}</span>
        {shortcut && <span className="ml-1 opacity-60">{formatShortcut(shortcut)}</span>}
      </TooltipContent>
    </Tooltip>
  )
})

export function ToolbarSeparator() {
  return <span aria-hidden className="mx-0.5 h-6 w-px shrink-0 bg-border" />
}

export function ToolbarGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-0.5">{children}</div>
}
