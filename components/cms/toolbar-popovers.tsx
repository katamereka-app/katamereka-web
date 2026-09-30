"use client"

import * as React from "react"
import type { Editor } from "@tiptap/react"
import { useEditorState } from "@tiptap/react"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BaselineIcon,
  CaseSensitiveIcon,
  ExternalLinkIcon,
  HighlighterIcon,
  Link2Icon,
  Link2OffIcon,
  OmegaIcon,
  ReplaceAllIcon,
  ReplaceIcon,
  SearchIcon,
  TableIcon,
  SquarePlayIcon,
  XIcon,
  BetweenHorizontalStartIcon,
  BetweenHorizontalEndIcon,
  BetweenVerticalStartIcon,
  BetweenVerticalEndIcon,
  Trash2Icon,
  TableCellsMergeIcon,
  PanelTopIcon,
  PanelLeftIcon,
  Columns3Icon,
  Rows3Icon,
} from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ToolbarButton } from "./toolbar-primitives"

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------

const TEXT_COLORS = [
  "#000000", "#374151", "#6b7280", "#9ca3af", "#d1d5db", "#ffffff",
  "#dc2626", "#ea580c", "#d97706", "#ca8a04", "#65a30d", "#16a34a",
  "#059669", "#0d9488", "#0891b2", "#0284c7", "#2563eb", "#4f46e5",
  "#7c3aed", "#9333ea", "#c026d3", "#db2777", "#e11d48", "#78350f",
]

const HIGHLIGHT_COLORS = [
  "#fef08a", "#fde68a", "#fed7aa", "#fecaca", "#fbcfe8", "#e9d5ff",
  "#c7d2fe", "#bfdbfe", "#a5f3fc", "#99f6e4", "#bbf7d0", "#d9f99d",
  "#e5e7eb", "#fca5a5", "#fdba74", "#86efac", "#93c5fd", "#f0abfc",
]

export function ColorPopover({ editor, mode }: { editor: Editor; mode: "text" | "highlight" }) {
  const [open, setOpen] = React.useState(false)
  const current = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      mode === "text"
        ? ((e.getAttributes("textStyle").color as string | undefined) ?? null)
        : ((e.getAttributes("highlight").color as string | undefined) ?? (e.isActive("highlight") ? "#fef08a" : null)),
  })
  const palette = mode === "text" ? TEXT_COLORS : HIGHLIGHT_COLORS
  const [custom, setCustom] = React.useState(mode === "text" ? "#16a34a" : "#fef08a")

  function apply(color: string) {
    if (mode === "text") editor.chain().focus().setColor(color).run()
    else editor.chain().focus().setHighlight({ color }).run()
    setOpen(false)
  }

  function reset() {
    if (mode === "text") editor.chain().focus().unsetColor().run()
    else editor.chain().focus().unsetHighlight().run()
    setOpen(false)
  }

  const Icon = mode === "text" ? BaselineIcon : HighlighterIcon

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <ToolbarButton
            label={mode === "text" ? "Warna teks" : "Highlight / warna latar"}
            shortcut={mode === "highlight" ? "Mod-Shift-H" : undefined}
            active={!!current}
          />
        }
      >
        <span className="relative flex flex-col items-center">
          <Icon />
          <span
            className="mt-px h-[3px] w-4 rounded-full"
            style={{ background: current ?? (mode === "text" ? "currentColor" : "transparent") }}
          />
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          {mode === "text" ? "Warna teks" : "Warna highlight"}
        </p>
        <div className="grid grid-cols-6 gap-1.5">
          {palette.map((color) => (
            <button
              key={color}
              type="button"
              title={color}
              onClick={() => apply(color)}
              className={cn(
                "size-7 rounded-md border border-border transition-transform hover:scale-110",
                current?.toLowerCase() === color && "ring-2 ring-primary ring-offset-1"
              )}
              style={{ background: color }}
            />
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <input
            type="color"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            className="h-8 w-10 cursor-pointer rounded border border-border bg-transparent p-0.5"
            aria-label="Pilih warna kustom"
          />
          <Input
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            className="h-8 flex-1 font-mono text-xs"
          />
          <Button size="sm" onClick={() => apply(custom)}>
            Pakai
          </Button>
        </div>
        <Button variant="ghost" size="sm" className="mt-2 w-full" onClick={reset}>
          <XIcon />
          {mode === "text" ? "Hapus warna teks" : "Hapus highlight"}
        </Button>
      </PopoverContent>
    </Popover>
  )
}

// ---------------------------------------------------------------------------
// Link
// ---------------------------------------------------------------------------

function normalizeUrl(raw: string) {
  const url = raw.trim()
  if (!url) return ""
  if (/^(https?:|mailto:|tel:|#|\/)/i.test(url)) return url
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(url)) return `mailto:${url}`
  return `https://${url}`
}

export function LinkEditorFields({
  editor,
  onDone,
  autoFocus = true,
}: {
  editor: Editor
  onDone: () => void
  autoFocus?: boolean
}) {
  const attrs = editor.getAttributes("link") as { href?: string; target?: string | null }
  const [href, setHref] = React.useState(attrs.href ?? "")
  const [newTab, setNewTab] = React.useState(attrs.target === "_blank")
  const { from, to } = editor.state.selection
  const hasSelection = from !== to || editor.isActive("link")
  const [text, setText] = React.useState("")

  function apply(e?: React.FormEvent) {
    e?.preventDefault()
    const url = normalizeUrl(href)
    if (!url) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      onDone()
      return
    }
    const linkAttrs = { href: url, target: newTab ? "_blank" : null }
    if (hasSelection) {
      editor.chain().focus().extendMarkRange("link").setLink(linkAttrs).run()
    } else {
      const label = text.trim() || url
      editor
        .chain()
        .focus()
        .insertContent({ type: "text", text: label, marks: [{ type: "link", attrs: linkAttrs }] })
        .unsetMark("link")
        .insertContent(" ")
        .run()
    }
    onDone()
  }

  return (
    <form onSubmit={apply} className="flex flex-col gap-2.5">
      {!hasSelection && (
        <div className="flex flex-col gap-1">
          <Label htmlFor="link-text" className="text-xs">
            Teks link
          </Label>
          <Input
            id="link-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Teks yang ditampilkan"
            className="h-8"
          />
        </div>
      )}
      <div className="flex flex-col gap-1">
        <Label htmlFor="link-href" className="text-xs">
          URL
        </Label>
        <Input
          id="link-href"
          autoFocus={autoFocus}
          value={href}
          onChange={(e) => setHref(e.target.value)}
          placeholder="https://… , email, atau /halaman-internal"
          className="h-8"
        />
      </div>
      <label className="flex items-center gap-2 text-xs">
        <Checkbox checked={newTab} onCheckedChange={(v) => setNewTab(!!v)} />
        Buka di tab baru
      </label>
      <div className="flex items-center justify-between gap-2">
        {editor.isActive("link") ? (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => {
              editor.chain().focus().extendMarkRange("link").unsetLink().run()
              onDone()
            }}
          >
            <Link2OffIcon />
            Hapus link
          </Button>
        ) : (
          <span />
        )}
        <Button type="submit" size="sm">
          Simpan
        </Button>
      </div>
    </form>
  )
}

export function LinkPopover({ editor }: { editor: Editor }) {
  const [open, setOpen] = React.useState(false)
  const active = useEditorState({ editor, selector: ({ editor: e }) => e.isActive("link") })

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<ToolbarButton label="Sisipkan / edit link" shortcut="Mod-K" active={active} />}>
        <Link2Icon />
      </PopoverTrigger>
      <PopoverContent className="w-80">
        {open && <LinkEditorFields editor={editor} onDone={() => setOpen(false)} />}
      </PopoverContent>
    </Popover>
  )
}

export function LinkPreviewRow({ editor, onEdit }: { editor: Editor; onEdit: () => void }) {
  const href = (editor.getAttributes("link").href as string | undefined) ?? ""
  return (
    <div className="flex items-center gap-1">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="max-w-52 truncate px-1.5 text-xs text-primary underline"
      >
        {href}
      </a>
      <ToolbarButton label="Buka link" onClick={() => window.open(href, "_blank", "noopener,noreferrer")}>
        <ExternalLinkIcon />
      </ToolbarButton>
      <ToolbarButton label="Edit link" onClick={onEdit}>
        <Link2Icon />
      </ToolbarButton>
      <ToolbarButton
        label="Hapus link"
        onClick={() => editor.chain().focus().extendMarkRange("link").unsetLink().run()}
      >
        <Link2OffIcon />
      </ToolbarButton>
    </div>
  )
}

// ---------------------------------------------------------------------------
// YouTube
// ---------------------------------------------------------------------------

export function YoutubePopover({ editor }: { editor: Editor }) {
  const [open, setOpen] = React.useState(false)
  const [url, setUrl] = React.useState("")
  const [error, setError] = React.useState("")

  function insert(e: React.FormEvent) {
    e.preventDefault()
    const ok = editor.chain().focus().setYoutubeVideo({ src: url.trim() }).run()
    if (!ok) {
      setError("URL YouTube tidak valid. Contoh: https://www.youtube.com/watch?v=xxxx")
      return
    }
    setUrl("")
    setError("")
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<ToolbarButton label="Sisipkan video YouTube" />}>
        <SquarePlayIcon />
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <form onSubmit={insert} className="flex flex-col gap-2">
          <Label htmlFor="yt-url" className="text-xs">
            URL video YouTube
          </Label>
          <Input
            id="yt-url"
            autoFocus
            value={url}
            onChange={(e) => {
              setUrl(e.target.value)
              setError("")
            }}
            placeholder="https://www.youtube.com/watch?v=…"
            className="h-8"
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button type="submit" size="sm" className="self-end" disabled={!url.trim()}>
            Sisipkan
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  )
}

// ---------------------------------------------------------------------------
// Table
// ---------------------------------------------------------------------------

const GRID_MAX = 10

export function TablePopover({ editor }: { editor: Editor }) {
  const [open, setOpen] = React.useState(false)
  const [hover, setHover] = React.useState({ rows: 0, cols: 0 })
  const [withHeader, setWithHeader] = React.useState(true)
  const t = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      inTable: e.isActive("table"),
      canMerge: e.can().mergeCells(),
      canSplit: e.can().splitCell(),
    }),
  })

  function run(fn: (chain: ReturnType<Editor["chain"]>) => ReturnType<Editor["chain"]>) {
    fn(editor.chain().focus()).run()
  }

  const actions: {
    label: string
    icon: React.ComponentType
    onClick: () => void
    disabled?: boolean
    destructive?: boolean
  }[][] = [
    [
      { label: "Tambah baris di atas", icon: BetweenHorizontalStartIcon, onClick: () => run((c) => c.addRowBefore()) },
      { label: "Tambah baris di bawah", icon: BetweenHorizontalEndIcon, onClick: () => run((c) => c.addRowAfter()) },
      { label: "Hapus baris", icon: Rows3Icon, onClick: () => run((c) => c.deleteRow()), destructive: true },
    ],
    [
      { label: "Tambah kolom di kiri", icon: BetweenVerticalStartIcon, onClick: () => run((c) => c.addColumnBefore()) },
      { label: "Tambah kolom di kanan", icon: BetweenVerticalEndIcon, onClick: () => run((c) => c.addColumnAfter()) },
      { label: "Hapus kolom", icon: Columns3Icon, onClick: () => run((c) => c.deleteColumn()), destructive: true },
    ],
    [
      { label: "Gabungkan sel", icon: TableCellsMergeIcon, onClick: () => run((c) => c.mergeCells()), disabled: !t.canMerge },
      { label: "Pisahkan sel", icon: TableIcon, onClick: () => run((c) => c.splitCell()), disabled: !t.canSplit },
      { label: "Baris header on/off", icon: PanelTopIcon, onClick: () => run((c) => c.toggleHeaderRow()) },
      { label: "Kolom header on/off", icon: PanelLeftIcon, onClick: () => run((c) => c.toggleHeaderColumn()) },
    ],
    [
      {
        label: "Hapus tabel",
        icon: Trash2Icon,
        onClick: () => {
          run((c) => c.deleteTable())
          setOpen(false)
        },
        destructive: true,
      },
    ],
  ]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<ToolbarButton label={t.inTable ? "Opsi tabel" : "Sisipkan tabel"} active={t.inTable} />}>
        <TableIcon />
      </PopoverTrigger>
      <PopoverContent className={t.inTable ? "w-60 p-1.5" : "w-auto"}>
        {t.inTable ? (
          <div className="flex flex-col">
            {actions.map((group, gi) => (
              <div key={gi} className={cn("flex flex-col py-1", gi > 0 && "border-t border-border")}>
                {group.map((a) => (
                  <button
                    key={a.label}
                    type="button"
                    disabled={a.disabled}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={a.onClick}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4",
                      a.destructive && "text-destructive hover:bg-destructive/10"
                    )}
                  >
                    <a.icon />
                    {a.label}
                  </button>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-muted-foreground">
              {hover.rows > 0 ? `${hover.rows} × ${hover.cols} tabel` : "Pilih ukuran tabel"}
            </p>
            <div
              className="grid gap-0.5"
              style={{ gridTemplateColumns: `repeat(${GRID_MAX}, 1fr)` }}
              onMouseLeave={() => setHover({ rows: 0, cols: 0 })}
            >
              {Array.from({ length: GRID_MAX * GRID_MAX }).map((_, i) => {
                const r = Math.floor(i / GRID_MAX) + 1
                const c = (i % GRID_MAX) + 1
                const on = r <= hover.rows && c <= hover.cols
                return (
                  <button
                    key={i}
                    type="button"
                    aria-label={`${r} x ${c}`}
                    onMouseEnter={() => setHover({ rows: r, cols: c })}
                    onClick={() => {
                      editor.chain().focus().insertTable({ rows: r, cols: c, withHeaderRow: withHeader }).run()
                      setOpen(false)
                    }}
                    className={cn(
                      "size-4.5 rounded-[3px] border transition-colors",
                      on ? "border-primary bg-primary/25" : "border-border bg-background"
                    )}
                  />
                )
              })}
            </div>
            <label className="flex items-center gap-2 text-xs">
              <Checkbox checked={withHeader} onCheckedChange={(v) => setWithHeader(!!v)} />
              Baris pertama sebagai header
            </label>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

// ---------------------------------------------------------------------------
// Special characters & emoji
// ---------------------------------------------------------------------------

const SYMBOLS = [
  "©", "®", "™", "§", "¶", "†", "‡", "•", "…", "—", "–", "«", "»", "“", "”", "‘", "’",
  "€", "£", "¥", "¢", "$", "₹", "Rp",
  "°", "±", "×", "÷", "≠", "≈", "≤", "≥", "∞", "√", "∑", "π", "µ", "½", "¼", "¾", "²", "³",
  "←", "→", "↑", "↓", "↔", "⇐", "⇒", "✓", "✗", "★", "☆", "♥", "♦", "♣", "♠", "☎", "✉", "⚑",
]

const EMOJIS = [
  "😀", "😁", "😂", "🤣", "😊", "😍", "🥰", "😎", "🤩", "🤔", "😴", "😢", "😡", "🥳", "😱", "🙄",
  "👍", "👎", "👏", "🙏", "💪", "🤝", "👀", "✌️", "👌", "🙌",
  "❤️", "🔥", "✨", "⭐", "🎉", "🎁", "💡", "📌", "📍", "✅", "❌", "⚠️", "❓", "💯", "🚀", "🏆",
  "☕", "🍜", "🍔", "🍕", "🍰", "🍹", "🏨", "🏠", "🏢", "🛍️", "🚗", "✈️", "🏝️", "📸", "📱", "💳",
]

export function SpecialCharsPopover({ editor }: { editor: Editor }) {
  const [open, setOpen] = React.useState(false)
  const [tab, setTab] = React.useState<"symbols" | "emoji">("symbols")
  const list = tab === "symbols" ? SYMBOLS : EMOJIS

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<ToolbarButton label="Karakter spesial & emoji" />}>
        <OmegaIcon />
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="mb-2 flex gap-1">
          {(["symbols", "emoji"] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium",
                tab === key ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
              )}
            >
              {key === "symbols" ? "Simbol" : "Emoji"}
            </button>
          ))}
        </div>
        <div className="grid max-h-60 grid-cols-8 gap-1 overflow-y-auto">
          {list.map((ch) => (
            <button
              key={ch}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().insertContent(ch).run()}
              className="flex h-8 items-center justify-center rounded-md text-base hover:bg-muted"
            >
              {ch}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

// ---------------------------------------------------------------------------
// Find & replace
// ---------------------------------------------------------------------------

interface Match {
  from: number
  to: number
}

function findMatches(editor: Editor, term: string, caseSensitive: boolean): Match[] {
  if (!term) return []
  const needle = caseSensitive ? term : term.toLowerCase()
  const matches: Match[] = []
  editor.state.doc.descendants((node, pos) => {
    if (!node.isText || !node.text) return
    const hay = caseSensitive ? node.text : node.text.toLowerCase()
    let idx = hay.indexOf(needle)
    while (idx !== -1) {
      matches.push({ from: pos + idx, to: pos + idx + needle.length })
      idx = hay.indexOf(needle, idx + needle.length)
    }
  })
  return matches
}

export function FindReplacePopover({ editor }: { editor: Editor }) {
  const [open, setOpen] = React.useState(false)
  const [term, setTerm] = React.useState("")
  const [replacement, setReplacement] = React.useState("")
  const [caseSensitive, setCaseSensitive] = React.useState(false)
  const [index, setIndex] = React.useState(0)

  // Recomputed on every doc change so counts stay correct after replacing.
  // Identity check: ProseMirror docs are immutable, so a new doc object means
  // a change — avoids deep-comparing the whole document on every keystroke.
  const docVersion = useEditorState({
    editor,
    selector: ({ editor: e }) => e.state.doc,
    equalityFn: (a, b) => a === b,
  })
  const matches = React.useMemo(
    () => findMatches(editor, term, caseSensitive),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editor, term, caseSensitive, docVersion]
  )
  const current = matches.length ? Math.min(index, matches.length - 1) : -1

  // Ctrl/Cmd+F opens the panel while the editor is focused.
  React.useEffect(() => {
    const dom = editor.view.dom
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "f") {
        e.preventDefault()
        const { from, to } = editor.state.selection
        if (from !== to) setTerm(editor.state.doc.textBetween(from, to, " "))
        setOpen(true)
      }
    }
    dom.addEventListener("keydown", onKey)
    return () => dom.removeEventListener("keydown", onKey)
  }, [editor])

  function select(i: number) {
    const m = matches[i]
    if (!m) return
    setIndex(i)
    editor.chain().setTextSelection(m).scrollIntoView().run()
  }

  function step(delta: number) {
    if (!matches.length) return
    select((current + delta + matches.length) % matches.length)
  }

  function replaceCurrent() {
    const m = matches[current]
    if (!m) return
    // insertText (not insertContent) so the replacement is never parsed as HTML.
    const { tr } = editor.state
    if (replacement) tr.insertText(replacement, m.from, m.to)
    else tr.delete(m.from, m.to)
    editor.view.dispatch(tr)
    // The following match shifts into the same index once matches recompute.
  }

  function replaceAll() {
    if (!matches.length) return
    const { tr } = editor.state
    for (let i = matches.length - 1; i >= 0; i--) {
      const m = matches[i]
      if (replacement) tr.insertText(replacement, m.from, m.to)
      else tr.delete(m.from, m.to)
    }
    editor.view.dispatch(tr)
    setIndex(0)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<ToolbarButton label="Cari & ganti" shortcut="Mod-F" />}>
        <SearchIcon />
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <Input
              autoFocus
              value={term}
              onChange={(e) => {
                setTerm(e.target.value)
                setIndex(0)
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  step(e.shiftKey ? -1 : 1)
                }
              }}
              placeholder="Cari teks…"
              className="h-8 flex-1"
            />
            <ToolbarButton
              label="Huruf besar/kecil sensitif"
              active={caseSensitive}
              onClick={() => setCaseSensitive((v) => !v)}
            >
              <CaseSensitiveIcon />
            </ToolbarButton>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{term ? (matches.length ? `${current + 1} dari ${matches.length}` : "Tidak ditemukan") : " "}</span>
            <div className="flex">
              <ToolbarButton label="Sebelumnya" disabled={!matches.length} onClick={() => step(-1)}>
                <ArrowUpIcon />
              </ToolbarButton>
              <ToolbarButton label="Berikutnya" disabled={!matches.length} onClick={() => step(1)}>
                <ArrowDownIcon />
              </ToolbarButton>
            </div>
          </div>
          <Input
            value={replacement}
            onChange={(e) => setReplacement(e.target.value)}
            placeholder="Ganti dengan…"
            className="h-8"
          />
          <div className="flex justify-end gap-1.5">
            <Button variant="outline" size="sm" disabled={!matches.length} onClick={replaceCurrent}>
              <ReplaceIcon />
              Ganti
            </Button>
            <Button size="sm" disabled={!matches.length} onClick={replaceAll}>
              <ReplaceAllIcon />
              Ganti semua
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
