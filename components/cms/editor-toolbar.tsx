"use client"

import * as React from "react"
import type { Editor } from "@tiptap/react"
import { useEditorState } from "@tiptap/react"
import {
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronsDownUpIcon,
  CodeIcon,
  CodeXmlIcon,
  CornerDownLeftIcon,
  EyeIcon,
  FileCode2Icon,
  ImageIcon,
  IndentDecreaseIcon,
  IndentIncreaseIcon,
  ItalicIcon,
  KeyboardIcon,
  ListChecksIcon,
  ListIcon,
  ListOrderedIcon,
  Maximize2Icon,
  Minimize2Icon,
  MinusIcon,
  PenLineIcon,
  QuoteIcon,
  Redo2Icon,
  RemoveFormattingIcon,
  StrikethroughIcon,
  SubscriptIcon,
  SuperscriptIcon,
  UnderlineIcon,
  Undo2Icon,
} from "lucide-react"
import { cn } from "cn"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TooltipProvider } from "@/components/ui/tooltip"
import { CODE_LANGUAGES } from "./editor-extensions"
import { ToolbarButton, ToolbarGroup, ToolbarSeparator } from "./toolbar-primitives"
import {
  ColorPopover,
  FindReplacePopover,
  LinkPopover,
  SpecialCharsPopover,
  TablePopover,
  YoutubePopover,
} from "./toolbar-popovers"

export type EditorMode = "edit" | "source" | "preview"

const BLOCK_TYPES = [
  { value: "paragraph", label: "Paragraf", className: "text-sm" },
  { value: "h1", label: "Heading 1", className: "text-xl font-bold" },
  { value: "h2", label: "Heading 2", className: "text-lg font-bold" },
  { value: "h3", label: "Heading 3", className: "text-base font-bold" },
  { value: "h4", label: "Heading 4", className: "text-sm font-bold" },
  { value: "h5", label: "Heading 5", className: "text-xs font-bold" },
  { value: "h6", label: "Heading 6", className: "text-xs font-semibold uppercase" },
] as const

const FONT_FAMILIES = [
  { value: "", label: "Default" },
  { value: "var(--font-poppins), sans-serif", label: "Poppins" },
  { value: "var(--font-gabarito), sans-serif", label: "Gabarito" },
  { value: "Arial, Helvetica, sans-serif", label: "Arial" },
  { value: "Verdana, Geneva, sans-serif", label: "Verdana" },
  { value: "'Trebuchet MS', sans-serif", label: "Trebuchet MS" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: "'Times New Roman', Times, serif", label: "Times New Roman" },
  { value: "'Courier New', Courier, monospace", label: "Courier New" },
  { value: "ui-monospace, SFMono-Regular, Menlo, monospace", label: "Monospace" },
]

const FONT_SIZES = ["", "12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px", "36px", "48px", "64px"]
const LINE_HEIGHTS = ["", "1", "1.15", "1.5", "1.75", "2", "2.5", "3"]

function ToolbarDropdown({
  label,
  tooltip,
  width = "w-28",
  children,
  contentClassName,
}: {
  label: React.ReactNode
  tooltip: string
  width?: string
  children: React.ReactNode
  contentClassName?: string
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            title={tooltip}
            aria-label={tooltip}
            onMouseDown={(e) => e.preventDefault()}
            className={cn(
              "inline-flex h-8 shrink-0 items-center justify-between gap-1 rounded-md px-2 text-sm text-foreground/80 outline-none hover:bg-muted hover:text-foreground aria-expanded:bg-muted",
              width
            )}
          />
        }
      >
        <span className="truncate">{label}</span>
        <ChevronDownIcon className="size-3.5 shrink-0 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className={cn("max-h-80 min-w-44 overflow-y-auto", contentClassName)}>
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function CheckItem({
  checked,
  onClick,
  children,
  className,
  style,
}: {
  checked: boolean
  onClick: () => void
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <DropdownMenuItem onClick={onClick} className={className} style={style}>
      <span className="flex-1">{children}</span>
      {checked && <CheckIcon className="size-4 text-primary" />}
    </DropdownMenuItem>
  )
}

export function EditorToolbar({
  editor,
  mode,
  onModeChange,
  fullscreen,
  onToggleFullscreen,
  onInsertImage,
  onShowShortcuts,
}: {
  editor: Editor
  mode: EditorMode
  onModeChange: (mode: EditorMode) => void
  fullscreen: boolean
  onToggleFullscreen: () => void
  onInsertImage: () => void
  onShowShortcuts: () => void
}) {
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => {
      const headingLevel = ([1, 2, 3, 4, 5, 6] as const).find((level) => e.isActive("heading", { level }))
      const textStyle = e.getAttributes("textStyle") as {
        fontFamily?: string
        fontSize?: string
        lineHeight?: string
      }
      return {
        canUndo: e.can().undo(),
        canRedo: e.can().redo(),
        blockType: headingLevel ? `h${headingLevel}` : "paragraph",
        fontFamily: textStyle.fontFamily ?? "",
        fontSize: textStyle.fontSize ?? "",
        lineHeight: textStyle.lineHeight ?? "",
        bold: e.isActive("bold"),
        italic: e.isActive("italic"),
        underline: e.isActive("underline"),
        strike: e.isActive("strike"),
        code: e.isActive("code"),
        subscript: e.isActive("subscript"),
        superscript: e.isActive("superscript"),
        alignLeft: e.isActive({ textAlign: "left" }),
        alignCenter: e.isActive({ textAlign: "center" }),
        alignRight: e.isActive({ textAlign: "right" }),
        alignJustify: e.isActive({ textAlign: "justify" }),
        bulletList: e.isActive("bulletList"),
        orderedList: e.isActive("orderedList"),
        taskList: e.isActive("taskList"),
        canSink: e.can().sinkListItem("listItem") || e.can().sinkListItem("taskItem"),
        canLift: e.can().liftListItem("listItem") || e.can().liftListItem("taskItem"),
        blockquote: e.isActive("blockquote"),
        codeBlock: e.isActive("codeBlock"),
        codeLanguage: (e.getAttributes("codeBlock").language as string | undefined) ?? "plaintext",
        details: e.isActive("details"),
      }
    },
  })

  const disabled = mode !== "edit"
  const blockLabel = BLOCK_TYPES.find((b) => b.value === s.blockType)?.label ?? "Paragraf"
  const fontLabel = FONT_FAMILIES.find((f) => f.value === s.fontFamily)?.label ?? "Font kustom"
  const chain = () => editor.chain().focus()

  function setBlockType(value: string) {
    if (value === "paragraph") chain().setParagraph().run()
    else chain().toggleHeading({ level: Number(value.slice(1)) as 1 | 2 | 3 | 4 | 5 | 6 }).run()
  }

  function indent() {
    if (editor.can().sinkListItem("taskItem")) chain().sinkListItem("taskItem").run()
    else chain().sinkListItem("listItem").run()
  }

  function outdent() {
    if (editor.can().liftListItem("taskItem")) chain().liftListItem("taskItem").run()
    else chain().liftListItem("listItem").run()
  }

  return (
    <TooltipProvider delay={400}>
      <div
        role="toolbar"
        aria-label="Toolbar editor"
        className="flex flex-wrap items-center gap-x-0.5 gap-y-1 border-b border-border bg-background/95 px-2 py-1.5 backdrop-blur"
      >
        <fieldset disabled={disabled} className={cn("contents", disabled && "[&_button]:opacity-40")}>
          <ToolbarGroup>
            <ToolbarButton label="Undo" shortcut="Mod-Z" disabled={disabled || !s.canUndo} onClick={() => chain().undo().run()}>
              <Undo2Icon />
            </ToolbarButton>
            <ToolbarButton
              label="Redo"
              shortcut="Mod-Shift-Z"
              disabled={disabled || !s.canRedo}
              onClick={() => chain().redo().run()}
            >
              <Redo2Icon />
            </ToolbarButton>
          </ToolbarGroup>

          <ToolbarSeparator />

          <ToolbarDropdown label={blockLabel} tooltip="Jenis blok teks" width="w-32">
            {BLOCK_TYPES.map((b) => (
              <CheckItem
                key={b.value}
                checked={s.blockType === b.value}
                onClick={() => setBlockType(b.value)}
                className={b.className}
              >
                {b.label}
              </CheckItem>
            ))}
          </ToolbarDropdown>

          <ToolbarDropdown label={fontLabel} tooltip="Jenis font" width="w-32">
            {FONT_FAMILIES.map((f) => (
              <CheckItem
                key={f.label}
                checked={s.fontFamily === f.value}
                style={f.value ? { fontFamily: f.value } : undefined}
                onClick={() =>
                  f.value ? chain().setFontFamily(f.value).run() : chain().unsetFontFamily().run()
                }
              >
                {f.label}
              </CheckItem>
            ))}
          </ToolbarDropdown>

          <ToolbarDropdown label={s.fontSize || "Ukuran"} tooltip="Ukuran font" width="w-20">
            {FONT_SIZES.map((size) => (
              <CheckItem
                key={size || "default"}
                checked={s.fontSize === size}
                onClick={() => (size ? chain().setFontSize(size).run() : chain().unsetFontSize().run())}
              >
                {size || "Default"}
              </CheckItem>
            ))}
          </ToolbarDropdown>

          <ToolbarDropdown
            label={
              <span className="flex items-center gap-1">
                <ChevronsDownUpIcon className="size-4" />
                {s.lineHeight || ""}
              </span>
            }
            tooltip="Jarak antar baris"
            width="w-auto"
          >
            <DropdownMenuLabel>Jarak baris</DropdownMenuLabel>
            {LINE_HEIGHTS.map((lh) => (
              <CheckItem
                key={lh || "default"}
                checked={s.lineHeight === lh}
                onClick={() => (lh ? chain().setLineHeight(lh).run() : chain().unsetLineHeight().run())}
              >
                {lh || "Default"}
              </CheckItem>
            ))}
          </ToolbarDropdown>

          <ToolbarSeparator />

          <ToolbarGroup>
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
            <ToolbarButton
              label="Coret"
              shortcut="Mod-Shift-S"
              active={s.strike}
              onClick={() => chain().toggleStrike().run()}
            >
              <StrikethroughIcon />
            </ToolbarButton>
            <ToolbarButton label="Kode inline" shortcut="Mod-E" active={s.code} onClick={() => chain().toggleCode().run()}>
              <CodeIcon />
            </ToolbarButton>
            <ToolbarButton
              label="Subscript"
              shortcut="Mod-,"
              active={s.subscript}
              onClick={() => chain().toggleSubscript().run()}
            >
              <SubscriptIcon />
            </ToolbarButton>
            <ToolbarButton
              label="Superscript"
              shortcut="Mod-."
              active={s.superscript}
              onClick={() => chain().toggleSuperscript().run()}
            >
              <SuperscriptIcon />
            </ToolbarButton>
            <ColorPopover editor={editor} mode="text" />
            <ColorPopover editor={editor} mode="highlight" />
            <ToolbarButton
              label="Hapus format"
              onClick={() => chain().unsetAllMarks().clearNodes().run()}
            >
              <RemoveFormattingIcon />
            </ToolbarButton>
          </ToolbarGroup>

          <ToolbarSeparator />

          <ToolbarGroup>
            <ToolbarButton
              label="Rata kiri"
              shortcut="Mod-Shift-L"
              active={s.alignLeft}
              onClick={() => chain().setTextAlign("left").run()}
            >
              <AlignLeftIcon />
            </ToolbarButton>
            <ToolbarButton
              label="Rata tengah"
              shortcut="Mod-Shift-E"
              active={s.alignCenter}
              onClick={() => chain().setTextAlign("center").run()}
            >
              <AlignCenterIcon />
            </ToolbarButton>
            <ToolbarButton
              label="Rata kanan"
              shortcut="Mod-Shift-R"
              active={s.alignRight}
              onClick={() => chain().setTextAlign("right").run()}
            >
              <AlignRightIcon />
            </ToolbarButton>
            <ToolbarButton
              label="Rata kiri-kanan"
              shortcut="Mod-Shift-J"
              active={s.alignJustify}
              onClick={() => chain().setTextAlign("justify").run()}
            >
              <AlignJustifyIcon />
            </ToolbarButton>
          </ToolbarGroup>

          <ToolbarSeparator />

          <ToolbarGroup>
            <ToolbarButton
              label="Bullet list"
              shortcut="Mod-Shift-8"
              active={s.bulletList}
              onClick={() => chain().toggleBulletList().run()}
            >
              <ListIcon />
            </ToolbarButton>
            <ToolbarButton
              label="Numbered list"
              shortcut="Mod-Shift-7"
              active={s.orderedList}
              onClick={() => chain().toggleOrderedList().run()}
            >
              <ListOrderedIcon />
            </ToolbarButton>
            <ToolbarButton
              label="Checklist / task list"
              shortcut="Mod-Shift-9"
              active={s.taskList}
              onClick={() => chain().toggleTaskList().run()}
            >
              <ListChecksIcon />
            </ToolbarButton>
            <ToolbarButton label="Kurangi indentasi" shortcut="Shift-Tab" disabled={disabled || !s.canLift} onClick={outdent}>
              <IndentDecreaseIcon />
            </ToolbarButton>
            <ToolbarButton label="Tambah indentasi" shortcut="Tab" disabled={disabled || !s.canSink} onClick={indent}>
              <IndentIncreaseIcon />
            </ToolbarButton>
          </ToolbarGroup>

          <ToolbarSeparator />

          <ToolbarGroup>
            <ToolbarButton
              label="Kutipan"
              shortcut="Mod-Shift-B"
              active={s.blockquote}
              onClick={() => chain().toggleBlockquote().run()}
            >
              <QuoteIcon />
            </ToolbarButton>
            <ToolbarButton
              label="Blok kode"
              shortcut="Mod-Alt-C"
              active={s.codeBlock}
              onClick={() => chain().toggleCodeBlock().run()}
            >
              <CodeXmlIcon />
            </ToolbarButton>
            {s.codeBlock && (
              <ToolbarDropdown
                label={CODE_LANGUAGES.find((l) => l.value === s.codeLanguage)?.label ?? s.codeLanguage}
                tooltip="Bahasa blok kode"
                width="w-28"
              >
                {CODE_LANGUAGES.map((lang) => (
                  <CheckItem
                    key={lang.value}
                    checked={s.codeLanguage === lang.value}
                    onClick={() => chain().updateAttributes("codeBlock", { language: lang.value }).run()}
                  >
                    {lang.label}
                  </CheckItem>
                ))}
              </ToolbarDropdown>
            )}
            <ToolbarButton
              label="Bagian yang bisa dilipat (accordion)"
              active={s.details}
              onClick={() => (s.details ? chain().unsetDetails().run() : chain().setDetails().run())}
            >
              <ChevronsDownUpIcon />
            </ToolbarButton>
            <ToolbarButton label="Garis pemisah" onClick={() => chain().setHorizontalRule().run()}>
              <MinusIcon />
            </ToolbarButton>
            <ToolbarButton label="Baris baru (soft break)" shortcut="Shift-Enter" onClick={() => chain().setHardBreak().run()}>
              <CornerDownLeftIcon />
            </ToolbarButton>
          </ToolbarGroup>

          <ToolbarSeparator />

          <ToolbarGroup>
            <LinkPopover editor={editor} />
            <ToolbarButton label="Sisipkan gambar" onClick={onInsertImage}>
              <ImageIcon />
            </ToolbarButton>
            <YoutubePopover editor={editor} />
            <TablePopover editor={editor} />
            <SpecialCharsPopover editor={editor} />
          </ToolbarGroup>

          <ToolbarSeparator />

          <ToolbarGroup>
            <FindReplacePopover editor={editor} />
          </ToolbarGroup>
        </fieldset>

        <div className="ml-auto flex items-center gap-0.5">
          <div className="flex items-center rounded-md bg-muted p-0.5">
            {(
              [
                { value: "edit", label: "Tulis", icon: PenLineIcon },
                { value: "source", label: "HTML", icon: FileCode2Icon },
                { value: "preview", label: "Preview", icon: EyeIcon },
              ] as const
            ).map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => onModeChange(m.value)}
                className={cn(
                  "inline-flex h-7 items-center gap-1 rounded px-2 text-xs font-medium transition-colors [&_svg]:size-3.5",
                  mode === m.value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <m.icon />
                <span className="hidden sm:inline">{m.label}</span>
              </button>
            ))}
          </div>
          <ToolbarButton label="Pintasan keyboard" shortcut="Mod-/" onClick={onShowShortcuts}>
            <KeyboardIcon />
          </ToolbarButton>
          <ToolbarButton
            label={fullscreen ? "Keluar layar penuh" : "Layar penuh"}
            shortcut="Mod-Shift-F"
            active={fullscreen}
            onClick={onToggleFullscreen}
          >
            {fullscreen ? <Minimize2Icon /> : <Maximize2Icon />}
          </ToolbarButton>
        </div>
      </div>
    </TooltipProvider>
  )
}

