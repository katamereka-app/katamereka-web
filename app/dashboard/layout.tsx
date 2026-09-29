import type { Metadata } from "next"
import { BusinessProvider } from "@/components/business-provider"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { DashboardSidebar } from "@/components/dashboard-sidebar"

// Gated app area (see middleware.ts for the server-side auth redirect) —
// never index, and don't let external links pass authority into it either.
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <BusinessProvider>
      <DashboardShell
        sidebar={<DashboardSidebar variant="inset" />}
        header={<DashboardHeader />}
      >
        {children}
      </DashboardShell>
    </BusinessProvider>
  )
}
