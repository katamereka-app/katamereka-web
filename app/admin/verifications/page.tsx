"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import { ExternalLinkIcon, HomeIcon, ShieldCheckIcon } from "lucide-react"

import { ConfirmDialog } from "@/components/confirm-dialog"
import { PageHeader } from "@/components/page-header"
import { ResourceTable, type ResourceTableColumn } from "@/components/resource-table"
import { StatusBadge } from "@/components/status-badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDateTime } from "@/lib/format"
import {
  fetchAdminBusinessClaims,
  fetchAdminBusinessClaimDetail,
  approveBusinessClaim,
  rejectBusinessClaim,
  type ApiAdminBusinessClaim,
  type ApiAdminBusinessClaimDetail,
  type BusinessClaimStatus,
} from "@/lib/api-client"

const TABS: { value: BusinessClaimStatus; label: string }[] = [
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
]

export default function AdminVerificationsPage() {
  const [tab, setTab] = React.useState<BusinessClaimStatus>("PENDING")
  const [claims, setClaims] = React.useState<ApiAdminBusinessClaim[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | undefined>()

  const [detailId, setDetailId] = React.useState<string | null>(null)
  const [detail, setDetail] = React.useState<ApiAdminBusinessClaimDetail | null>(null)
  const [detailLoading, setDetailLoading] = React.useState(false)
  const [dialog, setDialog] = React.useState<"APPROVE" | "REJECT" | null>(null)
  const [actionLoading, setActionLoading] = React.useState(false)

  const loadClaims = React.useCallback(async (status: BusinessClaimStatus) => {
    setIsLoading(true)
    setError(undefined)
    try {
      const res = await fetchAdminBusinessClaims({ status, limit: 100 })
      setClaims(res.data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat daftar klaim bisnis")
    } finally {
      setIsLoading(false)
    }
  }, [])

  // loadClaims flips the loading flag before its first await so the table can
  // show a spinner immediately; the rest of the update happens post-fetch.
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadClaims(tab)
  }, [tab, loadClaims])

  React.useEffect(() => {
    if (!detailId) {
      // Reset the stale detail right away when the sheet closes.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDetail(null)
      return
    }
    let cancelled = false
    setDetailLoading(true)
    fetchAdminBusinessClaimDetail(detailId)
      .then((d) => {
        if (!cancelled) setDetail(d)
      })
      .catch((e) => {
        if (!cancelled) toast.error(e instanceof Error ? e.message : "Gagal memuat detail klaim")
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [detailId])

  const columns: ResourceTableColumn<ApiAdminBusinessClaim>[] = [
    {
      key: "businessName",
      header: "Business",
      sortValue: (r) => r.business?.name ?? "",
      render: (claim) => (
        <span className="font-medium text-foreground">{claim.business?.name ?? "-"}</span>
      ),
    },
    {
      key: "submittedBy",
      header: "Submitted By",
      render: (claim) => (
        <div className="flex flex-col">
          <span>{claim.user?.name ?? "-"}</span>
          <span className="text-xs text-muted-foreground">{claim.user?.email}</span>
        </div>
      ),
    },
    {
      key: "verificationMethod",
      header: "Method",
      render: (claim) => claim.verification_method ?? "-",
    },
    {
      key: "submittedAt",
      header: "Submitted At",
      sortValue: (r) => r.created_at,
      render: (claim) => (
        <span className="text-muted-foreground">{formatDateTime(claim.created_at)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (claim) => <StatusBadge status={claim.status} />,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (claim) => (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={() => setDetailId(claim.id)}>
            Review
          </Button>
        </div>
      ),
    },
  ]

  async function handleApprove(adminNotes?: string) {
    if (!detailId) return
    setActionLoading(true)
    try {
      const res = await approveBusinessClaim(detailId, adminNotes)
      if (res.success) {
        toast.success(res.message || `${detail?.business?.name ?? "Klaim"} berhasil disetujui.`)
        setDetailId(null)
        loadClaims(tab)
      } else {
        toast.error(res.message)
      }
    } finally {
      setActionLoading(false)
    }
  }

  async function handleReject(adminNotes?: string) {
    if (!detailId) return
    setActionLoading(true)
    try {
      const res = await rejectBusinessClaim(detailId, adminNotes)
      if (res.success) {
        toast.success(res.message || `Klaim ${detail?.business?.name ?? ""} ditolak.`)
        setDetailId(null)
        loadClaims(tab)
      } else {
        toast.error(res.message)
      }
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/admin" />}>
              <HomeIcon className="size-3.5" />
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Verifications</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PageHeader
        title="Verification Management"
        description="Proses pengajuan klaim bisnis di KataMereka."
      />

      <Tabs
        value={tab}
        onValueChange={(v) => typeof v === "string" && setTab(v as BusinessClaimStatus)}
      >
        <TabsList>
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <ResourceTable
        data={claims}
        columns={columns}
        getRowId={(claim) => claim.id}
        isLoading={isLoading}
        error={error}
        emptyTitle="Tidak ada pengajuan pada kategori ini."
      />

      <Sheet open={!!detailId} onOpenChange={(open) => !open && setDetailId(null)}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{detail?.business?.name ?? "Memuat..."}</SheetTitle>
            <SheetDescription>
              Diajukan oleh {detail?.user?.name} ({detail?.user?.email})
            </SheetDescription>
          </SheetHeader>
          {detailLoading && (
            <p className="px-4 text-sm text-muted-foreground">Memuat detail klaim...</p>
          )}
          {detail && !detailLoading && (
            <div className="flex flex-col gap-5 overflow-y-auto px-4 pb-4">
              <section>
                <h3 className="mb-2 text-xs font-medium text-muted-foreground uppercase">
                  Verifikasi
                </h3>
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex items-center justify-between rounded-lg border border-border p-2.5">
                    <span className="text-muted-foreground">Metode</span>
                    <span className="font-medium">{detail.verification_method ?? "-"}</span>
                  </div>
                  {detail.proof_url && (
                    <a
                      href={detail.proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-lg border border-border p-2.5 hover:border-primary"
                    >
                      <span className="flex items-center gap-2 text-foreground/90">
                        <ExternalLinkIcon className="size-4 text-muted-foreground" />
                        Bukti kepemilikan
                      </span>
                    </a>
                  )}
                  {detail.message && (
                    <div className="rounded-lg border border-border p-2.5">
                      <p className="mb-1 text-xs text-muted-foreground">Pesan pengklaim</p>
                      <p className="text-foreground/90">{detail.message}</p>
                    </div>
                  )}
                </div>
              </section>

              <section>
                <h3 className="mb-2 text-xs font-medium text-muted-foreground uppercase">
                  Riwayat
                </h3>
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground/90">Diajukan</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(detail.created_at)}
                    </span>
                  </div>
                  {detail.reviewed_at && (
                    <div className="flex items-center justify-between">
                      <span className="text-foreground/90">
                        Ditinjau oleh {detail.reviewed_by?.name ?? "-"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(detail.reviewed_at)}
                      </span>
                    </div>
                  )}
                  {detail.admin_notes && (
                    <div className="rounded-lg border border-border p-2.5">
                      <p className="mb-1 text-xs text-muted-foreground">Catatan admin</p>
                      <p className="text-foreground/90">{detail.admin_notes}</p>
                    </div>
                  )}
                </div>
              </section>

              {detail.status === "PENDING" && (
                <div className="flex justify-end gap-2">
                  <Button variant="destructive" onClick={() => setDialog("REJECT")}>
                    Reject
                  </Button>
                  <Button onClick={() => setDialog("APPROVE")}>
                    <ShieldCheckIcon />
                    Approve
                  </Button>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!dialog}
        onOpenChange={(open) => !open && setDialog(null)}
        title={
          dialog === "APPROVE"
            ? `Setujui klaim ${detail?.business?.name ?? ""}?`
            : `Tolak klaim ${detail?.business?.name ?? ""}?`
        }
        description={
          dialog === "APPROVE"
            ? "Pengklaim akan menjadi OWNER bisnis ini dan bisnis berstatus CLAIMED."
            : undefined
        }
        confirmLabel={actionLoading ? "Memproses..." : dialog === "APPROVE" ? "Approve" : "Reject"}
        variant={dialog === "APPROVE" ? "default" : "destructive"}
        requireReason={dialog === "REJECT"}
        reasonLabel="Alasan penolakan"
        onConfirm={(reason) => {
          if (dialog === "APPROVE") {
            handleApprove(reason)
          } else {
            handleReject(reason)
          }
        }}
      />
    </div>
  )
}
