"use client"

import { useParams } from "next/navigation"

import { ContentEditorForm } from "@/components/cms/content-editor-form"

export default function EditCmsContentPage() {
  const params = useParams<{ id: string }>()
  // Keyed by id so navigating between articles starts from a fresh form.
  return <ContentEditorForm key={params.id} contentId={params.id} />
}
