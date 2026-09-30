"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  ArchiveIcon,
  CopyIcon,
  FileTextIcon,
  HomeIcon,
  ImageIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  RotateCcwIcon,
  SendIcon,
  Trash2Icon,
  FilePenLineIcon,
  CheckCircle2Icon,
} from "lucide-react"

import { ConfirmDialog } from "@/components/confirm-dialog"
import { FilterDropdown } from "@/components/filter-dropdown"
import { PageHeader } from "@/components/page-header"
import { ResourceTable, type ResourceTableColumn } from "@/components/resource-table"
import { SearchInput } from "@/components/search-input"
import { StatCard } from "@/components/stat-card"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDate, formatDateTime } from "@/lib/format"
import {
  CONTENT_STATUS_OPTIONS,
  CmsApiError,
  createCmsContent,
  deleteCmsContent,
  fetchCmsCategories,
  fetchCmsContent,
  fetchCmsContents,
  fetchCmsTags,
  displayStatus,
  publishCmsContent,
  resolveMediaUrl,
  updateCmsContent,
  type CmsCategory,
  type CmsContent,
  type CmsTag,
  type ContentStatus,
} from "@/lib/cms-api"

const PAGE_LIMIT = 10

const STATUS_FILTER = [{ value: "all", label: "Semua Status" }, ...CONTENT_STATUS_OPTIONS]

type StatusCounts = Record<"ALL" | ContentStatus, number>

const EMPTY_COUNTS: StatusCounts = { ALL: 0, DRAFT: 0, IN_REVIEW: 0, SCHEDULED: 0, PUBLISHED: 0, ARCHIVED: 0 }

export default function CmsContentsPage() {
  const router = useRouter()
  const [contents, setContents] = React.useState<CmsContent[]>([])
  const [counts, setCounts] = React.useState<StatusCounts>(EMPTY_COUNTS)
  const [categories, setCategories] = React.useState<CmsCategory[]>([])
  const [tags, setTags] = React.useState<CmsTag[]>([])
  const [totalPages, setTotalPages] = React.useState(1)
  const [total, setTotal] = React.useState(0)
  const [apiPage, setApiPage] = React.useState(1)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | undefined>()

  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [categoryFilter, setCategoryFilter] = React.useState("all")
  const [tagFilter, setTagFilter] = React.useState("all")
  const [refreshTick, setRefreshTick] = React.useState(0)

  const [confirmTarget, setConfirmTarget] = React.useState<{
    content: CmsContent
    action: "DELETE" | "ARCHIVE" | "PUBLISH"
  } | null>(null)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setApiPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  // Taxonomies for the filter dropdowns (loaded once).
  React.useEffect(() => {
    Promise.all([fetchCmsCategories(), fetchCmsTags()])
      .then(([c, t]) => {
        setCategories(c.data)
        setTags(t.data)
      })
      .catch(() => {})
  }, [])

  React.useEffect(() => {
    let ignore = false
    async function run() {
      try {
        const res = await fetchCmsContents({
          page: apiPage,
          limit: PAGE_LIMIT,
          search: debouncedSearch || undefined,
          status: statusFilter === "all" ? undefined : (statusFilter as ContentStatus),
          categorySlug: categoryFilter === "all" ? undefined : categoryFilter,
          tagSlug: tagFilter === "all" ? undefined : tagFilter,
        })
        if (ignore) return
        setContents(res.data)
        setTotalPages(Math.max(1, res.pagination.total_pages))
        setTotal(res.pagination.total)
        setError(undefined)
      } catch (e) {
        if (!ignore) setError(e instanceof CmsApiError ? e.message : "Gagal memuat konten dari server")
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }
    run()
    return () => {
      ignore = true
    }
  }, [apiPage, debouncedSearch, statusFilter, categoryFilter, tagFilter, refreshTick])

  // Per-status totals: the list endpoint has no stats block, so ask for one
  // row per status and read `pagination.total`.
  React.useEffect(() => {
    let ignore = false
    const keys: ("ALL" | ContentStatus)[] = ["ALL", "DRAFT", "IN_REVIEW", "SCHEDULED", "PUBLISHED", "ARCHIVED"]
    Promise.all(
      keys.map((k) =>
        fetchCmsContents({ limit: 1, status: k === "ALL" ? undefined : k })
          .then((r) => r.pagination.total)
          .catch(() => 0)
      )
    ).then((totals) => {
      if (ignore) return
      setCounts(Object.fromEntries(keys.map((k, i) => [k, totals[i]])) as StatusCounts)
    })
    return () => {
      ignore = true
    }
  }, [refreshTick])

  function changeFilter(setter: (v: string) => void) {
    return (value: string) => {
      setter(value)
      setApiPage(1)
    }
  }

  function resetFilters() {
    setSearch("")
    setDebouncedSearch("")
    setStatusFilter("all")
    setCategoryFilter("all")
    setTagFilter("all")
    setApiPage(1)
  }

  async function handleConfirm() {
    if (!confirmTarget) return
    const { content, action } = confirmTarget
    try {
      if (action === "DELETE") {
        await deleteCmsContent(content.id)
        toast.success(`“${content.title}” dihapus.`)
      } else if (action === "ARCHIVE") {
        await updateCmsContent(content.id, { status: "ARCHIVED" })
        toast.success(`“${content.title}” diarsipkan.`)
      } else {
        await publishCmsContent(content.id)
        toast.success(`“${content.title}” dipublikasikan.`)
      }
      setRefreshTick((t) => t + 1)
    } catch (e) {
      toast.error(e instanceof CmsApiError ? e.message : "Aksi gagal diproses")
    }
  }

  async function handleDuplicate(content: CmsContent) {
    const toastId = toast.loading("Menduplikasi konten…")
    try {
      // The list payload may omit relations — load the full record first.
      const full = await fetchCmsContent(content.id)
      const res = await createCmsContent({
        title: `${full.title} (Salinan)`,
        slug: `${full.slug}-salinan-${Date.now().toString(36)}`,
        excerpt: full.excerpt ?? undefined,
        body: full.body,
        featuredMediaId: full.featuredMediaId ?? undefined,
        status: "DRAFT",
        categoryIds: full.categories?.map((c) => c.id),
        tagIds: full.tags?.map((t) => t.id),
        seo: full.seo
          ? {
              metaTitle: full.seo.metaTitle ?? undefined,
              metaDescription: full.seo.metaDescription ?? undefined,
              robotsIndex: full.seo.robotsIndex,
              robotsFollow: full.seo.robotsFollow,
              ogTitle: full.seo.ogTitle ?? undefined,
              ogDescription: full.seo.ogDescription ?? undefined,
              ogMediaId: full.seo.ogMediaId ?? undefined,
            }
          : undefined,
      })
      toast.success("Salinan dibuat sebagai draft.", { id: toastId })
      router.push(`/admin/cms/contents/${res.data.id}`)
    } catch (e) {
      toast.error(e instanceof CmsApiError ? e.message : "Gagal menduplikasi konten", { id: toastId })
    }
  }

  const columns: ResourceTableColumn<CmsContent>[] = [
    {
      key: "title",
      header: "Judul",
      sortValue: (c) => c.title.toLowerCase(),
      render: (c) => (
        <div className="flex min-w-64 items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted text-muted-foreground">
            {c.featuredMedia?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={resolveMediaUrl(c.featuredMedia.url)} alt="" className="size-full object-cover" />
            ) : (
              <ImageIcon className="size-4" />
            )}
          </div>
          <div className="min-w-0">
            <Link
              href={`/admin/cms/contents/${c.id}`}
              className="line-clamp-1 font-medium text-foreground hover:text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {c.title}
            </Link>
            <p className="line-clamp-1 font-mono text-[11px] text-muted-foreground">/{c.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortValue: (c) => c.status,
      render: (c) => <StatusBadge status={displayStatus(c)} />,
    },
    {
      key: "categories",
      header: "Kategori",
      render: (c) =>
        c.categories?.length ? (
          <div className="flex max-w-48 flex-wrap gap-1">
            {c.categories.map((cat) => (
              <StatusBadge key={cat.id} status="gray" label={cat.name} />
            ))}
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      key: "tags",
      header: "Tag",
      render: (c) =>
        c.tags?.length ? (
          <span className="line-clamp-1 max-w-40 text-xs text-muted-foreground">
            {c.tags.map((t) => `#${t.name}`).join(" ")}
          </span>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      key: "author",
      header: "Penulis",
      render: (c) => <span className="text-muted-foreground">{c.author?.name ?? "-"}</span>,
    },
    {
      key: "publishedAt",
      header: "Terbit",
      sortValue: (c) => c.publishedAt ?? "",
      render: (c) => (
        <span className="whitespace-nowrap text-muted-foreground">
          {c.publishedAt ? formatDateTime(c.publishedAt) : "-"}
        </span>
      ),
    },
    {
      key: "updatedAt",
      header: "Diperbarui",
      sortValue: (c) => c.updatedAt,
      render: (c) => <span className="whitespace-nowrap text-muted-foreground">{formatDate(c.updatedAt)}</span>,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (c) => (
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Aksi" />}>
              <MoreHorizontalIcon className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem render={<Link href={`/admin/cms/contents/${c.id}`} />}>
                <PencilIcon />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDuplicate(c)}>
                <CopyIcon />
                Duplikat
              </DropdownMenuItem>
              {displayStatus(c) !== "PUBLISHED" && (
                <DropdownMenuItem onClick={() => setConfirmTarget({ content: c, action: "PUBLISH" })}>
                  <SendIcon />
                  Publikasikan
                </DropdownMenuItem>
              )}
              {c.status !== "ARCHIVED" && (
                <DropdownMenuItem onClick={() => setConfirmTarget({ content: c, action: "ARCHIVE" })}>
                  <ArchiveIcon />
                  Arsipkan
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => setConfirmTarget({ content: c, action: "DELETE" })}>
                <Trash2Icon />
                Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]

  const confirmCopy = confirmTarget
    ? {
        DELETE: {
          title: "Hapus konten?",
          description: `“${confirmTarget.content.title}” akan dihapus dari CMS dan tidak tampil lagi di situs.`,
          confirmLabel: "Hapus",
          variant: "destructive" as const,
        },
        ARCHIVE: {
          title: "Arsipkan konten?",
          description: `“${confirmTarget.content.title}” akan disembunyikan dari situs publik. Anda bisa mempublikasikannya lagi kapan saja.`,
          confirmLabel: "Arsipkan",
          variant: "default" as const,
        },
        PUBLISH: {
          title: "Publikasikan konten?",
          description: `“${confirmTarget.content.title}” akan langsung tampil di situs publik.`,
          confirmLabel: "Publikasikan",
          variant: "default" as const,
        },
      }[confirmTarget.action]
    : null

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
            <BreadcrumbPage>CMS · Konten</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PageHeader
        title="Konten"
        description="Tulis, jadwalkan, dan publikasikan artikel, panduan, serta halaman editorial KataMereka."
        action={
          <Button render={<Link href="/admin/cms/contents/new" />}>
            <PlusIcon />
            Tulis Konten
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Semua Konten" value={counts.ALL} icon={FileTextIcon} onClick={() => changeFilter(setStatusFilter)("all")} />
        <StatCard
          label="Published"
          value={counts.PUBLISHED}
          icon={CheckCircle2Icon}
          onClick={() => changeFilter(setStatusFilter)("PUBLISHED")}
        />
        <StatCard
          label="Draft & Review"
          value={counts.DRAFT + counts.IN_REVIEW}
          icon={FilePenLineIcon}
          iconTone="warning"
          onClick={() => changeFilter(setStatusFilter)("DRAFT")}
        />
        <StatCard
          label="Diarsipkan"
          value={counts.ARCHIVED}
          icon={ArchiveIcon}
          iconTone="accent"
          onClick={() => changeFilter(setStatusFilter)("ARCHIVED")}
        />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <SearchInput value={search} onChange={setSearch} placeholder="Cari judul, slug, atau isi…" />
          <div className="flex flex-wrap items-center gap-2">
            <FilterDropdown label="Status" options={STATUS_FILTER} value={statusFilter} onChange={changeFilter(setStatusFilter)} />
            <FilterDropdown
              label="Kategori"
              options={[{ value: "all", label: "Semua Kategori" }, ...categories.map((c) => ({ value: c.slug, label: c.name }))]}
              value={categoryFilter}
              onChange={changeFilter(setCategoryFilter)}
            />
            <FilterDropdown
              label="Tag"
              options={[{ value: "all", label: "Semua Tag" }, ...tags.map((t) => ({ value: t.slug, label: t.name }))]}
              value={tagFilter}
              onChange={changeFilter(setTagFilter)}
            />
            <Button variant="outline" size="sm" onClick={resetFilters}>
              <RotateCcwIcon />
              Reset
            </Button>
          </div>
        </div>

        <ResourceTable
          data={contents}
          columns={columns}
          getRowId={(c) => c.id}
          onRowClick={(c) => router.push(`/admin/cms/contents/${c.id}`)}
          isLoading={isLoading}
          error={error}
          itemLabel="konten"
          pageSize={PAGE_LIMIT}
          pageSizeOptions={[PAGE_LIMIT]}
          emptyTitle="Belum ada konten."
          emptyDescription="Mulai tulis artikel pertama untuk blog KataMereka."
          emptyAction={
            <Button render={<Link href="/admin/cms/contents/new" />}>
              <PlusIcon />
              Tulis Konten
            </Button>
          }
        />

        {!isLoading && !error && totalPages > 1 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Halaman {apiPage} dari {totalPages} · {total} konten
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={apiPage <= 1} onClick={() => setApiPage((p) => Math.max(1, p - 1))}>
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={apiPage >= totalPages}
                onClick={() => setApiPage((p) => Math.min(totalPages, p + 1))}
              >
                Selanjutnya
              </Button>
            </div>
          </div>
        )}
      </div>

      {confirmTarget && confirmCopy && (
        <ConfirmDialog
          open
          onOpenChange={(open) => !open && setConfirmTarget(null)}
          title={confirmCopy.title}
          description={confirmCopy.description}
          confirmLabel={confirmCopy.confirmLabel}
          variant={confirmCopy.variant}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  )
}
