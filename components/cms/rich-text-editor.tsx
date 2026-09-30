"use client"

import * as React from "react"
import { Extension } from "@tiptap/core"
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react"
import { BubbleMenu } from "@tiptap/react/menus"
import { NodeSelection } from "@tiptap/pm/state"
import { toast } from "sonner"
import {
  BoldIcon,
  CodeIcon,
  HighlighterIcon,
  ItalicIcon,
  Link2Icon,
  StrikethroughIcon,
  Trash2Icon,
  UnderlineIcon,
} from "lucide-react"
import { cn } from "cn"

import "./editor.css"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { TooltipProvider } from "@/components/ui/tooltip"
import { CmsApiError, resolveMediaUrl, uploadCmsMedia } from "@/lib/cms-api"
import { createEditorExtensions } from "./editor-extensions"
import { EditorToolbar, type EditorMode } from "./editor-toolbar"
import { MAX_UPLOAD_BYTES, MediaPickerDialog } from "./media-picker-dialog"
import { LinkEditorFields, LinkPreviewRow } from "./toolbar-popovers"
import { formatShortcut, ToolbarButton, ToolbarSeparator } from "./toolbar-primitives"

export interface EditorStats {
  words: number
  characters: number
  readingMinutes: number
}

const BLOCK_TAGS = "p|h[1-6]|ul|ol|li|blockquote|pre|table|thead|tbody|tr|th|td|div|details|summary|hr|img|iframe"

/** Light pretty-printer for the HTML source view — one block per line. */
function formatHtml(html: string) {
  return html
    .replace(new RegExp(`(<(?:${BLOCK_TAGS})[\\s>])`, "g"), "\n$1")
    .replace(new RegExp(`(</(?:${BLOCK_TAGS})>)`, "g"), "$1\n")
    .replace(/\n{2,}/g, "\n")
    .trim()
}

const SHORTCUTS: { group: string; items: [string, string][] }[] = [
  {
    group: "Format teks",
    items: [
      ["Tebal", "Mod-B"],
      ["Miring", "Mod-I"],
      ["Garis bawah", "Mod-U"],
      ["Coret", "Mod-Shift-S"],
      ["Kode inline", "Mod-E"],
      ["Highlight", "Mod-Shift-H"],
      ["Subscript", "Mod-,"],
      ["Superscript", "Mod-."],
      ["Link", "Mod-K"],
    ],
  },
  {
    group: "Paragraf",
    items: [
      ["Heading 1–6", "Mod-Alt-1…6"],
      ["Paragraf biasa", "Mod-Alt-0"],
      ["Bullet list", "Mod-Shift-8"],
      ["Numbered list", "Mod-Shift-7"],
      ["Task list", "Mod-Shift-9"],
      ["Kutipan", "Mod-Shift-B"],
      ["Blok kode", "Mod-Alt-C"],
      ["Rata kiri / tengah / kanan / penuh", "Mod-Shift-L/E/R/J"],
      ["Indent / outdent list", "Tab / Shift-Tab"],
      ["Baris baru tanpa paragraf", "Shift-Enter"],
    ],
  },
  {
    group: "Markdown otomatis",
    items: [
      ["Heading", "# ␣ … ###### ␣"],
      ["Bullet list", "- ␣ atau * ␣"],
      ["Numbered list", "1. ␣"],
      ["Task list", "[ ] ␣"],
      ["Kutipan", "> ␣"],
      ["Blok kode", "``` ␣"],
      ["Garis pemisah", "---"],
      ["Tebal / miring", "**teks** / *teks*"],
    ],
  },
  {
    group: "Editor",
    items: [
      ["Undo / Redo", "Mod-Z / Mod-Shift-Z"],
      ["Cari & ganti", "Mod-F"],
      ["Layar penuh", "Mod-Shift-F"],
      ["Daftar pintasan", "Mod-/"],
    ],
  },
]

function readStats(editor: Editor): EditorStats {
  const storage = editor.storage.characterCount as { words: () => number; characters: () => number }
  const words = storage.words()
  return {
    words,
    characters: storage.characters(),
    readingMinutes: Math.max(1, Math.ceil(words / 200)),
  }
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  className,
  minHeight = 420,
}: {
  /** Initial HTML. Remount the editor (change its `key`) to load different content. */
  value: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
  minHeight?: number
}) {
  const [mode, setMode] = React.useState<EditorMode>("edit")
  const [source, setSource] = React.useState("")
  const [fullscreen, setFullscreen] = React.useState(false)
  const [imageDialogOpen, setImageDialogOpen] = React.useState(false)
  const [linkDialogOpen, setLinkDialogOpen] = React.useState(false)
  const [shortcutsOpen, setShortcutsOpen] = React.useState(false)
  const [bubbleLinkEditing, setBubbleLinkEditing] = React.useState(false)

  const onChangeRef = React.useRef(onChange)
  React.useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  // Keyboard shortcuts that open React UI live outside ProseMirror, so the
  // extension calls through refs to always reach the latest setters.
  const actionsRef = React.useRef({
    openLink: () => setLinkDialogOpen(true),
    toggleFullscreen: () => setFullscreen((v) => !v),
    openShortcuts: () => setShortcutsOpen(true),
  })

  const uploadAndInsertRef = React.useRef<(files: File[], pos?: number) => void>(() => {})

  const extensions = React.useMemo(() => {
    const UiShortcuts = Extension.create({
      name: "cmsUiShortcuts",
      addKeyboardShortcuts() {
        return {
          "Mod-k": () => {
            actionsRef.current.openLink()
            return true
          },
          "Mod-Shift-f": () => {
            actionsRef.current.toggleFullscreen()
            return true
          },
          "Mod-/": () => {
            actionsRef.current.openShortcuts()
            return true
          },
        }
      },
    })
    return [...createEditorExtensions({ placeholder }), UiShortcuts]
  }, [placeholder])

  const editor = useEditor({
    extensions,
    content: value,
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    editorProps: {
      attributes: {
        class: "cms-prose min-h-full px-6 py-5 sm:px-10 sm:py-8",
        spellcheck: "true",
      },
      handlePaste: (_view, event) => {
        const files = Array.from(event.clipboardData?.files ?? []).filter((f) => f.type.startsWith("image/"))
        if (!files.length) return false
        event.preventDefault()
        uploadAndInsertRef.current(files)
        return true
      },
      handleDrop: (view, event, _slice, moved) => {
        if (moved) return false
        const files = Array.from(event.dataTransfer?.files ?? []).filter((f) => f.type.startsWith("image/"))
        if (!files.length) return false
        event.preventDefault()
        const coords = view.posAtCoords({ left: event.clientX, top: event.clientY })
        uploadAndInsertRef.current(files, coords?.pos)
        return true
      },
    },
    onUpdate: ({ editor: e }) => onChangeRef.current(e.getHTML()),
  })

  React.useEffect(() => {
    uploadAndInsertRef.current = async (files: File[], pos?: number) => {
      if (!editor) return
      for (const file of files) {
        if (file.size > MAX_UPLOAD_BYTES) {
          toast.error(`${file.name} melebihi batas 10 MB.`)
          continue
        }
        const toastId = toast.loading(`Mengunggah ${file.name}…`)
        try {
          const res = await uploadCmsMedia(file)
          const node = {
            type: "image",
            attrs: { src: resolveMediaUrl(res.data.url), alt: file.name.replace(/\.[^.]+$/, "") },
          }
          if (typeof pos === "number") editor.chain().focus().insertContentAt(pos, node).run()
          else editor.chain().focus().insertContent(node).run()
          toast.success(`${file.name} berhasil diunggah.`, { id: toastId })
        } catch (e) {
          toast.error(e instanceof CmsApiError ? e.message : `Gagal mengunggah ${file.name}`, { id: toastId })
        }
      }
    }
  }, [editor])

  // Esc leaves fullscreen; lock page scroll while fullscreen.
  React.useEffect(() => {
    if (!fullscreen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setFullscreen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener("keydown", onKey)
    }
  }, [fullscreen])

  // While editing raw HTML, push it through the editor (debounced) so the
  // parent form always holds schema-sanitized HTML — saving straight from the
  // HTML tab must not lose edits or persist unsanitized markup.
  React.useEffect(() => {
    if (mode !== "source" || !editor) return
    const timer = setTimeout(() => {
      if (source !== formatHtml(editor.getHTML())) editor.commands.setContent(source, { emitUpdate: true })
    }, 400)
    return () => clearTimeout(timer)
  }, [source, mode, editor])

  const stats = useEditorState({
    editor,
    selector: ({ editor: e }) => (e ? readStats(e) : null),
  }) ?? { words: 0, characters: 0, readingMinutes: 0 }

  function changeMode(next: EditorMode) {
    if (!editor || next === mode) return
    if (mode === "source") {
      // Apply the edited HTML back into the editor; unknown tags/attributes
      // are dropped by the schema, which also strips scripts.
      editor.commands.setContent(source, { emitUpdate: true })
    }
    if (next === "source") setSource(formatHtml(editor.getHTML()))
    setMode(next)
    if (next === "edit") setTimeout(() => editor.commands.focus(), 0)
  }

  if (!editor) {
    return (
      <div
        className={cn("animate-pulse rounded-xl border border-border bg-muted/40", className)}
        style={{ minHeight: minHeight + 48 }}
      />
    )
  }

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border border-border bg-card",
        fullscreen && "fixed inset-0 z-50 rounded-none border-0",
        className
      )}
    >
      <div className={cn("z-10", !fullscreen && "sticky top-0")}>
        <EditorToolbar
          editor={editor}
          mode={mode}
          onModeChange={changeMode}
          fullscreen={fullscreen}
          onToggleFullscreen={() => setFullscreen((v) => !v)}
          onInsertImage={() => setImageDialogOpen(true)}
          onShowShortcuts={() => setShortcutsOpen(true)}
        />
      </div>

      <div
        className={cn("relative flex-1 overflow-y-auto", fullscreen && "bg-background")}
        style={fullscreen ? undefined : { minHeight }}
      >
        <div className={cn(fullscreen && "mx-auto max-w-4xl", mode !== "edit" && "hidden")}>
          <EditorContent editor={editor} />
        </div>

        {mode === "source" && (
          <textarea
            value={source}
            onChange={(e) => setSource(e.target.value)}
            spellCheck={false}
            className="block h-full w-full resize-none bg-slate-950 p-5 font-mono text-[13px] leading-6 text-slate-100 outline-none"
            style={{ minHeight: fullscreen ? "calc(100vh - 110px)" : minHeight }}
            aria-label="Sumber HTML"
          />
        )}

        {mode === "preview" && (
          <div className={cn("px-6 py-5 sm:px-10 sm:py-8", fullscreen && "mx-auto max-w-4xl")}>
            <div
              className="cms-prose"
              // Output of editor.getHTML(): already constrained to the editor
              // schema (no scripts/event handlers; link protocols validated).
              dangerouslySetInnerHTML={{ __html: editor.getHTML() }}
            />
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-muted/40 px-4 py-1.5 text-xs text-muted-foreground">
        <span>
          {stats.words.toLocaleString("id-ID")} kata · {stats.characters.toLocaleString("id-ID")} karakter · ±
          {stats.readingMinutes} menit baca
        </span>
        <span className="hidden sm:inline">
          Tempel / tarik gambar langsung ke editor untuk mengunggah · {formatShortcut("Mod-/")} pintasan
        </span>
      </div>

      {/* Selection bubble: inline formatting, or link actions when the caret sits in a link. */}
      <BubbleMenu
        editor={editor}
        pluginKey="cmsTextBubble"
        shouldShow={({ editor: e, state, from, to }) => {
          if (mode !== "edit" || !e.isEditable) return false
          if (state.selection instanceof NodeSelection) return false
          if (e.isActive("codeBlock")) return false
          return from !== to || e.isActive("link")
        }}
        options={{ placement: "top", offset: 8 }}
      >
        <TooltipProvider delay={300}>
          <TextBubble
            editor={editor}
            linkEditing={bubbleLinkEditing}
            onLinkEditingChange={setBubbleLinkEditing}
          />
        </TooltipProvider>
      </BubbleMenu>

      <BubbleMenu
        editor={editor}
        pluginKey="cmsImageBubble"
        shouldShow={({ editor: e }) => mode === "edit" && e.isActive("image")}
        options={{ placement: "top", offset: 8 }}
      >
        <TooltipProvider delay={300}>
          <ImageBubble editor={editor} onReplace={() => setImageDialogOpen(true)} />
        </TooltipProvider>
      </BubbleMenu>

      <MediaPickerDialog
        open={imageDialogOpen}
        onOpenChange={setImageDialogOpen}
        onSelect={(media) => {
          editor.chain().focus().setImage({ src: media.url, alt: media.alt }).run()
        }}
      />

      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editor.isActive("link") ? "Edit link" : "Sisipkan link"}</DialogTitle>
            <DialogDescription>Link eksternal, email, atau path internal (mis. /kategori/hotel).</DialogDescription>
          </DialogHeader>
          {linkDialogOpen && <LinkEditorFields editor={editor} onDone={() => setLinkDialogOpen(false)} />}
        </DialogContent>
      </Dialog>

      <Dialog open={shortcutsOpen} onOpenChange={setShortcutsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Pintasan Keyboard</DialogTitle>
            <DialogDescription>Percepat penulisan dengan shortcut dan format Markdown otomatis.</DialogDescription>
          </DialogHeader>
          <div className="grid max-h-[60vh] gap-5 overflow-y-auto sm:grid-cols-2">
            {SHORTCUTS.map((group) => (
              <div key={group.group}>
                <p className="mb-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  {group.group}
                </p>
                <ul className="flex flex-col gap-1 text-sm">
                  {group.items.map(([label, keys]) => (
                    <li key={label} className="flex items-center justify-between gap-3">
                      <span>{label}</span>
                      <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[11px] whitespace-nowrap">
                        {keys.includes("Mod") ? keys.split(" / ").map(formatShortcut).join(" / ") : keys}
                      </kbd>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function TextBubble({
  editor,
  linkEditing,
  onLinkEditingChange,
}: {
  editor: Editor
  linkEditing: boolean
  onLinkEditingChange: (v: boolean) => void
}) {
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      empty: e.state.selection.empty,
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      strike: e.isActive("strike"),
      code: e.isActive("code"),
      highlight: e.isActive("highlight"),
      link: e.isActive("link"),
    }),
  })
  const chain = () => editor.chain().focus()

  if (linkEditing) {
    return (
      <div className="w-80 rounded-xl border border-border bg-popover p-3 shadow-lg">
        <LinkEditorFields editor={editor} onDone={() => onLinkEditingChange(false)} />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-border bg-popover p-1 shadow-lg">
      {s.empty && s.link ? (
        <LinkPreviewRow editor={editor} onEdit={() => onLinkEditingChange(true)} />
      ) : (
        <>
          <ToolbarButton label="Tebal" shortcut="Mod-B" active={s.bold} onClick={() => chain().toggleBold().run()}>
            <BoldIcon />
          </ToolbarButton>
          <ToolbarButton label="Miring" shortcut="Mod-I" active={s.italic} onClick={() => chain().toggleItalic().run()}>
            <ItalicIcon />
          </ToolbarButton>
          <ToolbarButton
            label="Garis bawah"
            shortcut="Mod-U"
            active={s.underline}
            onClick={() => chain().toggleUnderline().run()}
          >
            <UnderlineIcon />
          </ToolbarButton>
          <ToolbarButton label="Coret" active={s.strike} onClick={() => chain().toggleStrike().run()}>
            <StrikethroughIcon />
          </ToolbarButton>
          <ToolbarButton label="Kode inline" active={s.code} onClick={() => chain().toggleCode().run()}>
            <CodeIcon />
          </ToolbarButton>
          <ToolbarButton label="Highlight" active={s.highlight} onClick={() => chain().toggleHighlight().run()}>
            <HighlighterIcon />
          </ToolbarButton>
          <ToolbarSeparator />
          <ToolbarButton label="Link" shortcut="Mod-K" active={s.link} onClick={() => onLinkEditingChange(true)}>
            <Link2Icon />
          </ToolbarButton>
        </>
      )}
    </div>
  )
}

function ImageBubble({ editor, onReplace }: { editor: Editor; onReplace: () => void }) {
  const attrs = useEditorState({
    editor,
    selector: ({ editor: e }) => e.getAttributes("image") as { alt?: string; width?: number | string | null },
  })
  const [alt, setAlt] = React.useState(attrs.alt ?? "")
  const [lastAlt, setLastAlt] = React.useState(attrs.alt)
  // Re-seed the input when a different image gets selected.
  if (attrs.alt !== lastAlt) {
    setLastAlt(attrs.alt)
    setAlt(attrs.alt ?? "")
  }

  function setWidth(pct: number | null) {
    const full = editor.view.dom.clientWidth - 80
    editor
      .chain()
      .focus()
      .updateAttributes("image", { width: pct ? Math.round((full * pct) / 100) : null, height: null })
      .run()
  }

  return (
    <div className="flex items-center gap-1 rounded-lg border border-border bg-popover p-1 shadow-lg">
      <Input
        value={alt}
        onChange={(e) => setAlt(e.target.value)}
        onBlur={() => editor.chain().updateAttributes("image", { alt }).run()}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            editor.chain().focus().updateAttributes("image", { alt }).run()
          }
        }}
        placeholder="Alt text gambar"
        className="h-8 w-44 text-xs"
      />
      <ToolbarSeparator />
      {[25, 50, 75, 100].map((pct) => (
        <ToolbarButton key={pct} label={`Lebar ${pct}%`} onClick={() => setWidth(pct)} className="px-1.5 text-xs">
          {pct}%
        </ToolbarButton>
      ))}
      <ToolbarButton label="Ukuran asli" onClick={() => setWidth(null)} className="px-1.5 text-xs">
        Auto
      </ToolbarButton>
      <ToolbarSeparator />
      <Button variant="ghost" size="sm" onMouseDown={(e) => e.preventDefault()} onClick={onReplace}>
        Ganti
      </Button>
      <ToolbarButton label="Hapus gambar" onClick={() => editor.chain().focus().deleteSelection().run()}>
        <Trash2Icon className="text-destructive" />
      </ToolbarButton>
    </div>
  )
}
