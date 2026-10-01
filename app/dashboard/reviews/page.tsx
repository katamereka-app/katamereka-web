"use client"

import * as React from "react"
import {
  DownloadIcon,
  FlagIcon,
  MessageSquareTextIcon,
  SlidersHorizontalIcon,
  StarIcon,
} from "lucide-react"
import { toast } from "sonner"

import { DashboardBreadcrumb } from "@/components/dashboard-breadcrumb"
import { DateRangeSelector } from "@/components/date-range-selector"
import { FilterDropdown } from "@/components/filter-dropdown"
import { PageHeader } from "@/components/page-header"
import { RatingStars } from "@/components/rating-stars"
import { ResourceTable, type ResourceTableColumn } from "@/components/resource-table"
import { ReviewDetailPanel } from "@/components/review-detail-panel"
import { SearchInput } from "@/components/search-input"
import { StatCard } from "@/components/stat-card"
import { StatusBadge } from "@/components/status-badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { downloadCsv } from "@/lib/csv"
import { formatDateTime } from "@/lib/format"
import { useAuth } from "@/lib/auth-context"
import {
  createReviewReply,
  fetchDashboardReviews,
  fetchMyBusinessDetail,
  fetchMyBusinesses,
  fetchReviewReportsSummary,
  type ApiDashboardReview,
  type DashboardReviewSource,
  type DashboardReviewsQuery,
} from "@/lib/api-business-dashboard"
import type { ModerationStatus, Review } from "@/lib/types"

// This page is the one menu wired to the real backend — everything else in
// the dashboard still runs on the mock BusinessProvider (see business-provider.tsx),
// so it resolves its own active business via /my-businesses instead of
// useBusinessContext(), which would hand it a fake mock id like "b1".
interface ActiveBusiness {
  id: string
  name: string
  slug: string
  averageRating: number
  totalReviews: number
}

const TABS = [
  { value: "all", label: "Semua" },
  { value: "unreplied", label: "Belum Dibalas" },
  { value: "reported", label: "Dilaporkan" },
] as const

const RATING_OPTIONS = [
  { value: "all", label: "Semua Rating" },
  { value: "5", label: "5 Bintang" },
  { value: "4", label: "4 Bintang" },
  { value: "3", label: "3 Bintang" },
  { value: "2", label: "2 Bintang" },
  { value: "1", label: "1 Bintang" },
]

const STATUS_OPTIONS = [
  { value: "all", label: "Semua Status" },
  { value: "Dibalas", label: "Dibalas" },
  { value: "Belum Dibalas", label: "Belum Dibalas" },
  { value: "Dilaporkan", label: "Dilaporkan" },
]

const VERIFIED_OPTIONS = [
  { value: "all", label: "Semua Verifikasi" },
  { value: "verified", label: "Verified" },
  { value: "unverified", label: "Unverified" },
]

const SOURCE_LABEL: Record<DashboardReviewSource, "Google" | "Website" | "KataMereka"> = {
  GOOGLE: "Google",
  WEBSITE: "Website",
  KATAMEREKA: "KataMereka",
}

function reviewStatus(review: Review): "Dibalas" | "Belum Dibalas" | "Dilaporkan" {
  if (review.reportCount > 0) return "Dilaporkan"
  if (review.reply) return "Dibalas"
  return "Belum Dibalas"
}

function moderationStatusOf(review: ApiDashboardReview): ModerationStatus {
  if (review.status === "HIDDEN") return "HIDDEN"
  if (review.status === "REMOVED") return "REMOVED"
  if (review.report_count > 0) return "UNDER_INVESTIGATION"
  return "KEPT"
}

function mapApiReviewToUiReview(r: ApiDashboardReview, business: ActiveBusiness): Review {
  return {
    id: r.id,
    businessId: business.id,
    businessName: business.name,
    reviewerId: r.user?.id ?? "",
    reviewerName: r.user?.name ?? "Pengguna KataMereka",
    rating: Math.min(5, Math.max(1, r.rating)) as 1 | 2 | 3 | 4 | 5,
    content: r.content,
    isVerified: r.is_verified,
    status: r.status,
    moderationStatus: moderationStatusOf(r),
    reportCount: r.report_count,
    source: SOURCE_LABEL[r.source],
    reply: r.reply
      ? {
          content: r.reply.content,
          repliedAt: r.reply.created_at,
          repliedBy: r.reply.author?.name ?? "Admin Bisnis",
        }
      : undefined,
    createdAt: r.created_at,
  }
}

export default function DashboardReviewsPage() {
  const { isLoggedIn } = useAuth()
  const [activeBusiness, setActiveBusiness] = React.useState<ActiveBusiness | null>(null)
  const [isBusinessLoading, setIsBusinessLoading] = React.useState(true)
  const [tab, setTab] = React.useState<string>("all")
  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [ratingFilter, setRatingFilter] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [verifiedFilter, setVerifiedFilter] = React.useState("all")
  const [advancedOpen, setAdvancedOpen] = React.useState(false)
  const [sourceFilter, setSourceFilter] = React.useState("all")
  const [selectedId, setSelectedId] = React.useState<string | null>(null)

  const [apiReviews, setApiReviews] = React.useState<ApiDashboardReview[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [loadError, setLoadError] = React.useState<string | undefined>()
  const [unrepliedCount, setUnrepliedCount] = React.useState(0)
  const [reportedCount, setReportedCount] = React.useState(0)
  const [refreshKey, setRefreshKey] = React.useState(0)

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => clearTimeout(timer)
  }, [search])

  React.useEffect(() => {
    let cancelled = false

    if (!isLoggedIn) {
      setActiveBusiness(null)
      setIsBusinessLoading(false)
      return
    }

    setIsBusinessLoading(true)
    ;(async () => {
      const mine = await fetchMyBusinesses()
      if (cancelled) return

      const first = mine[0]
      if (!first) {
        setActiveBusiness(null)
        setIsBusinessLoading(false)
        return
      }

      const detail = await fetchMyBusinessDetail(first.id)
      if (cancelled) return

      setActiveBusiness({
        id: first.id,
        name: detail?.name ?? first.name,
        slug: detail?.slug ?? first.slug,
        averageRating: Number(detail?.averageRating ?? detail?.rating ?? 0) || 0,
        totalReviews: Number(detail?.reviewCount ?? detail?.reviews_count ?? 0) || 0,
      })
      setIsBusinessLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [isLoggedIn])

  const businessId = activeBusiness?.id

  const query = React.useMemo<DashboardReviewsQuery>(() => {
    const reported = tab === "reported" || statusFilter === "Dilaporkan"
    let reply_status: DashboardReviewsQuery["reply_status"] = "ALL"
    if (tab === "unreplied" || statusFilter === "Belum Dibalas") reply_status = "UNREPLIED"
    else if (statusFilter === "Dibalas") reply_status = "REPLIED"

    return {
      limit: 200,
      sort: "NEWEST",
      rating: ratingFilter !== "all" ? Number(ratingFilter) : undefined,
      reply_status,
      reported: reported || undefined,
      verified: verifiedFilter === "verified" ? true : verifiedFilter === "unverified" ? false : undefined,
      source: sourceFilter !== "all" ? (sourceFilter.toUpperCase() as DashboardReviewSource) : undefined,
      search: debouncedSearch || undefined,
    }
  }, [tab, ratingFilter, statusFilter, verifiedFilter, sourceFilter, debouncedSearch])

  React.useEffect(() => {
    if (!businessId) return
    let cancelled = false
    setIsLoading(true)
    setLoadError(undefined)

    fetchDashboardReviews(businessId, query)
      .then((res) => {
        if (cancelled) return
        setApiReviews(res.data)
      })
      .catch(() => {
        if (!cancelled) setLoadError("Gagal memuat review. Coba muat ulang halaman.")
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [businessId, query, refreshKey])

  React.useEffect(() => {
    if (!businessId) return
    let cancelled = false

    Promise.all([
      fetchDashboardReviews(businessId, { reply_status: "UNREPLIED", limit: 1 }),
      fetchReviewReportsSummary(businessId),
    ]).then(([unreplied, reports]) => {
      if (cancelled) return
      setUnrepliedCount(unreplied.pagination.total)
      setReportedCount(reports.pending)
    })

    return () => {
      cancelled = true
    }
  }, [businessId, refreshKey])

  if (isBusinessLoading) return null
  if (!activeBusiness) {
    return (
      <div className="flex flex-col gap-4">
        <DashboardBreadcrumb items={[{ label: "Reviews" }]} />
        <p className="text-sm text-muted-foreground">
          Anda belum terhubung dengan bisnis mana pun. Klaim atau daftarkan bisnis Anda terlebih dahulu.
        </p>
      </div>
    )
  }

  const reviews = apiReviews.map((r) => mapApiReviewToUiReview(r, activeBusiness))
  const sorted = [...reviews].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
  const selectedReview = sorted.find((r) => r.id === selectedId) ?? sorted[0] ?? null

  async function handleReply(reviewId: string, content: string): Promise<boolean> {
    if (!businessId) return false
    const res = await createReviewReply(businessId, reviewId, content)
    if (!res.success) {
      toast.error(res.message || "Gagal mengirim balasan.")
      return false
    }
    toast.success("Balasan berhasil dikirim.")
    setRefreshKey((k) => k + 1)
    return true
  }

  const columns: ResourceTableColumn<Review>[] = [
    {
      key: "reviewerName",
      header: "Pelanggan",
      sortValue: (r) => r.reviewerName,
      render: (review) => (
        <div className="flex items-center gap-2.5">
          <Avatar size="sm">
            <AvatarFallback>
              {review.reviewerName
                .split(" ")
                .map((p) => p[0])
                .slice(0, 2)
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {review.reviewerName}
            </p>
            {review.source && (
              <p className="text-xs text-muted-foreground">melalui {review.source}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "rating",
      header: "Rating",
      sortValue: (r) => r.rating,
      render: (review) => <RatingStars rating={review.rating} size="sm" />,
    },
    {
      key: "content",
      header: "Review",
      render: (review) => (
        <span className="line-clamp-1 max-w-56 text-foreground/90">{review.content}</span>
      ),
    },
    {
      key: "isVerified",
      header: "Verifikasi",
      render: (review) => <StatusBadge status={review.isVerified ? "VERIFIED" : "UNVERIFIED"} />,
    },
    {
      key: "status",
      header: "Status",
      render: (review) => <StatusBadge status={reviewStatus(review)} />,
    },
    {
      key: "createdAt",
      header: "Tanggal",
      sortValue: (r) => r.createdAt,
      render: (review) => (
        <span className="text-muted-foreground">{formatDateTime(review.createdAt)}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      headerClassName: "text-right",
      render: (review) => (
        <div className="flex justify-end" onClick={(event) => event.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
              ⋮
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSelectedId(review.id)}>
                Lihat Detail
              </DropdownMenuItem>
              {!review.reply && (
                <DropdownMenuItem onClick={() => setSelectedId(review.id)}>
                  Balas
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <DashboardBreadcrumb items={[{ label: "Reviews" }]} />

      <PageHeader
        title="Reviews"
        description={`Kelola semua review yang diterima oleh ${activeBusiness.name}. Balas review dan jaga reputasi bisnis Anda.`}
        action={
          <Button
            onClick={() =>
              downloadCsv(
                `reviews-${activeBusiness.slug}.csv`,
                sorted.map((r) => ({
                  reviewer: r.reviewerName,
                  rating: r.rating,
                  review: r.content,
                  verifikasi: r.isVerified ? "Verified" : "Unverified",
                  status: reviewStatus(r),
                  tanggal: formatDateTime(r.createdAt),
                }))
              )
            }
          >
            <DownloadIcon />
            Download Data
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 @5xl/main:grid-cols-4">
        <StatCard
          label="Total Reviews"
          value={activeBusiness.totalReviews.toLocaleString("id-ID")}
          icon={MessageSquareTextIcon}
        />
        <StatCard
          label="Average Rating"
          value={activeBusiness.averageRating.toFixed(1)}
          icon={StarIcon}
        />
        <StatCard
          label="Belum Dibalas"
          value={unrepliedCount}
          icon={MessageSquareTextIcon}
          onClick={() => setTab("unreplied")}
        />
        <StatCard
          label="Dilaporkan"
          value={reportedCount}
          iconTone="destructive"
          icon={FlagIcon}
          onClick={() => setTab("reported")}
        />
      </div>

      <Tabs value={tab} onValueChange={(value) => typeof value === "string" && setTab(value)}>
        <TabsList variant="line">
          {TABS.map((option) => (
            <TabsTrigger key={option.value} value={option.value}>
              {option.label}{" "}
              {option.value === "all"
                ? `(${activeBusiness.totalReviews.toLocaleString("id-ID")})`
                : option.value === "unreplied"
                  ? `(${unrepliedCount})`
                  : `(${reportedCount})`}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Cari review..."
          className="sm:max-w-56"
        />
        <div className="flex flex-wrap items-center gap-2">
          <FilterDropdown label="Rating" options={RATING_OPTIONS} value={ratingFilter} onChange={setRatingFilter} />
          <FilterDropdown label="Status" options={STATUS_OPTIONS} value={statusFilter} onChange={setStatusFilter} />
          <FilterDropdown
            label="Verifikasi"
            options={VERIFIED_OPTIONS}
            value={verifiedFilter}
            onChange={setVerifiedFilter}
          />
          <Button variant="outline" size="sm" onClick={() => setAdvancedOpen(true)}>
            <SlidersHorizontalIcon />
            Filter Lanjutan
          </Button>
        </div>
      </div>

      <div className="flex justify-end">
        <DateRangeSelector />
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          <ResourceTable
            data={sorted}
            columns={columns}
            getRowId={(r) => r.id}
            onRowClick={(review) => setSelectedId(review.id)}
            isLoading={isLoading}
            error={loadError}
            rowClassName={(review) =>
              selectedReview?.id === review.id ? "bg-accent/40 hover:bg-accent/50" : undefined
            }
            itemLabel="review"
            emptyTitle="Belum ada review."
            emptyDescription="Review dari pelanggan akan muncul di sini."
          />
        </div>
        {selectedReview && (
          <ReviewDetailPanel
            review={selectedReview}
            onClose={() => setSelectedId(null)}
            onReply={(content) => handleReply(selectedReview.id, content)}
          />
        )}
      </div>

      <Dialog open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filter Lanjutan</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="source-filter">
              Sumber Review
            </label>
            <Select value={sourceFilter} onValueChange={(value) => setSourceFilter(value as string)}>
              <SelectTrigger id="source-filter" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Sumber</SelectItem>
                <SelectItem value="Google">Google</SelectItem>
                <SelectItem value="Website">Website</SelectItem>
                <SelectItem value="KataMereka">KataMereka</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSourceFilter("all")
              }}
            >
              Reset
            </Button>
            <Button onClick={() => setAdvancedOpen(false)}>Terapkan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
