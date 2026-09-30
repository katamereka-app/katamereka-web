"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import { HashIcon, HomeIcon, Loader2Icon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"

import { ConfirmDialog } from "@/components/confirm-dialog"
import { PageHeader } from "@/components/page-header"
import { ResourceTable, type ResourceTableColumn } from "@/components/resource-table"
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
import { formatDate } from "@/lib/format"
import {
  CmsApiError,
  createCmsTag,
  deleteCmsTag,
  fetchCmsTags,
  slugify,
  updateCmsTag,
  type CmsTag,
} from "@/lib/cms-api"

interface Draft {
  id?: string
  name: string
  slug: string
  slugTouched: boolean
}

export default function CmsTagsPage() {
  const [tags, setTags] = React.useState<CmsTag[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string>()
  const [search, setSearch] = React.useState("")
  const [refreshTick, setRefreshTick] = React.useState(0)

  const [draft, setDraft] = React.useState<Draft | null>(null)
  const [saving, setSaving] = React.useState(false)
  const [toDelete, setToDelete] = React.useState<CmsTag | null>(null)

  // Quick-add: several comma-separated tags at once.
  const [quick, setQuick] = React.useState("")
  const [quickSaving, setQuickSaving] = React.useState(false)

  React.useEffect(() => {
    let ignore = false
    fetchCmsTags()
      .then((res) => {
        if (ignore) return
        setTags(res.data)
        setError(undefined)
      })
      .catch((e) => !ignore && setError(e instanceof CmsApiError ? e.message : "Gagal memuat tag"))
      .finally(() => !ignore && setIsLoading(false))
    return () => {
      ignore = true
    }
  }, [refreshTick])

  const q = search.trim().toLowerCase()
  const rows = q ? tags.filter((t) => t.name.toLowerCase().includes(q) || t.slug.includes(q)) : tags

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!draft || !draft.name.trim()) return
    setSaving(true)
    try {
      const payload = { name: draft.name.trim(), slug: draft.slug.trim() || undefined }
      if (draft.id) {
        await updateCmsTag(draft.id, payload)
        toast.success("Tag diperbarui.")
      } else {
        await createCmsTag(payload)
        toast.success("Tag dibuat.")
      }
      setDraft(null)
      setRefreshTick((t) => t + 1)
    } catch (err) {
      toast.error(err instanceof CmsApiError ? err.message : "Gagal menyimpan tag")
    } finally {
      setSaving(false)
    }
  }

  async function quickAdd(e: React.FormEvent) {
    e.preventDefault()
    const existing = new Set(tags.map((t) => t.slug))
    const names = Array.from(
      new Map(
        quick
          .split(",")
          .map((n) => n.trim())
          .filter(Boolean)
          .map((n) => [slugify(n), n] as const)
      )
    ).filter(([slug]) => slug && !existing.has(slug))
    if (!names.length) {
      toast.info("Tidak ada tag baru — semua sudah ada.")
      return
    }
    setQuickSaving(true)
    const results = await Promise.allSettled(names.map(([, name]) => createCmsTag({ name })))
    const ok = results.filter((r) => r.status === "fulfilled").length
    const failed = results.length - ok
    if (ok) toast.success(`${ok} tag ditambahkan.`)
    if (failed) toast.error(`${failed} tag gagal ditambahkan.`)
    setQuick("")
    setQuickSaving(false)
    setRefreshTick((t) => t + 1)
  }

  async function confirmDelete() {
    if (!toDelete) return
    try {
      await deleteCmsTag(toDelete.id)
      toast.success(`Tag “${toDelete.name}” dihapus.`)
      setRefreshTick((t) => t + 1)
    } catch (err) {
      toast.error(err instanceof CmsApiError ? err.message : "Gagal menghapus tag")
    }
  }

  const columns: ResourceTableColumn<CmsTag>[] = [
    {
      key: "name",
      header: "Nama",
      sortValue: (t) => t.name.toLowerCase(),
      render: (t) => <span className="font-medium text-foreground">#{t.name}</span>,
    },
    {
      key: "slug",
      header: "Slug",
      sortValue: (t) => t.slug,
      render: (t) => <span className="font-mono text-xs text-muted-foreground">{t.slug}</span>,
    },
    {
      key: "createdAt",
      header: "Dibuat",
      sortValue: (t) => t.createdAt,
      render: (t) => <span className="text-muted-foreground">{formatDate(t.createdAt)}</span>,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (t) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Edit"
            onClick={() => setDraft({ id: t.id, name: t.name, slug: t.slug, slugTouched: true })}
          >
            <PencilIcon />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Hapus" onClick={() => setToDelete(t)}>
            <Trash2Icon className="text-destructive" />
          </Button>
        </div>
      ),
    },
  ]

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
            <BreadcrumbPage>CMS · Tag</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PageHeader
        title="Tag Konten"
        description="Label bebas untuk menghubungkan konten lintas kategori."
        action={
          <Button onClick={() => setDraft({ name: "", slug: "", slugTouched: false })}>
            <PlusIcon />
            Tag Baru
          </Button>
        }
      />

      <form onSubmit={quickAdd} className="flex flex-col gap-2 rounded-xl border border-dashed border-border p-4 sm:flex-row sm:items-center">
        <HashIcon className="hidden size-4 text-muted-foreground sm:block" />
        <Input
          value={quick}
          onChange={(e) => setQuick(e.target.value)}
          placeholder="Tambah cepat: kuliner, bandung, tips-liburan (pisahkan dengan koma)"
          className="flex-1"
        />
        <Button type="submit" variant="outline" disabled={!quick.trim() || quickSaving}>
          {quickSaving && <Loader2Icon className="animate-spin" />}
          Tambah
        </Button>
      </form>

      <div className="flex flex-col gap-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Cari tag…" />
        <ResourceTable
          data={rows}
          columns={columns}
          getRowId={(t) => t.id}
          onRowClick={(t) => setDraft({ id: t.id, name: t.name, slug: t.slug, slugTouched: true })}
          isLoading={isLoading}
          error={error}
          itemLabel="tag"
          pageSize={25}
          pageSizeOptions={[25, 50, 100]}
          emptyTitle="Belum ada tag."
        />
      </div>

      <Dialog open={!!draft} onOpenChange={(open) => !open && setDraft(null)}>
        <DialogContent>
          {draft && (
            <form onSubmit={submit} className="flex flex-col gap-4">
              <DialogHeader>
                <DialogTitle>{draft.id ? "Edit Tag" : "Tag Baru"}</DialogTitle>
                <DialogDescription>Slug dipakai di URL, mis. /blog/tag/{draft.slug || "slug"}.</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="tag-name">Nama</Label>
                <Input
                  id="tag-name"
                  autoFocus
                  value={draft.name}
                  onChange={(e) =>
                    setDraft((d) =>
                      d && { ...d, name: e.target.value, slug: d.slugTouched ? d.slug : slugify(e.target.value) }
                    )
                  }
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="tag-slug">Slug</Label>
                <Input
                  id="tag-slug"
                  value={draft.slug}
                  onChange={(e) => setDraft((d) => d && { ...d, slug: e.target.value, slugTouched: true })}
                  onBlur={(e) => setDraft((d) => d && { ...d, slug: slugify(e.target.value) })}
                  className="font-mono"
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDraft(null)}>
                  Batal
                </Button>
                <Button type="submit" disabled={!draft.name.trim() || saving}>
                  {saving && <Loader2Icon className="animate-spin" />}
                  Simpan
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {toDelete && (
        <ConfirmDialog
          open
          onOpenChange={(open) => !open && setToDelete(null)}
          title={`Hapus tag “${toDelete.name}”?`}
          description="Tag akan dilepas dari semua konten yang memakainya. Kontennya tidak ikut terhapus."
          confirmLabel="Hapus"
          variant="destructive"
          onConfirm={confirmDelete}
        />
      )}
    </div>
  )
}
