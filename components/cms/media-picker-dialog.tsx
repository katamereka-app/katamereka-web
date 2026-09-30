"use client"

import * as React from "react"
import { toast } from "sonner"
import { CheckIcon, ImageIcon, LinkIcon, Loader2Icon, SearchIcon, UploadCloudIcon } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CmsApiError,
  fetchCmsMedia,
  formatFileSize,
  isImageMime,
  resolveMediaUrl,
  uploadCmsMedia,
  type CmsMediaListItem,
} from "@/lib/cms-api"

export interface PickedMedia {
  /** Absolute URL, safe to embed in the article body. */
  url: string
  alt: string
  /** Present when the file lives in the CMS media library. */
  mediaId?: string
}

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024

export function MediaPickerDialog({
  open,
  onOpenChange,
  onSelect,
  title = "Pilih Gambar",
  description = "Pilih dari media library, unggah file baru, atau tempel URL gambar.",
  allowUrl = true,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (media: PickedMedia) => void
  title?: string
  description?: string
  /** Featured/OG images must be library items (they are referenced by id). */
  allowUrl?: boolean
}) {
  const [tab, setTab] = React.useState<string>("library")
  const [items, setItems] = React.useState<CmsMediaListItem[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [loadError, setLoadError] = React.useState<string>()
  const [query, setQuery] = React.useState("")
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [altText, setAltText] = React.useState("")

  const [file, setFile] = React.useState<File | null>(null)
  const [isUploading, setIsUploading] = React.useState(false)
  const [isDragging, setIsDragging] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const [externalUrl, setExternalUrl] = React.useState("")

  const loadLibrary = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetchCmsMedia()
      setItems(res.data.filter((m) => isImageMime(m.mime_type)))
      setLoadError(undefined)
    } catch (e) {
      setLoadError(e instanceof CmsApiError ? e.message : "Gagal memuat media library")
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Reset + refetch every time the parent opens the dialog so files uploaded
  // elsewhere show up. Deferred via setTimeout (an external callback) instead
  // of setting state synchronously in the effect body.
  React.useEffect(() => {
    if (!open) return
    const timer = setTimeout(() => {
      setTab("library")
      setQuery("")
      setSelectedId(null)
      setAltText("")
      setFile(null)
      setExternalUrl("")
      loadLibrary()
    }, 0)
    return () => clearTimeout(timer)
  }, [open, loadLibrary])

  const previewUrl = React.useMemo(() => (file ? URL.createObjectURL(file) : null), [file])
  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  function acceptFile(candidate: File | undefined | null) {
    if (!candidate) return
    if (!candidate.type.startsWith("image/")) {
      toast.error("File harus berupa gambar (JPG, PNG, WEBP, GIF, SVG).")
      return
    }
    if (candidate.size > MAX_UPLOAD_BYTES) {
      toast.error(`Ukuran file maksimal ${formatFileSize(MAX_UPLOAD_BYTES)}.`)
      return
    }
    setFile(candidate)
    if (!altText) setAltText(candidate.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "))
  }

  const filtered = items.filter((m) => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return (
      m.original_name?.toLowerCase().includes(q) ||
      m.filename?.toLowerCase().includes(q) ||
      m.alt_text?.toLowerCase().includes(q)
    )
  })
  const selected = items.find((m) => m.id === selectedId) ?? null

  async function handleConfirm() {
    if (tab === "library") {
      if (!selected) return
      onSelect({
        url: resolveMediaUrl(selected.url),
        alt: altText || selected.alt_text || "",
        mediaId: selected.id,
      })
      onOpenChange(false)
      return
    }

    if (tab === "upload") {
      if (!file) return
      setIsUploading(true)
      try {
        const res = await uploadCmsMedia(file, altText || undefined)
        toast.success("Gambar berhasil diunggah ke media library.")
        onSelect({ url: resolveMediaUrl(res.data.url), alt: altText, mediaId: res.data.id })
        onOpenChange(false)
      } catch (e) {
        toast.error(e instanceof CmsApiError ? e.message : "Gagal mengunggah gambar")
      } finally {
        setIsUploading(false)
      }
      return
    }

    const url = externalUrl.trim()
    if (!/^https?:\/\//i.test(url)) {
      toast.error("URL gambar harus diawali http:// atau https://")
      return
    }
    onSelect({ url, alt: altText })
    onOpenChange(false)
  }

  const canConfirm =
    (tab === "library" && !!selected) ||
    (tab === "upload" && !!file && !isUploading) ||
    (tab === "url" && externalUrl.trim().length > 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(value) => setTab(String(value))}>
          <TabsList className="w-full">
            <TabsTrigger value="library">
              <ImageIcon />
              Media Library
            </TabsTrigger>
            <TabsTrigger value="upload">
              <UploadCloudIcon />
              Upload
            </TabsTrigger>
            {allowUrl && (
              <TabsTrigger value="url">
                <LinkIcon />
                Dari URL
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="library" className="flex flex-col gap-3 pt-2">
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari nama file atau alt text..."
                className="pl-8"
              />
            </div>
            <div className="grid max-h-[46vh] grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-4">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-square w-full rounded-lg" />
                ))
              ) : loadError ? (
                <p className="col-span-full py-10 text-center text-sm text-destructive">{loadError}</p>
              ) : filtered.length === 0 ? (
                <p className="col-span-full py-10 text-center text-sm text-muted-foreground">
                  {items.length === 0
                    ? "Media library masih kosong. Unggah gambar di tab Upload."
                    : "Tidak ada gambar yang cocok."}
                </p>
              ) : (
                filtered.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(m.id)
                      setAltText(m.alt_text || "")
                    }}
                    onDoubleClick={() => {
                      setSelectedId(m.id)
                      onSelect({ url: resolveMediaUrl(m.url), alt: m.alt_text || "", mediaId: m.id })
                      onOpenChange(false)
                    }}
                    className={cn(
                      "group relative flex flex-col overflow-hidden rounded-lg border text-left transition-all",
                      selectedId === m.id
                        ? "border-primary ring-2 ring-primary/40"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={resolveMediaUrl(m.url)}
                      alt={m.alt_text || m.original_name}
                      className="aspect-square w-full bg-muted object-cover"
                      loading="lazy"
                    />
                    <span className="truncate px-2 py-1.5 text-[11px] text-muted-foreground">
                      {m.original_name}
                    </span>
                    {selectedId === m.id && (
                      <span className="absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <CheckIcon className="size-3.5" />
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="upload" className="flex flex-col gap-3 pt-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                acceptFile(e.target.files?.[0])
                e.target.value = ""
              }}
            />
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click()
              }}
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault()
                setIsDragging(false)
                acceptFile(e.dataTransfer.files?.[0])
              }}
              className={cn(
                "flex min-h-52 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors",
                isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50"
              )}
            >
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt="Preview" className="max-h-56 rounded-lg object-contain" />
              ) : (
                <>
                  <UploadCloudIcon className="size-8 text-muted-foreground" />
                  <p className="text-sm font-medium">Tarik & lepas gambar di sini, atau klik untuk memilih</p>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG, WEBP, GIF, SVG — maks. {formatFileSize(MAX_UPLOAD_BYTES)}
                  </p>
                </>
              )}
            </div>
            {file && (
              <p className="text-xs text-muted-foreground">
                {file.name} · {formatFileSize(file.size)}
              </p>
            )}
          </TabsContent>

          {allowUrl && (
            <TabsContent value="url" className="flex flex-col gap-3 pt-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="media-external-url">URL Gambar</Label>
                <Input
                  id="media-external-url"
                  type="url"
                  placeholder="https://contoh.com/gambar.jpg"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                />
              </div>
              {/^https?:\/\//i.test(externalUrl.trim()) && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={externalUrl.trim()}
                  alt="Preview"
                  className="max-h-56 self-start rounded-lg border object-contain"
                />
              )}
            </TabsContent>
          )}
        </Tabs>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="media-alt-text">Alt text (deskripsi gambar untuk aksesibilitas & SEO)</Label>
          <Input
            id="media-alt-text"
            placeholder="Contoh: Suasana ruang makan Sunny Cafe di Bandung"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleConfirm} disabled={!canConfirm}>
            {isUploading && <Loader2Icon className="animate-spin" />}
            {tab === "upload" ? "Unggah & Gunakan" : "Gunakan Gambar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
