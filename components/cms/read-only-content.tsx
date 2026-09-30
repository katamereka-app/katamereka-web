"use client"

import * as React from "react"
import { EditorContent, useEditor } from "@tiptap/react"

import "./editor.css"

import { createEditorExtensions } from "./editor-extensions"

/**
 * Renders stored article HTML through the editor schema (read-only) instead of
 * dangerouslySetInnerHTML, so anything outside the schema — scripts, event
 * handlers, unknown tags — is dropped before it reaches the DOM.
 */
export function ReadOnlyContent({ html, className }: { html: string; className?: string }) {
  const extensions = React.useMemo(() => createEditorExtensions({ placeholder: "" }), [])
  const editor = useEditor(
    {
      extensions,
      content: html,
      editable: false,
      immediatelyRender: false,
      editorProps: { attributes: { class: "cms-prose" } },
    },
    [html]
  )
  return (
    <div className={className}>
      <EditorContent editor={editor} />
    </div>
  )
}
