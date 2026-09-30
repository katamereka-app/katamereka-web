"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  ArchiveIcon,
  ArrowLeftIcon,
  CalendarClockIcon,
  ChevronDownIcon,
  EyeIcon,
  GlobeIcon,
  HistoryIcon,
  HomeIcon,
  ImageIcon,
  ImagePlusIcon,
  Loader2Icon,
  LockIcon,
  LockOpenIcon,
  MoreHorizontalIcon,
  RotateCcwIcon,
  SaveIcon,
  SendIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react"
import { cn } from "cn"

import { ConfirmDialog } from "@/components/confirm-dialog"
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
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { formatDateTime } from "@/lib/format"
import {
  CONTENT_STATUS_OPTIONS,
  CmsApiError,
  createCmsContent,
  deleteCmsContent,
  fetchCmsCategories,
  fetchCmsContent,
  fetchCmsTags,
  displayStatus,
  resolveMediaUrl,
  rollbackCmsContent,
  slugify,
  updateCmsContent,
  type CmsCategory,
  type CmsContent,
  type CmsContentPayload,
  type CmsRevision,
  type CmsTag,
  type ContentStatus,
} from "@/lib/cms-api"
import { MediaPickerDialog } from "./media-picker-dialog"
import { ReadOnlyContent } from "./read-only-content"
import { RichTextEditor } from "./rich-text-editor"
import { CategorySelector, TagSelector } from "./taxonomy-selectors"

// ---------------------------------------------------------------------------
// Form state
// ---------------------------------------------------------------------------

interface MediaRef {
  id: string
  url: string
  alt?: string | null
}

interface FormState {
  title: string
  slug: string
  slugLocked: boolean
  excerpt: string
  body: string
  status: ContentStatus
  publishedAt: string // datetime-local value
  featured: MediaRef | null
  categoryIds: string[]
  tagIds: string[]
  seo: {
    metaTitle: string
    metaDescription: string
    canonicalUrl: string
    robotsIndex: boolean
    robotsFollow: boolean
    ogTitle: string
    ogDescription: string
    og: MediaRef | null
  }
}

const EMPTY_FORM: FormState = {
  title: "",
  slug: "",
  slugLocked: false,
  excerpt: "",
  body: "",
  status: "DRAFT",
  publishedAt: "",
  featured: null,
  categoryIds: [],
  tagIds: [],
  seo: {
    metaTitle: "",
    metaDescription: "",
    canonicalUrl: "",
    robotsIndex: true,
    robotsFollow: true,
    ogTitle: "",
    ogDescription: "",
    og: null,
  },
}

function toLocalInput(iso: string | null | undefined) {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function fromContent(c: CmsContent): FormState {
  return {
    title: c.title,
    slug: c.slug,
    slugLocked: true,
    excerpt: c.excerpt ?? "",
    body: c.body,
    status: c.status,
    publishedAt: toLocalInput(c.publishedAt),
    featured: c.featuredMedia
      ? { id: c.featuredMedia.id, url: resolveMediaUrl(c.featuredMedia.url), alt: c.featuredMedia.altText }
      : null,
    categoryIds: c.categories?.map((x) => x.id) ?? [],
    tagIds: c.tags?.map((x) => x.id) ?? [],
    seo: {
      metaTitle: c.seo?.metaTitle ?? "",
      metaDescription: c.seo?.metaDescription ?? "",
      canonicalUrl: c.seo?.canonicalUrl ?? "",
      robotsIndex: c.seo?.robotsIndex ?? true,
      robotsFollow: c.seo?.robotsFollow ?? true,
      ogTitle: c.seo?.ogTitle ?? "",
      ogDescription: c.seo?.ogDescription ?? "",
      og: c.seo?.ogMedia
        ? { id: c.seo.ogMedia.id, url: resolveMediaUrl(c.seo.ogMedia.url), alt: c.seo.ogMedia.altText }
        : null,
    },
  }
}

function plainText(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function buildPayload(f: FormState): CmsContentPayload & { featuredMediaId?: string | null; publishedAt?: string | null } {
  return {
    title: f.title.trim(),
    slug: f.slug.trim() || undefined,
    excerpt: f.excerpt.trim(),
    body: f.body,
    status: f.status,
    // null clears the value server-side (UpdateContentDto checks `!== undefined`).
    publishedAt: f.publishedAt ? new Date(f.publishedAt).toISOString() : null,
    featuredMediaId: f.featured?.id ?? null,
    categoryIds: f.categoryIds,
    tagIds: f.tagIds,
    seo: {
      metaTitle: f.seo.metaTitle.trim(),
      metaDescription: f.seo.metaDescription.trim(),
      canonicalUrl: f.seo.canonicalUrl.trim(),
      robotsIndex: f.seo.robotsIndex,
      robotsFollow: f.seo.robotsFollow,
      ogTitle: f.seo.ogTitle.trim(),
      ogDescription: f.seo.ogDescription.trim(),
      // null unlinks a previously chosen OG image on update.
      ogMediaId: f.seo.og?.id ?? null,
    },
  } as CmsContentPayload & { featuredMediaId?: string | null; publishedAt?: string | null }
}

function draftKey(id?: string) {
  return `cms-draft:${id ?? "new"}`
}

// ---------------------------------------------------------------------------
// UI helpers
// ---------------------------------------------------------------------------

function Panel({
  title,
  icon: Icon,
  children,
  defaultOpen = true,
  aside,
}: {
  title: string
  icon?: React.ComponentType<{ className?: string }>
  children: React.ReactNode
  defaultOpen?: boolean
  aside?: React.ReactNode
}) {
  const [open, setOpen] = React.useState(defaultOpen)
  return (
    <section className="rounded-xl border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left"
        aria-expanded={open}
      >
        {Icon && <Icon className="size-4 text-muted-foreground" />}
        <span className="flex-1 text-sm font-semibold text-foreground">{title}</span>
        {aside}
        <ChevronDownIcon className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="flex flex-col gap-3 border-t border-border px-4 py-3">{children}</div>}
    </section>
  )
}

function CharCounter({ value, recommended, max }: { value: string; recommended: number; max?: number }) {
  const n = value.length
  return (
    <span
      className={cn(
        "text-[11px] tabular-nums",
        max && n > max ? "text-destructive" : n > recommended ? "text-warning" : "text-muted-foreground"
      )}
    >
      {n}/{recommended}
    </span>
  )
}

function ImageSlot({
  media,
  onPick,
  onClear,
  aspect = "aspect-video",
  emptyLabel,
}: {
  media: MediaRef | null
  onPick: () => void
  onClear: () => void
  aspect?: string
  emptyLabel: string
}) {
  if (!media) {
    return (
      <button
        type="button"
        onClick={onPick}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-border text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/50",
          aspect
        )}
      >
        <ImagePlusIcon className="size-6" />
        {emptyLabel}
      </button>
    )
  }
  return (
    <div className="group relative overflow-hidden rounded-lg border border-border">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={media.url} alt={media.alt ?? ""} className={cn("w-full bg-muted object-cover", aspect)} />
      <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1.5 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
        <Button size="sm" variant="secondary" onClick={onPick}>
          Ganti
        </Button>
        <Button size="sm" variant="secondary" onClick={onClear}>
          <XIcon />
          Hapus
        </Button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main form
// ---------------------------------------------------------------------------

export function ContentEditorForm({ contentId }: { contentId?: string }) {
  const router = useRouter()
  const isNew = !contentId

  const [content, setContent] = React.useState<CmsContent | null>(null)
  const [form, setForm] = React.useState<FormState>(EMPTY_FORM)
  const [savedSnapshot, setSavedSnapshot] = React.useState(JSON.stringify(EMPTY_FORM))
  const [editorKey, setEditorKey] = React.useState(0)
  const [loading, setLoading] = React.useState(!isNew)
  const [loadError, setLoadError] = React.useState<string>()
  const [saving, setSaving] = React.useState<null | "save" | "publish">(null)
  const [errors, setErrors] = React.useState<Partial<Record<"title" | "body" | "publishedAt", string>>>({})

  const [categories, setCategories] = React.useState<CmsCategory[]>([])
  const [tags, setTags] = React.useState<CmsTag[]>([])

  const [picker, setPicker] = React.useState<null | "featured" | "og">(null)
  const [viewRevision, setViewRevision] = React.useState<CmsRevision | null>(null)
  const [confirm, setConfirm] = React.useState<null | { type: "rollback"; revision: CmsRevision } | { type: "delete" }>(null)
  const [localDraft, setLocalDraft] = React.useState<{ form: FormState; savedAt: string } | null>(null)

  const dirty = JSON.stringify(form) !== savedSnapshot

  // "Now" for render-time comparisons (scheduled vs live); ticks every 30s so
  // the Jadwalkan/Publikasikan label flips once a chosen time passes.
  const [now, setNow] = React.useState(() => Date.now())
  React.useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(timer)
  }, [])

  // --- Load -----------------------------------------------------------------

  React.useEffect(() => {
    Promise.all([fetchCmsCategories(), fetchCmsTags()])
      .then(([c, t]) => {
        setCategories(c.data)
        setTags(t.data)
      })
      .catch((e) => toast.error(e instanceof CmsApiError ? e.message : "Gagal memuat kategori & tag"))
  }, [])

  const applyServerContent = React.useCallback((c: CmsContent) => {
    const next = fromContent(c)
    setContent(c)
    setForm(next)
    setSavedSnapshot(JSON.stringify(next))
    setEditorKey((k) => k + 1)
  }, [])

  React.useEffect(() => {
    let ignore = false
    async function load() {
      let serverUpdatedAt = 0
      if (contentId) {
        try {
          const c = await fetchCmsContent(contentId)
          if (ignore) return
          applyServerContent(c)
          serverUpdatedAt = new Date(c.updatedAt).getTime()
        } catch (e) {
          if (!ignore) setLoadError(e instanceof CmsApiError ? e.message : "Gagal memuat konten")
          return
        } finally {
          if (!ignore) setLoading(false)
        }
      }
      // Offer to restore an unsaved local copy that is newer than the server.
      try {
        const raw = localStorage.getItem(draftKey(contentId))
        if (raw) {
          const parsed = JSON.parse(raw) as { form: FormState; savedAt: string }
          if (new Date(parsed.savedAt).getTime() > serverUpdatedAt && !ignore) setLocalDraft(parsed)
        }
      } catch {
        // ignore unreadable drafts
      }
    }
    load()
    return () => {
      ignore = true
    }
  }, [contentId, applyServerContent])

  // --- Local autosave + leave guard ------------------------------------------

  React.useEffect(() => {
    if (!dirty) return
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(draftKey(contentId), JSON.stringify({ form, savedAt: new Date().toISOString() }))
      } catch {
        // storage full / disabled — autosave is best effort
      }
    }, 1500)
    return () => clearTimeout(timer)
  }, [form, dirty, contentId])

  React.useEffect(() => {
    if (!dirty) return
    function onBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault()
    }
    window.addEventListener("beforeunload", onBeforeUnload)
    return () => window.removeEventListener("beforeunload", onBeforeUnload)
  }, [dirty])

  // --- Updates ----------------------------------------------------------------

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
    if (key === "title" || key === "body" || key === "publishedAt") setErrors((e) => ({ ...e, [key]: undefined }))
  }

  function updateSeo<K extends keyof FormState["seo"]>(key: K, value: FormState["seo"][K]) {
    setForm((f) => ({ ...f, seo: { ...f.seo, [key]: value } }))
  }

  function onTitleChange(title: string) {
    setForm((f) => ({ ...f, title, slug: f.slugLocked ? f.slug : slugify(title) }))
    setErrors((e) => ({ ...e, title: undefined }))
  }

  const onBodyChange = React.useCallback((html: string) => {
    setForm((f) => ({ ...f, body: html }))
    setErrors((e) => (e.body ? { ...e, body: undefined } : e))
  }, [])

  // --- Save -------------------------------------------------------------------

  function validate(target: FormState) {
    const next: typeof errors = {}
    if (!target.title.trim()) next.title = "Judul wajib diisi."
    if (!plainText(target.body) && !/<(img|iframe|table|hr)\b/i.test(target.body)) next.body = "Isi konten masih kosong."
    if (target.publishedAt && Number.isNaN(new Date(target.publishedAt).getTime()))
      next.publishedAt = "Format tanggal terbit tidak valid."
    setErrors(next)
    if (Object.keys(next).length) {
      toast.error(Object.values(next)[0])
      return false
    }
    return true
  }

  async function save(kind: "save" | "publish") {
    // Publishing with a future date schedules it: the public API hides
    // PUBLISHED items until publishedAt passes (see displayStatus).
    const target: FormState = kind === "publish" ? { ...form, status: "PUBLISHED" } : form
    const scheduled =
      target.status === "PUBLISHED" && !!target.publishedAt && new Date(target.publishedAt).getTime() > Date.now()
    if (!validate(target)) return
    setSaving(kind)
    try {
      const payload = buildPayload(target)
      const res = isNew
        ? await createCmsContent(payload as CmsContentPayload)
        : await updateCmsContent(contentId!, payload as Partial<CmsContentPayload>)
      try {
        localStorage.removeItem(draftKey(contentId))
      } catch {
        // ignore
      }
      toast.success(
        scheduled
          ? `Konten dijadwalkan terbit ${formatDateTime(new Date(target.publishedAt).toISOString())}.`
          : target.status === "PUBLISHED"
            ? "Konten dipublikasikan."
            : res.message || "Perubahan disimpan."
      )
      if (isNew) {
        setSavedSnapshot(JSON.stringify(target))
        router.replace(`/admin/cms/contents/${res.data.id}`)
      } else {
        applyServerContent(res.data)
      }
    } catch (e) {
      toast.error(e instanceof CmsApiError ? e.message : "Gagal menyimpan konten")
    } finally {
      setSaving(null)
    }
  }

  // Ctrl/Cmd+S saves.
  const saveRef = React.useRef(save)
  React.useEffect(() => {
    saveRef.current = save
  })
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault()
        saveRef.current("save")
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  async function handleConfirm() {
    if (!confirm || !contentId) return
    try {
      if (confirm.type === "rollback") {
        const res = await rollbackCmsContent(contentId, confirm.revision.id)
        applyServerContent(res.data)
        setViewRevision(null)
        toast.success(res.message || `Dikembalikan ke revisi #${confirm.revision.revisionNumber}.`)
      } else {
        await deleteCmsContent(contentId)
        setSavedSnapshot(JSON.stringify(form))
        toast.success("Konten dihapus.")
        router.push("/admin/cms/contents")
      }
    } catch (e) {
      toast.error(e instanceof CmsApiError ? e.message : "Aksi gagal diproses")
    }
  }

  function restoreLocalDraft() {
    if (!localDraft) return
    setForm(localDraft.form)
    setEditorKey((k) => k + 1)
    setLocalDraft(null)
    toast.success("Draft lokal dipulihkan. Jangan lupa simpan.")
  }

  function discardLocalDraft() {
    try {
      localStorage.removeItem(draftKey(contentId))
    } catch {
      // ignore
    }
    setLocalDraft(null)
  }

  // --- Render -------------------------------------------------------------------

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2Icon className="size-4 animate-spin" />
        Memuat konten…
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
        <p className="font-semibold">Konten tidak dapat dimuat</p>
        <p className="text-sm text-muted-foreground">{loadError}</p>
        <Button variant="outline" render={<Link href="/admin/cms/contents" />}>
          <ArrowLeftIcon />
          Kembali ke daftar
        </Button>
      </div>
    )
  }

  const revisions = [...(content?.revisions ?? [])].sort((a, b) => b.revisionNumber - a.revisionNumber)
  const seoTitle = form.seo.metaTitle || form.title || "Judul artikel"
  const seoDesc = form.seo.metaDescription || form.excerpt || plainText(form.body).slice(0, 160) || "Deskripsi artikel akan tampil di sini."
  const isLive = content ? displayStatus(content, now) === "PUBLISHED" : false
  const futureDate = !!form.publishedAt && new Date(form.publishedAt).getTime() > now

  return (
    <div className="flex flex-col gap-5">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/admin" />}>
              <HomeIcon className="size-3.5" />
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/admin/cms/contents" />}>CMS · Konten</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="max-w-60 truncate">{isNew ? "Tulis Konten" : content?.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Sticky action bar */}
      <div className="sticky top-0 z-20 -mx-4 flex flex-wrap items-center gap-2 border-b border-border bg-background/95 px-4 py-2.5 backdrop-blur lg:-mx-6 lg:px-6">
        <Button variant="ghost" size="icon-sm" render={<Link href="/admin/cms/contents" />} aria-label="Kembali">
          <ArrowLeftIcon />
        </Button>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <h1 className="truncate text-lg font-semibold">{isNew ? "Tulis Konten Baru" : "Edit Konten"}</h1>
          {content && <StatusBadge status={displayStatus(content, now)} />}
          <span className={cn("text-xs", dirty ? "text-warning" : "text-muted-foreground")}>
            {dirty ? "● Belum disimpan" : content ? `Tersimpan · ${formatDateTime(content.updatedAt)}` : ""}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => save("save")} disabled={!!saving}>
            {saving === "save" ? <Loader2Icon className="animate-spin" /> : <SaveIcon />}
            {form.status === "DRAFT" ? "Simpan Draft" : "Simpan"}
          </Button>
          <Button onClick={() => save("publish")} disabled={!!saving}>
            {saving === "publish" ? <Loader2Icon className="animate-spin" /> : <SendIcon />}
            {futureDate ? "Jadwalkan" : isLive ? "Perbarui" : "Publikasikan"}
          </Button>
          {!isNew && (
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label="Aksi lain" />}>
                <MoreHorizontalIcon />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {form.status !== "ARCHIVED" && (
                  <DropdownMenuItem
                    onClick={() => {
                      update("status", "ARCHIVED")
                      toast.info("Status diubah ke Archived. Klik Simpan untuk menerapkan.")
                    }}
                  >
                    <ArchiveIcon />
                    Arsipkan
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={() => setConfirm({ type: "delete" })}>
                  <Trash2Icon />
                  Hapus konten
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {localDraft && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm">
          <HistoryIcon className="size-4 text-warning" />
          <span className="flex-1">
            Ada draft lokal yang belum tersimpan dari {formatDateTime(localDraft.savedAt)}. Pulihkan?
          </span>
          <Button size="sm" variant="outline" onClick={discardLocalDraft}>
            Buang
          </Button>
          <Button size="sm" onClick={restoreLocalDraft}>
            Pulihkan
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-5 xl:flex-row xl:items-start">
        {/* ---------------- Main column ---------------- */}
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <input
              value={form.title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Judul konten"
              aria-label="Judul konten"
              aria-invalid={!!errors.title}
              className={cn(
                "w-full bg-transparent font-heading text-3xl font-bold tracking-tight text-foreground outline-none placeholder:text-muted-foreground/50 sm:text-4xl",
                errors.title && "placeholder:text-destructive/60"
              )}
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <GlobeIcon className="size-3.5 shrink-0" />
              <span className="shrink-0">/blog/</span>
              <input
                value={form.slug}
                onChange={(e) => {
                  setForm((f) => ({ ...f, slug: e.target.value, slugLocked: true }))
                }}
                onBlur={(e) => update("slug", slugify(e.target.value))}
                placeholder="slug-otomatis-dari-judul"
                aria-label="Slug URL"
                className="min-w-0 flex-1 rounded border border-transparent bg-transparent px-1 py-0.5 font-mono text-foreground outline-none hover:border-border focus:border-ring"
              />
              <button
                type="button"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    slugLocked: !f.slugLocked,
                    slug: f.slugLocked ? slugify(f.title) : f.slug,
                  }))
                }
                title={form.slugLocked ? "Slug dikunci — klik untuk sinkron otomatis dengan judul" : "Slug mengikuti judul — klik untuk mengunci"}
                className="rounded p-1 hover:bg-muted"
              >
                {form.slugLocked ? <LockIcon className="size-3.5" /> : <LockOpenIcon className="size-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="cms-excerpt">Ringkasan (excerpt)</Label>
              <CharCounter value={form.excerpt} recommended={200} />
            </div>
            <Textarea
              id="cms-excerpt"
              rows={2}
              value={form.excerpt}
              onChange={(e) => update("excerpt", e.target.value)}
              placeholder="Ringkasan singkat yang tampil di kartu artikel & hasil pencarian."
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <RichTextEditor
              key={editorKey}
              value={form.body}
              onChange={onBodyChange}
              className={cn(errors.body && "border-destructive")}
            />
            {errors.body && <p className="text-xs text-destructive">{errors.body}</p>}
          </div>
        </div>

        {/* ---------------- Sidebar ---------------- */}
        <aside className="flex w-full shrink-0 flex-col gap-4 xl:sticky xl:top-16 xl:w-80">
          <Panel title="Publikasi" icon={CalendarClockIcon}>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cms-status">Status</Label>
              <select
                id="cms-status"
                value={form.status}
                onChange={(e) => update("status", e.target.value as ContentStatus)}
                className="h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm dark:bg-input/30"
              >
                {CONTENT_STATUS_OPTIONS.filter((s) => s.value !== "SCHEDULED" || form.status === "SCHEDULED").map(
                  (s) => (
                    <option key={s.value} value={s.value}>
                      {s.value === "PUBLISHED" && futureDate ? "Published (terjadwal)" : s.label}
                    </option>
                  )
                )}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cms-published-at">Tanggal & jam terbit</Label>
              <div className="flex items-center gap-1.5">
                <Input
                  id="cms-published-at"
                  type="datetime-local"
                  value={form.publishedAt}
                  onChange={(e) => update("publishedAt", e.target.value)}
                  aria-invalid={!!errors.publishedAt}
                  className="flex-1"
                />
                {form.publishedAt && (
                  <Button variant="ghost" size="icon-sm" onClick={() => update("publishedAt", "")} aria-label="Kosongkan tanggal">
                    <XIcon />
                  </Button>
                )}
              </div>
              {errors.publishedAt ? (
                <p className="text-xs text-destructive">{errors.publishedAt}</p>
              ) : (
                <p className="text-[11px] text-muted-foreground">
                  Kosongkan untuk memakai waktu saat dipublikasikan. Isi tanggal di masa depan lalu klik{" "}
                  <b>Jadwalkan</b> — konten tayang otomatis pada waktu tersebut.
                </p>
              )}
            </div>
            {form.status === "SCHEDULED" && (
              <p className="rounded-lg bg-warning/10 px-2.5 py-2 text-[11px] text-warning">
                Status “Scheduled” tidak tayang otomatis. Untuk menjadwalkan, isi tanggal terbit lalu klik Jadwalkan.
              </p>
            )}
            {content && (
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 border-t border-border pt-3 text-xs">
                <dt className="text-muted-foreground">Penulis</dt>
                <dd className="truncate">{content.author?.name ?? "-"}</dd>
                <dt className="text-muted-foreground">Dibuat</dt>
                <dd>{formatDateTime(content.createdAt)}</dd>
                <dt className="text-muted-foreground">Diperbarui</dt>
                <dd>{formatDateTime(content.updatedAt)}</dd>
                {content.publishedAt && (
                  <>
                    <dt className="text-muted-foreground">Terbit</dt>
                    <dd>{formatDateTime(content.publishedAt)}</dd>
                  </>
                )}
              </dl>
            )}
          </Panel>

          <Panel title="Gambar Utama" icon={ImageIcon}>
            <ImageSlot
              media={form.featured}
              onPick={() => setPicker("featured")}
              onClear={() => update("featured", null)}
              emptyLabel="Pilih gambar utama"
            />
            <p className="text-[11px] text-muted-foreground">Rasio 16:9 disarankan, minimal 1200×675 px.</p>
          </Panel>

          <Panel title="Kategori" aside={<span className="text-xs text-muted-foreground">{form.categoryIds.length}</span>}>
            <CategorySelector
              categories={categories}
              value={form.categoryIds}
              onChange={(ids) => update("categoryIds", ids)}
              onCreated={(c) => setCategories((list) => [...list, c])}
            />
          </Panel>

          <Panel title="Tag" aside={<span className="text-xs text-muted-foreground">{form.tagIds.length}</span>}>
            <TagSelector
              tags={tags}
              value={form.tagIds}
              onChange={(ids) => update("tagIds", ids)}
              onCreated={(t) => setTags((list) => [...list, t])}
            />
          </Panel>

          <Panel title="SEO & Social" icon={EyeIcon} defaultOpen={false}>
            <div className="rounded-lg border border-border bg-background p-3">
              <p className="text-[11px] text-muted-foreground">Pratinjau Google</p>
              <p className="mt-1 truncate text-[11px] text-emerald-700 dark:text-emerald-400">
                katamereka.id › blog › {form.slug || "slug"}
              </p>
              <p className="line-clamp-1 text-base leading-snug text-blue-700 dark:text-blue-400">{seoTitle}</p>
              <p className="line-clamp-2 text-xs text-muted-foreground">{seoDesc}</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="seo-title">Meta title</Label>
                <CharCounter value={form.seo.metaTitle} recommended={60} max={70} />
              </div>
              <Input
                id="seo-title"
                value={form.seo.metaTitle}
                onChange={(e) => updateSeo("metaTitle", e.target.value)}
                placeholder={form.title || "Default: judul konten"}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="seo-desc">Meta description</Label>
                <CharCounter value={form.seo.metaDescription} recommended={160} max={200} />
              </div>
              <Textarea
                id="seo-desc"
                rows={3}
                value={form.seo.metaDescription}
                onChange={(e) => updateSeo("metaDescription", e.target.value)}
                placeholder="Default: ringkasan konten"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="seo-canonical">Canonical URL</Label>
              <Input
                id="seo-canonical"
                type="url"
                value={form.seo.canonicalUrl}
                onChange={(e) => updateSeo("canonicalUrl", e.target.value)}
                placeholder="https://katamereka.id/blog/…"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={form.seo.robotsIndex} onCheckedChange={(v) => updateSeo("robotsIndex", !!v)} />
                Izinkan diindeks mesin pencari (index)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={form.seo.robotsFollow} onCheckedChange={(v) => updateSeo("robotsFollow", !!v)} />
                Izinkan link diikuti (follow)
              </label>
            </div>

            <div className="flex flex-col gap-3 border-t border-border pt-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Open Graph (Facebook, WhatsApp, X)</p>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="og-title">OG title</Label>
                <Input
                  id="og-title"
                  value={form.seo.ogTitle}
                  onChange={(e) => updateSeo("ogTitle", e.target.value)}
                  placeholder={seoTitle}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="og-desc">OG description</Label>
                <Textarea
                  id="og-desc"
                  rows={2}
                  value={form.seo.ogDescription}
                  onChange={(e) => updateSeo("ogDescription", e.target.value)}
                  placeholder={seoDesc}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>OG image</Label>
                <ImageSlot
                  media={form.seo.og}
                  onPick={() => setPicker("og")}
                  onClear={() => updateSeo("og", null)}
                  aspect="aspect-[1.91/1]"
                  emptyLabel="Default: gambar utama"
                />
              </div>
            </div>
          </Panel>

          {!isNew && (
            <Panel
              title="Riwayat Revisi"
              icon={HistoryIcon}
              defaultOpen={false}
              aside={<span className="text-xs text-muted-foreground">{revisions.length}</span>}
            >
              {revisions.length === 0 ? (
                <p className="text-xs text-muted-foreground">Belum ada revisi.</p>
              ) : (
                <ol className="flex max-h-80 flex-col gap-1 overflow-y-auto">
                  {revisions.map((r, i) => (
                    <li key={r.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold">
                        #{r.revisionNumber}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium">{r.title}</p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {formatDateTime(r.createdAt)} · {r.createdBy?.name ?? "—"}
                          {i === 0 && " · terkini"}
                        </p>
                      </div>
                      <Button variant="ghost" size="xs" onClick={() => setViewRevision(r)}>
                        Lihat
                      </Button>
                    </li>
                  ))}
                </ol>
              )}
              <p className="text-[11px] text-muted-foreground">
                Setiap simpan membuat revisi baru (judul, ringkasan, isi). Rollback juga tercatat sebagai revisi.
              </p>
            </Panel>
          )}
        </aside>
      </div>

      <MediaPickerDialog
        open={picker !== null}
        onOpenChange={(open) => !open && setPicker(null)}
        allowUrl={false}
        title={picker === "og" ? "Pilih Gambar Open Graph" : "Pilih Gambar Utama"}
        description="Gambar harus berasal dari media library agar bisa ditautkan ke konten."
        onSelect={(media) => {
          if (!media.mediaId) return
          const ref = { id: media.mediaId, url: media.url, alt: media.alt }
          if (picker === "og") updateSeo("og", ref)
          else update("featured", ref)
        }}
      />

      <Dialog open={!!viewRevision} onOpenChange={(open) => !open && setViewRevision(null)}>
        <DialogContent className="max-w-3xl">
          {viewRevision && (
            <>
              <DialogHeader>
                <DialogTitle>
                  Revisi #{viewRevision.revisionNumber} · {viewRevision.title}
                </DialogTitle>
                <DialogDescription>
                  {formatDateTime(viewRevision.createdAt)} oleh {viewRevision.createdBy?.name ?? "—"}
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-[60vh] overflow-y-auto rounded-lg border border-border p-5">
                {viewRevision.excerpt && (
                  <p className="mb-4 border-l-2 border-border pl-3 text-sm text-muted-foreground italic">
                    {viewRevision.excerpt}
                  </p>
                )}
                <ReadOnlyContent html={viewRevision.body} />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setViewRevision(null)}>
                  Tutup
                </Button>
                <Button onClick={() => setConfirm({ type: "rollback", revision: viewRevision })}>
                  <RotateCcwIcon />
                  Kembalikan ke revisi ini
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {confirm && (
        <ConfirmDialog
          open
          onOpenChange={(open) => !open && setConfirm(null)}
          title={confirm.type === "delete" ? "Hapus konten ini?" : `Kembalikan ke revisi #${confirm.revision.revisionNumber}?`}
          description={
            confirm.type === "delete"
              ? "Konten akan dihapus dari CMS dan tidak tampil lagi di situs."
              : dirty
                ? "Judul, ringkasan, dan isi akan diganti dengan versi revisi ini. Perubahan yang belum disimpan akan hilang."
                : "Judul, ringkasan, dan isi akan diganti dengan versi revisi ini. Versi saat ini tetap tersimpan di riwayat."
          }
          confirmLabel={confirm.type === "delete" ? "Hapus" : "Kembalikan"}
          variant={confirm.type === "delete" ? "destructive" : "default"}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  )
}
