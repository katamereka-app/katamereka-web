"use client"

import * as React from "react"
import { toast } from "sonner"
import { CheckIcon, Loader2Icon, PlusIcon, SearchIcon, XIcon } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  CmsApiError,
  createCmsCategory,
  createCmsTag,
  slugify,
  type CmsCategory,
  type CmsTag,
} from "@/lib/cms-api"

// ---------------------------------------------------------------------------
// Categories (hierarchical, multi-select)
// ---------------------------------------------------------------------------

export interface CategoryNode extends CmsCategory {
  depth: number
}

/** Flattens categories into display order: each parent followed by its children. */
export function flattenCategoryTree(categories: CmsCategory[]): CategoryNode[] {
  const byParent = new Map<string | null, CmsCategory[]>()
  const ids = new Set(categories.map((c) => c.id))
  for (const c of categories) {
    // Orphans (parent deleted) are shown at root level.
    const key = c.parentId && ids.has(c.parentId) ? c.parentId : null
    byParent.set(key, [...(byParent.get(key) ?? []), c])
  }
  const out: CategoryNode[] = []
  const seen = new Set<string>()
  function walk(parent: string | null, depth: number) {
    for (const c of (byParent.get(parent) ?? []).sort((a, b) => a.name.localeCompare(b.name))) {
      if (seen.has(c.id)) continue
      seen.add(c.id)
      out.push({ ...c, depth })
      walk(c.id, depth + 1)
    }
  }
  walk(null, 0)
  return out
}

export function CategorySelector({
  categories,
  value,
  onChange,
  onCreated,
}: {
  categories: CmsCategory[]
  value: string[]
  onChange: (ids: string[]) => void
  onCreated: (category: CmsCategory) => void
}) {
  const [query, setQuery] = React.useState("")
  const [adding, setAdding] = React.useState(false)
  const [newName, setNewName] = React.useState("")
  const [newParent, setNewParent] = React.useState("")
  const [saving, setSaving] = React.useState(false)

  const tree = flattenCategoryTree(categories)
  const q = query.trim().toLowerCase()
  const visible = q ? tree.filter((c) => c.name.toLowerCase().includes(q)) : tree

  function toggle(id: string, checked: boolean) {
    onChange(checked ? [...value, id] : value.filter((v) => v !== id))
  }

  async function create(e: React.FormEvent) {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    setSaving(true)
    try {
      const res = await createCmsCategory({ name, parentId: newParent || undefined })
      onCreated(res.data)
      onChange([...value, res.data.id])
      setNewName("")
      setNewParent("")
      setAdding(false)
      toast.success(`Kategori “${res.data.name}” dibuat.`)
    } catch (err) {
      toast.error(err instanceof CmsApiError ? err.message : "Gagal membuat kategori")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {categories.length > 8 && (
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari kategori…" className="h-8 pl-7 text-xs" />
        </div>
      )}
      <div className="flex max-h-56 flex-col gap-0.5 overflow-y-auto rounded-lg border border-border p-1.5">
        {visible.length === 0 ? (
          <p className="px-1 py-3 text-center text-xs text-muted-foreground">
            {categories.length ? "Tidak ditemukan." : "Belum ada kategori."}
          </p>
        ) : (
          visible.map((c) => (
            <label
              key={c.id}
              className="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 text-sm hover:bg-muted"
              style={{ paddingLeft: q ? undefined : 6 + c.depth * 16 }}
            >
              <Checkbox checked={value.includes(c.id)} onCheckedChange={(v) => toggle(c.id, !!v)} />
              <span className="truncate">{c.name}</span>
            </label>
          ))
        )}
      </div>
      {adding ? (
        <form onSubmit={create} className="flex flex-col gap-2 rounded-lg border border-dashed border-border p-2">
          <Input autoFocus value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nama kategori baru" className="h-8 text-sm" />
          <select
            value={newParent}
            onChange={(e) => setNewParent(e.target.value)}
            className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm"
          >
            <option value="">— Tanpa induk (kategori utama) —</option>
            {tree.map((c) => (
              <option key={c.id} value={c.id}>
                {"  ".repeat(c.depth)}
                {c.name}
              </option>
            ))}
          </select>
          <div className="flex justify-end gap-1.5">
            <Button type="button" variant="ghost" size="sm" onClick={() => setAdding(false)}>
              Batal
            </Button>
            <Button type="submit" size="sm" disabled={!newName.trim() || saving}>
              {saving && <Loader2Icon className="animate-spin" />}
              Tambah
            </Button>
          </div>
        </form>
      ) : (
        <Button type="button" variant="ghost" size="sm" className="self-start" onClick={() => setAdding(true)}>
          <PlusIcon />
          Kategori baru
        </Button>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tags (chip input with autocomplete + inline create)
// ---------------------------------------------------------------------------

export function TagSelector({
  tags,
  value,
  onChange,
  onCreated,
}: {
  tags: CmsTag[]
  value: string[]
  onChange: (ids: string[]) => void
  onCreated: (tag: CmsTag) => void
}) {
  const [input, setInput] = React.useState("")
  const [open, setOpen] = React.useState(false)
  const [highlight, setHighlight] = React.useState(0)
  const [creating, setCreating] = React.useState(false)

  const selected = value.map((id) => tags.find((t) => t.id === id)).filter(Boolean) as CmsTag[]
  const q = input.trim().toLowerCase()
  const suggestions = tags
    .filter((t) => !value.includes(t.id) && (!q || t.name.toLowerCase().includes(q) || t.slug.includes(slugify(q))))
    .slice(0, 8)
  const exact = tags.find((t) => t.name.toLowerCase() === q || t.slug === slugify(q))
  const canCreate = q.length > 0 && !exact

  async function add(tag: CmsTag) {
    if (!value.includes(tag.id)) onChange([...value, tag.id])
    setInput("")
    setHighlight(0)
  }

  async function createAndAdd() {
    const name = input.trim()
    if (!name || creating) return
    setCreating(true)
    try {
      const res = await createCmsTag({ name })
      onCreated(res.data)
      onChange([...value, res.data.id])
      setInput("")
    } catch (err) {
      toast.error(err instanceof CmsApiError ? err.message : "Gagal membuat tag")
    } finally {
      setCreating(false)
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setOpen(true)
      setHighlight((h) => Math.min(h + 1, suggestions.length - (canCreate ? 0 : 1)))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setHighlight((h) => Math.max(h - 1, 0))
    } else if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      if (suggestions[highlight]) add(suggestions[highlight])
      else if (exact && !value.includes(exact.id)) add(exact)
      else if (canCreate) createAndAdd()
    } else if (e.key === "Backspace" && !input && value.length) {
      onChange(value.slice(0, -1))
    } else if (e.key === "Escape") {
      setOpen(false)
    }
  }

  return (
    <div className="relative">
      <div
        className="flex min-h-9 flex-wrap items-center gap-1 rounded-lg border border-input px-1.5 py-1 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50"
        onClick={(e) => (e.currentTarget.querySelector("input") as HTMLInputElement | null)?.focus()}
      >
        {selected.map((t) => (
          <span
            key={t.id}
            className="inline-flex items-center gap-0.5 rounded-md bg-primary/10 py-0.5 pr-0.5 pl-1.5 text-xs font-medium text-primary"
          >
            #{t.name}
            <button
              type="button"
              aria-label={`Hapus tag ${t.name}`}
              onClick={() => onChange(value.filter((id) => id !== t.id))}
              className="rounded p-0.5 hover:bg-primary/15"
            >
              <XIcon className="size-3" />
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            setOpen(true)
            setHighlight(0)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={onKeyDown}
          placeholder={selected.length ? "" : "Ketik lalu Enter…"}
          className="h-6 min-w-24 flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground"
        />
        {creating && <Loader2Icon className="size-3.5 animate-spin text-muted-foreground" />}
      </div>
      {open && (suggestions.length > 0 || canCreate) && (
        <div className="absolute inset-x-0 top-full z-20 mt-1 max-h-60 overflow-y-auto rounded-lg border border-border bg-popover p-1 shadow-lg">
          {suggestions.map((t, i) => (
            <button
              key={t.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => add(t)}
              onMouseEnter={() => setHighlight(i)}
              className={cn(
                "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm",
                highlight === i ? "bg-muted" : "hover:bg-muted"
              )}
            >
              #{t.name}
              <span className="font-mono text-[10px] text-muted-foreground">{t.slug}</span>
            </button>
          ))}
          {canCreate && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={createAndAdd}
              onMouseEnter={() => setHighlight(suggestions.length)}
              className={cn(
                "flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-sm text-primary",
                highlight === suggestions.length ? "bg-muted" : "hover:bg-muted"
              )}
            >
              <PlusIcon className="size-3.5" />
              Buat tag “{input.trim()}”
            </button>
          )}
        </div>
      )}
      {exact && value.includes(exact.id) && q && (
        <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
          <CheckIcon className="size-3" /> Tag sudah dipilih
        </p>
      )}
    </div>
  )
}
