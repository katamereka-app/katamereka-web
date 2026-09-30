"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import { CornerDownRightIcon, FolderTreeIcon, HomeIcon, Loader2Icon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"

import { flattenCategoryTree, type CategoryNode } from "@/components/cms/taxonomy-selectors"
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
import { Textarea } from "@/components/ui/textarea"
import { formatDate } from "@/lib/format"
import {
  CmsApiError,
  createCmsCategory,
  deleteCmsCategory,
  fetchCmsCategories,
  slugify,
  updateCmsCategory,
  type CmsCategory,
} from "@/lib/cms-api"

interface Draft {
  id?: string
  name: string
  slug: string
  slugTouched: boolean
  description: string
  parentId: string
}

const EMPTY_DRAFT: Draft = { name: "", slug: "", slugTouched: false, description: "", parentId: "" }

export default function CmsCategoriesPage() {
  const [categories, setCategories] = React.useState<CmsCategory[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string>()
  const [search, setSearch] = React.useState("")
  const [refreshTick, setRefreshTick] = React.useState(0)

  const [draft, setDraft] = React.useState<Draft | null>(null)
  const [saving, setSaving] = React.useState(false)
  const [toDelete, setToDelete] = React.useState<CmsCategory | null>(null)

  React.useEffect(() => {
    let ignore = false
    fetchCmsCategories()
      .then((res) => {
        if (ignore) return
        setCategories(res.data)
        setError(undefined)
      })
      .catch((e) => !ignore && setError(e instanceof CmsApiError ? e.message : "Gagal memuat kategori"))
      .finally(() => !ignore && setIsLoading(false))
    return () => {
      ignore = true
    }
  }, [refreshTick])

  const tree = flattenCategoryTree(categories)
  const q = search.trim().toLowerCase()
  const rows = q
    ? tree.filter((c) => c.name.toLowerCase().includes(q) || c.slug.includes(q) || c.description?.toLowerCase().includes(q))
    : tree

  // A category can't be moved under itself or one of its descendants.
  const invalidParents = (() => {
    if (!draft?.id) return new Set<string>()
    const blocked = new Set<string>([draft.id])
    let grew = true
    while (grew) {
      grew = false
      for (const c of categories) {
        if (c.parentId && blocked.has(c.parentId) && !blocked.has(c.id)) {
          blocked.add(c.id)
          grew = true
        }
      }
    }
    return blocked
  })()

  function openCreate(parentId = "") {
    setDraft({ ...EMPTY_DRAFT, parentId })
  }

  function openEdit(c: CmsCategory) {
    setDraft({
      id: c.id,
      name: c.name,
      slug: c.slug,
      slugTouched: true,
      description: c.description ?? "",
      parentId: c.parentId ?? "",
    })
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!draft || !draft.name.trim()) return
    setSaving(true)
    try {
      const payload = {
        name: draft.name.trim(),
        slug: draft.slug.trim() || undefined,
        description: draft.description.trim(),
      }
      if (draft.id) {
        await updateCmsCategory(draft.id, { ...payload, parentId: draft.parentId || null })
        toast.success("Kategori diperbarui.")
      } else {
        await createCmsCategory({ ...payload, parentId: draft.parentId || undefined })
        toast.success("Kategori dibuat.")
      }
      setDraft(null)
      setRefreshTick((t) => t + 1)
    } catch (err) {
      toast.error(err instanceof CmsApiError ? err.message : "Gagal menyimpan kategori")
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    if (!toDelete) return
    try {
      await deleteCmsCategory(toDelete.id)
      toast.success(`Kategori “${toDelete.name}” dihapus.`)
      setRefreshTick((t) => t + 1)
    } catch (err) {
      toast.error(err instanceof CmsApiError ? err.message : "Gagal menghapus kategori")
    }
  }

  const parentName = (id: string | null) => categories.find((c) => c.id === id)?.name
  const childCount = (id: string) => categories.filter((c) => c.parentId === id).length

  const columns: ResourceTableColumn<CategoryNode>[] = [
    {
      key: "name",
      header: "Nama",
      render: (c) => (
        <div className="flex items-center gap-1.5" style={{ paddingLeft: q ? 0 : c.depth * 20 }}>
          {c.depth > 0 && !q && <CornerDownRightIcon className="size-3.5 text-muted-foreground" />}
          <span className="font-medium text-foreground">{c.name}</span>
        </div>
      ),
    },
    {
      key: "slug",
      header: "Slug",
      render: (c) => <span className="font-mono text-xs text-muted-foreground">{c.slug}</span>,
    },
    {
      key: "parent",
      header: "Induk",
      render: (c) => <span className="text-muted-foreground">{parentName(c.parentId) ?? "—"}</span>,
    },
    {
      key: "description",
      header: "Deskripsi",
      render: (c) => <span className="line-clamp-1 max-w-72 text-muted-foreground">{c.description || "—"}</span>,
    },
    {
      key: "createdAt",
      header: "Dibuat",
      render: (c) => <span className="text-muted-foreground">{formatDate(c.createdAt)}</span>,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (c) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon-sm" aria-label="Tambah sub-kategori" title="Tambah sub-kategori" onClick={() => openCreate(c.id)}>
            <PlusIcon />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Edit" onClick={() => openEdit(c)}>
            <PencilIcon />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Hapus" onClick={() => setToDelete(c)}>
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
            <BreadcrumbPage>CMS · Kategori</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PageHeader
        title="Kategori Konten"
        description="Kelompokkan konten dalam kategori bertingkat (induk → sub-kategori)."
        action={
          <Button onClick={() => openCreate()}>
            <PlusIcon />
            Kategori Baru
          </Button>
        }
      />

      <div className="flex flex-col gap-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Cari kategori…" />
        <ResourceTable
          data={rows}
          columns={columns}
          getRowId={(c) => c.id}
          onRowClick={openEdit}
          isLoading={isLoading}
          error={error}
          itemLabel="kategori"
          pageSize={25}
          pageSizeOptions={[25, 50, 100]}
          emptyTitle="Belum ada kategori."
          emptyAction={
            <Button onClick={() => openCreate()}>
              <FolderTreeIcon />
              Buat kategori pertama
            </Button>
          }
        />
      </div>

      <Dialog open={!!draft} onOpenChange={(open) => !open && setDraft(null)}>
        <DialogContent>
          {draft && (
            <form onSubmit={submit} className="flex flex-col gap-4">
              <DialogHeader>
                <DialogTitle>{draft.id ? "Edit Kategori" : "Kategori Baru"}</DialogTitle>
                <DialogDescription>Slug dipakai di URL, mis. /blog/kategori/{draft.slug || "slug"}.</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cat-name">Nama</Label>
                <Input
                  id="cat-name"
                  autoFocus
                  value={draft.name}
                  onChange={(e) =>
                    setDraft((d) =>
                      d && { ...d, name: e.target.value, slug: d.slugTouched ? d.slug : slugify(e.target.value) }
                    )
                  }
                  placeholder="Contoh: Tips Kuliner"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cat-slug">Slug</Label>
                <Input
                  id="cat-slug"
                  value={draft.slug}
                  onChange={(e) => setDraft((d) => d && { ...d, slug: e.target.value, slugTouched: true })}
                  onBlur={(e) => setDraft((d) => d && { ...d, slug: slugify(e.target.value) })}
                  className="font-mono"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cat-parent">Kategori induk</Label>
                <select
                  id="cat-parent"
                  value={draft.parentId}
                  onChange={(e) => setDraft((d) => d && { ...d, parentId: e.target.value })}
                  className="h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm dark:bg-input/30"
                >
                  <option value="">— Tanpa induk (kategori utama) —</option>
                  {tree
                    .filter((c) => !invalidParents.has(c.id))
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {"   ".repeat(c.depth)}
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cat-desc">Deskripsi</Label>
                <Textarea
                  id="cat-desc"
                  rows={3}
                  value={draft.description}
                  onChange={(e) => setDraft((d) => d && { ...d, description: e.target.value })}
                  placeholder="Opsional — tampil di halaman arsip kategori."
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
          title={`Hapus kategori “${toDelete.name}”?`}
          description={
            childCount(toDelete.id)
              ? `Kategori ini punya ${childCount(toDelete.id)} sub-kategori yang akan kehilangan induknya. Konten yang memakai kategori ini tidak ikut terhapus.`
              : "Konten yang memakai kategori ini tidak ikut terhapus, hanya kehilangan kategori ini."
          }
          confirmLabel="Hapus"
          variant="destructive"
          onConfirm={confirmDelete}
        />
      )}
    </div>
  )
}
