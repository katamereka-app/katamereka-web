"use client"

import * as React from "react"
import { toast } from "sonner"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { RatingStars } from "@/components/rating-stars"
import { Textarea } from "@/components/ui/textarea"
import type { Review } from "@/lib/types"
import type { VariantProps } from "class-variance-authority"

export function ReplyDialog({
  review,
  triggerLabel = "Balas",
  triggerVariant = "default",
  triggerSize = "sm",
  onReplied,
  onSubmit,
}: {
  review: Review
  triggerLabel?: string
  triggerVariant?: VariantProps<typeof buttonVariants>["variant"]
  triggerSize?: VariantProps<typeof buttonVariants>["size"]
  onReplied?: () => void
  /** When provided, replaces the default mock toast with a real API call. Return false to keep the dialog open (e.g. on error). */
  onSubmit?: (content: string) => Promise<boolean>
}) {
  const [open, setOpen] = React.useState(false)
  const [reply, setReply] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant={triggerVariant} size={triggerSize} />}>
        {triggerLabel}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Balas review {review.reviewerName}</DialogTitle>
        </DialogHeader>
        <RatingStars rating={review.rating} size="sm" />
        <p className="rounded-lg bg-secondary p-3 text-sm text-foreground/90">
          {review.content}
        </p>
        <Textarea
          value={reply}
          onChange={(event) => setReply(event.target.value)}
          placeholder="Tulis balasan untuk customer..."
          rows={4}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Batal
          </Button>
          <Button
            disabled={reply.trim().length === 0 || submitting}
            onClick={async () => {
              if (!onSubmit) {
                toast.success("Balasan berhasil dikirim.")
                setReply("")
                setOpen(false)
                onReplied?.()
                return
              }

              setSubmitting(true)
              const ok = await onSubmit(reply.trim())
              setSubmitting(false)
              if (ok) {
                setReply("")
                setOpen(false)
                onReplied?.()
              }
            }}
          >
            {submitting ? "Mengirim..." : "Kirim Balasan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
