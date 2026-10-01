"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { CalendarIcon, LogOutIcon, MoonIcon, SunIcon } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useAuth } from "@/lib/auth-context"

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
})

export function ProfileSidebar({
  trigger,
}: {
  trigger: React.ReactNode
}) {
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  const [open, setOpen] = React.useState(false)

  const handleLogout = () => {
    setOpen(false)
    logout()
    router.push("/")
  }

  const today = dateFormatter.format(new Date())

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={trigger as React.ReactElement} />
      <SheetContent className="flex flex-col gap-0 p-0">
        <SheetHeader className="border-b">
          <SheetTitle>Profil Pengguna</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-6 overflow-y-auto p-4">
          <div className="flex items-center gap-3 rounded-xl border p-3">
            <Avatar size="lg" className="bg-primary text-primary-foreground">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user?.initials ?? "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="truncate text-sm font-medium text-foreground">
                {user?.name}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {user?.email}
              </span>
              <Badge variant="secondary" className="w-fit capitalize">
                {user?.role === "bisnis" ? "Business Admin" : user?.role}
              </Badge>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Pengaturan Aplikasi
            </p>

            <Select
              value={theme ?? "light"}
              onValueChange={(value) => value && setTheme(value)}
            >
              <SelectTrigger className="h-auto w-full justify-between rounded-xl border px-3 py-2.5">
                <span className="flex items-center gap-2">
                  {theme === "dark" ? (
                    <MoonIcon className="size-4 text-muted-foreground" />
                  ) : (
                    <SunIcon className="size-4 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium">Tema Tampilan</span>
                </span>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <SunIcon /> Bright
                </SelectItem>
                <SelectItem value="dark">
                  <MoonIcon /> Dark
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5 rounded-xl border p-3">
            <span className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              <CalendarIcon className="size-3.5" />
              Tanggal Sekarang
            </span>
            <span className="text-sm font-medium text-foreground capitalize">{today}</span>
          </div>
        </div>

        <SheetFooter className="mt-auto border-t">
          <Button variant="destructive" className="w-full" onClick={handleLogout}>
            <LogOutIcon />
            Keluar Akun
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
