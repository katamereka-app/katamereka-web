"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Loader2Icon, LockIcon, RefreshCwIcon, ShieldAlertIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { checkCmsAccess } from "@/lib/cms-api"

type AccessState = "checking" | "ok" | "unauthenticated" | "forbidden" | "error"

/**
 * Blocks every /admin/cms page unless the backend confirms the current token
 * belongs to a SUPER_ADMIN. The API enforces this too; the gate just keeps
 * non-super-admins from seeing an editor whose every save would 403.
 */
export function CmsAccessGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [state, setState] = React.useState<AccessState>("checking")
  const [attempt, setAttempt] = React.useState(0)

  React.useEffect(() => {
    let ignore = false
    checkCmsAccess().then((result) => {
      if (!ignore) setState(result)
    })
    return () => {
      ignore = true
    }
  }, [attempt])

  if (state === "ok") return <>{children}</>

  if (state === "checking") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2Icon className="size-4 animate-spin" />
        Memeriksa akses Super Admin…
      </div>
    )
  }

  const content = {
    unauthenticated: {
      icon: LockIcon,
      title: "Sesi login diperlukan",
      description: "Masuk dengan akun Super Admin untuk mengelola konten CMS.",
      action: (
        <Button render={<Link href={`/login?redirect=${encodeURIComponent(pathname)}`} />}>Masuk</Button>
      ),
    },
    forbidden: {
      icon: ShieldAlertIcon,
      title: "Khusus Super Admin",
      description: "Akun Anda tidak memiliki izin untuk mengakses CMS. Hubungi Super Admin jika Anda membutuhkan akses.",
      action: <Button variant="outline" render={<Link href="/admin" />}>Kembali ke Overview</Button>,
    },
    error: {
      icon: ShieldAlertIcon,
      title: "Tidak dapat memeriksa akses",
      description: "Server CMS tidak merespons. Periksa koneksi lalu coba lagi.",
      action: (
        <Button
          variant="outline"
          onClick={() => {
            setState("checking")
            setAttempt((n) => n + 1)
          }}
        >
          <RefreshCwIcon />
          Coba lagi
        </Button>
      ),
    },
  }[state]

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <content.icon className="size-6" />
      </span>
      <div>
        <p className="text-base font-semibold text-foreground">{content.title}</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{content.description}</p>
      </div>
      {content.action}
    </div>
  )
}
