import type { Extensions } from "@tiptap/core"
import StarterKit from "@tiptap/starter-kit"
import { TextStyleKit } from "@tiptap/extension-text-style"
import Highlight from "@tiptap/extension-highlight"
import TextAlign from "@tiptap/extension-text-align"
import Subscript from "@tiptap/extension-subscript"
import Superscript from "@tiptap/extension-superscript"
import { TableKit } from "@tiptap/extension-table"
import Image from "@tiptap/extension-image"
import Youtube from "@tiptap/extension-youtube"
import { TaskItem, TaskList } from "@tiptap/extension-list"
import { CharacterCount, Placeholder } from "@tiptap/extensions"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import Typography from "@tiptap/extension-typography"
import { Details, DetailsContent, DetailsSummary } from "@tiptap/extension-details"
import { common, createLowlight } from "lowlight"

export const lowlight = createLowlight(common)

export const CODE_LANGUAGES: { value: string; label: string }[] = [
  { value: "plaintext", label: "Plain Text" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "xml", label: "HTML / XML" },
  { value: "css", label: "CSS" },
  { value: "scss", label: "SCSS" },
  { value: "json", label: "JSON" },
  { value: "bash", label: "Bash / Shell" },
  { value: "python", label: "Python" },
  { value: "php", label: "PHP" },
  { value: "java", label: "Java" },
  { value: "kotlin", label: "Kotlin" },
  { value: "swift", label: "Swift" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "c", label: "C" },
  { value: "cpp", label: "C++" },
  { value: "csharp", label: "C#" },
  { value: "ruby", label: "Ruby" },
  { value: "sql", label: "SQL" },
  { value: "yaml", label: "YAML" },
  { value: "markdown", label: "Markdown" },
  { value: "diff", label: "Diff" },
]

export function createEditorExtensions({ placeholder }: { placeholder?: string } = {}): Extensions {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3, 4, 5, 6] },
      // Replaced by CodeBlockLowlight for syntax highlighting.
      codeBlock: false,
      link: {
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        defaultProtocol: "https",
        HTMLAttributes: { rel: "noopener noreferrer" },
      },
    }),
    TextStyleKit,
    Highlight.configure({ multicolor: true }),
    TextAlign.configure({
      types: ["heading", "paragraph"],
      alignments: ["left", "center", "right", "justify"],
    }),
    Subscript,
    Superscript,
    TableKit.configure({
      table: { resizable: true, HTMLAttributes: { class: "cms-table" } },
    }),
    Image.configure({
      allowBase64: false,
      HTMLAttributes: { loading: "lazy" },
      resize: {
        enabled: true,
        directions: ["top-left", "top-right", "bottom-left", "bottom-right"],
        minWidth: 80,
        minHeight: 40,
        alwaysPreserveAspectRatio: true,
      },
    }),
    Youtube.configure({
      nocookie: true,
      controls: true,
      modestBranding: true,
      width: 640,
      height: 360,
    }),
    TaskList,
    TaskItem.configure({ nested: true }),
    CodeBlockLowlight.configure({
      lowlight,
      defaultLanguage: "plaintext",
      HTMLAttributes: { spellcheck: "false" },
    }),
    Typography,
    Details.configure({ persist: true, HTMLAttributes: { class: "cms-details" } }),
    DetailsSummary,
    DetailsContent,
    CharacterCount,
    Placeholder.configure({
      includeChildren: false,
      placeholder: ({ node }) => {
        if (node.type.name === "heading") return `Heading ${node.attrs.level}`
        if (node.type.name === "detailsSummary") return "Judul bagian yang bisa dilipat"
        return placeholder ?? "Tulis konten di sini… Ketik “#” + spasi untuk heading, “-” untuk list, “>” untuk kutipan."
      },
    }),
  ]
}
