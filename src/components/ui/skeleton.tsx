import * as React from "react"
import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse bg-[#78716C]/15 rounded-md", className)}
      {...props}
    />
  )
}

export { Skeleton }
