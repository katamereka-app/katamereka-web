"use client"

import * as React from "react"
import Link from "next/link"
import {
  BarChart3Icon,
  BuildingIcon,
  CircleHelpIcon,
  DatabaseIcon,
  ExternalLinkIcon,
  FileTextIcon,
  FlagIcon,
  FolderTreeIcon,
  HashIcon,
  ImagesIcon,
  LayoutDashboardIcon,
  ScrollTextIcon,
  SearchIcon,
  SettingsIcon,
  ShieldIcon,
  StarIcon,
  UserCogIcon,
  UsersIcon,
} from "lucide-react"

import { NavGroup } from "@/components/nav-group"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const navGroups = [
  {
    items: [{ title: "Overview", url: "/admin", icon: LayoutDashboardIcon }],
  },
  {
    label: "Platform",
    items: [
      { title: "Admin Management", url: "/admin/customers", icon: UserCogIcon },
      { title: "User Management", url: "/admin/users", icon: UsersIcon },
      { title: "Businesses", url: "/admin/businesses", icon: BuildingIcon },
      { title: "Reviews", url: "/admin/reviews", icon: StarIcon },
    ],
  },
  {
    label: "Trust & Safety",
    items: [{ title: "Trust & Safety", url: "/admin/trust-safety", icon: FlagIcon }],
  },
  {
    label: "Konten (CMS)",
    items: [
      { title: "Konten", url: "/admin/cms/contents", icon: FileTextIcon },
      { title: "Kategori", url: "/admin/cms/categories", icon: FolderTreeIcon },
      { title: "Tag", url: "/admin/cms/tags", icon: HashIcon },
      { title: "Media Library", url: "/admin/cms/media", icon: ImagesIcon },
    ],
  },
  {
    label: "Management",
    items: [
      { title: "Master Data", url: "/admin/master-data", icon: DatabaseIcon },
      { title: "Analytics", url: "/admin/analytics", icon: BarChart3Icon },
    ],
  },
  {
    label: "System",
    items: [
      { title: "Audit Logs", url: "/admin/audit-logs", icon: ScrollTextIcon },
      { title: "System", url: "/admin/system", icon: SettingsIcon },
    ],
  },
]

export function AdminSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const [query, setQuery] = React.useState("")

  const filteredGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        item.title.toLowerCase().includes(query.trim().toLowerCase())
      ),
    }))
    .filter((group) => group.items.length > 0)

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="gap-3 px-3 pt-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<Link href="/admin" />}
            >
              <ShieldIcon className="size-5!" />
              <div className="flex flex-col leading-none">
                <span className="text-base font-semibold">KataMereka</span>
                <span className="text-[11px] font-medium text-muted-foreground">
                  Super Admin
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari menu..."
            className="h-9 w-full rounded-lg bg-secondary pl-8 text-sm"
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        {filteredGroups.length === 0 ? (
          <p className="px-4 py-6 text-center text-xs text-muted-foreground">
            Menu &ldquo;{query}&rdquo; tidak ditemukan.
          </p>
        ) : (
          filteredGroups.map((group, index) => (
            <NavGroup key={group.label ?? index} label={group.label} items={group.items} />
          ))
        )}
      </SidebarContent>
      <SidebarFooter className="p-3">
        <div className="flex flex-col gap-2 rounded-xl border border-border p-4">
          <CircleHelpIcon className="size-5 text-primary" />
          <p className="text-sm font-semibold text-foreground">Butuh bantuan?</p>
          <p className="text-xs text-muted-foreground">
            Lihat dokumentasi atau hubungi tim support internal.
          </p>
          <Button variant="outline" size="sm" className="mt-1">
            Buka Dokumentasi
            <ExternalLinkIcon />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
