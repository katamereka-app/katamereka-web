"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import {
  CopyIcon,
  ExternalLinkIcon,
  FileIcon,
  HomeIcon,
  ImageIcon,
  Loader2Icon,
  Trash2Icon,
  UploadCloudIcon,
  XIcon,
} from "lucide-react"
import { cn } from "cn"

import { MAX_UPLOAD_BYTES } from "@/components/cms/media-picker-dialog"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { EmptyState } from "@/components/empty-state"
import { FilterDropdown } from "@/components/filter-dropdown"
import { PageHeader } from "@/components/page-header"
import { SearchInput } from "@/components/search-input"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDateTime } from "@/lib/format"
import {
  CmsApiError,
  deleteCmsMedia,
  fetchCmsMedia,
  formatFileSize,
  isImageMime,
  resolveMediaUrl,
  uploadCmsMedia,
  type CmsMediaListItem,
} from "@/lib/cms-api"

const TYPE_OPTIONS = [
  { value: "all", label: "Semua Tipe" },
  { value: "image", label: "Gambar" },
  { value: "other", label: "Lainnya" },
]

export default function CmsMediaPage() {
  const [items, setItems] = React.useState<CmsMediaListItem[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string>()
  const [refreshTick, setRefreshTick] = React.useState(0)
  const [search, setSearch] = React.useState("")
  const [typeFilter, setTypeFilter] = React.useState("all")
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [toDelete, setToDelete] = React.useState<CmsMediaListItem | null>(null)

  const [uploads, setUploads] = React.useState<{ name: string; done: boolean; error?: string }[]>([])
  const [isDragging, setIsDragging] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    let ignore = false
    fetchCmsMedia()
      .then((res) => {
        if (ignore) return
        setItems(res.data)
        setError(undefined)
      })
      .catch((e) => !ignore && setError(e instanceof CmsApiError ? e.message : "Gagal memuat media"))
      .finally(() => !ignore && setIsLoading(false))
    return () => {
      ignore = true
    }
  }, [refreshTick])

  const q = search.trim().toLowerCase()
  const filtered = items.filter((m) => {
    if (typeFilter === "image" && !isImageMime(m.mime_type)) return false
    if (typeFilter === "other" && isImageMime(m.mime_type)) return false
    if (!q) return true
    return (
      m.original_name?.toLowerCase().includes(q) ||
      m.filename?.toLowerCase().includes(q) ||
      m.alt_text?.toLowerCase().includes(q)
    )
  })
  const selected = items.find((m) => m.id === selectedId) ?? null
  const totalSize = items.reduce((sum, m) => sum + (m.size || 0), 0)

  async function uploadFiles(files: File[]) {
    if (!files.length) return
    const valid = files.filter((f) => {
      if (f.size > MAX_UPLOAD_BYTES) {
        toast.error(`${f.name} melebihi ${formatFileSize(MAX_UPLOAD_BYTES)}.`)
        return false
      }
      return true
    })
    if (!valid.length) return
    setUploads(valid.map((f) => ({ name: f.name, done: false })))
    let ok = 0
    // Sequential keeps the order predictable and avoids hammering the API.
    for (let i = 0; i < valid.length; i++) {
      const file = valid[i]
      try {
        await uploadCmsMedia(file, file.type.startsWith("image/") ? file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ") : undefined)
        ok++
        setUploads((u) => u.map((x, j) => (j === i ? { ...x, done: true } : x)))
      } catch (e) {
        const msg = e instanceof CmsApiError ? e.message : "Gagal"
        setUploads((u) => u.map((x, j) => (j === i ? { ...x, done: true, error: msg } : x)))
      }
    }
    if (ok) toast.success(`${ok} file berhasil diunggah.`)
    if (ok < valid.length) toast.error(`${valid.length - ok} file gagal diunggah.`)
    setRefreshTick((t) => t + 1)
    setTimeout(() => setUploads([]), 2500)
  }

  async function copyUrl(m: CmsMediaListItem) {
    try {
      await navigator.clipboard.writeText(resolveMediaUrl(m.url))
      toast.success("URL disalin ke clipboard.")
    } catch {
      toast.error("Gagal menyalin URL.")
    }
  }

  async function confirmDelete() {
    if (!toDelete) return
    try {
      await deleteCmsMedia(toDelete.id)
      toast.success(`${toDelete.original_name} dihapus.`)
      if (selectedId === toDelete.id) setSelectedId(null)
      setRefreshTick((t) => t + 1)
    } catch (e) {
      toast.error(e instanceof CmsApiError ? e.message : "Gagal menghapus media")
    }
  }

  const uploading = uploads.some((u) => !u.done)

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
            <BreadcrumbPage>CMS · Media</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PageHeader
        title="Media Library"
        description={`${items.length} file · ${formatFileSize(totalSize)} total. Gambar di sini bisa dipakai di editor, gambar utama, dan Open Graph.`}
        action={
          <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2Icon className="animate-spin" /> : <UploadCloudIcon />}
            Unggah File
          </Button>
        }
      />

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,application/pdf,video/*"
        className="hidden"
        onChange={(e) => {
          uploadFiles(Array.from(e.target.files ?? []))
          e.target.value = ""
        }}
      />

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragging(false)
          uploadFiles(Array.from(e.dataTransfer.files ?? []))
        }}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-muted/40"
        )}
      >
        <UploadCloudIcon className="size-7 text-muted-foreground" />
        <p className="text-sm font-medium">Tarik & lepas beberapa file sekaligus, atau klik untuk memilih</p>
        <p className="text-xs text-muted-foreground">Gambar, PDF, atau video — maks. {formatFileSize(MAX_UPLOAD_BYTES)} per file</p>
        {uploads.length > 0 && (
          <ul className="mt-3 flex w-full max-w-md flex-col gap-1 text-left text-xs">
            {uploads.map((u, i) => (
              <li key={i} className="flex items-center gap-2">
                {!u.done ? (
                  <Loader2Icon className="size-3.5 animate-spin" />
                ) : u.error ? (
                  <XIcon className="size-3.5 text-destructive" />
                ) : (
                  <span className="size-3.5 text-center text-success">✓</span>
                )}
                <span className="flex-1 truncate">{u.name}</span>
                {u.error && <span className="text-destructive">{u.error}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={search} onChange={setSearch} placeholder="Cari nama file atau alt text…" />
        <FilterDropdown label="Tipe" options={TYPE_OPTIONS} value={typeFilter} onChange={setTypeFilter} />
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square w-full rounded-xl" />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-xl border border-border">
              <EmptyState icon={ImageIcon} title="Gagal memuat media" description={error} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-border">
              <EmptyState
                icon={ImageIcon}
                title={items.length ? "Tidak ada file yang cocok." : "Media library masih kosong."}
                description={items.length ? undefined : "Unggah gambar pertama untuk dipakai di konten."}
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
              {filtered.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedId(m.id === selectedId ? null : m.id)}
                  className={cn(
                    "group flex flex-col overflow-hidden rounded-xl border bg-card text-left transition-all",
                    selectedId === m.id ? "border-primary ring-2 ring-primary/40" : "border-border hover:border-primary/40"
                  )}
                >
                  <div className="flex aspect-square w-full items-center justify-center bg-muted">
                    {isImageMime(m.mime_type) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={resolveMediaUrl(m.url)}
                        alt={m.alt_text || m.original_name}
                        loading="lazy"
                        className="size-full object-cover"
                      />
                    ) : (
                      <FileIcon className="size-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="px-2.5 py-2">
                    <p className="truncate text-xs font-medium">{m.original_name}</p>
                    <p className="text-[11px] text-muted-foreground">{formatFileSize(m.size)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {selected && (
          <aside className="w-full shrink-0 rounded-xl border border-border bg-card lg:sticky lg:top-4 lg:w-80">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="text-sm font-semibold">Detail File</p>
              <Button variant="ghost" size="icon-sm" onClick={() => setSelectedId(null)} aria-label="Tutup">
                <XIcon />
              </Button>
            </div>
            <div className="flex flex-col gap-4 p-4">
              <div className="flex items-center justify-center overflow-hidden rounded-lg bg-muted">
                {isImageMime(selected.mime_type) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={resolveMediaUrl(selected.url)} alt={selected.alt_text ?? ""} className="max-h-64 object-contain" />
                ) : (
                  <FileIcon className="my-10 size-10 text-muted-foreground" />
                )}
              </div>
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-xs">
                <dt className="text-muted-foreground">Nama</dt>
                <dd className="break-all">{selected.original_name}</dd>
                <dt className="text-muted-foreground">Tipe</dt>
                <dd>{selected.mime_type}</dd>
                <dt className="text-muted-foreground">Ukuran</dt>
                <dd>{formatFileSize(selected.size)}</dd>
                <dt className="text-muted-foreground">Alt text</dt>
                <dd>{selected.alt_text || "—"}</dd>
                <dt className="text-muted-foreground">Diunggah</dt>
                <dd>{formatDateTime(selected.created_at)}</dd>
                <dt className="text-muted-foreground">Oleh</dt>
                <dd>{selected.uploaded_by?.name ?? "—"}</dd>
              </dl>
              <div className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/50 px-2 py-1.5">
                <span className="flex-1 truncate font-mono text-[11px]">{resolveMediaUrl(selected.url)}</span>
                <Button variant="ghost" size="icon-xs" onClick={() => copyUrl(selected)} aria-label="Salin URL">
                  <CopyIcon />
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  render={<a href={resolveMediaUrl(selected.url)} target="_blank" rel="noopener noreferrer" />}
                >
                  <ExternalLinkIcon />
                  Buka
                </Button>
                <Button variant="destructive" className="flex-1" onClick={() => setToDelete(selected)}>
                  <Trash2Icon />
                  Hapus
                </Button>
              </div>
            </div>
          </aside>
        )}
      </div>

      {toDelete && (
        <ConfirmDialog
          open
          onOpenChange={(open) => !open && setToDelete(null)}
          title={`Hapus ${toDelete.original_name}?`}
          description="File dihapus permanen dari storage. Konten yang masih menampilkan gambar ini akan menampilkan gambar rusak."
          confirmLabel="Hapus permanen"
          variant="destructive"
          onConfirm={confirmDelete}
        />
      )}
    </div>
  )
}
