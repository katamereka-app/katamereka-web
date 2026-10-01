"use client"

import { BadgeCheckIcon, FlagIcon, ImageIcon, Share2Icon, XIcon } from "lucide-react"
import { toast } from "sonner"

import { RatingStars } from "@/components/rating-stars"
import { ReplyDialog } from "@/components/reply-dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDateTime } from "@/lib/format"
import type { Review } from "@/lib/types"

export function ReviewDetailPanel({
  review,
  onClose,
  onReply,
}: {
  review: Review
  onClose: () => void
  onReply?: (content: string) => Promise<boolean>
}) {
  const initials = review.reviewerName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <Card className="sticky top-4 w-full lg:w-96 lg:shrink-0">
      <CardContent className="flex flex-col gap-4 pt-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <Avatar>
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold text-foreground">{review.reviewerName}</p>
              {review.source && (
                <p className="text-xs text-muted-foreground">melalui {review.source}</p>
              )}
            </div>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <XIcon />
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">{formatDateTime(review.createdAt)}</p>

        <RatingStars rating={review.rating} />

        <p className="text-sm text-foreground/90">{review.content}</p>

        {review.photos && review.photos.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {review.photos.slice(0, 3).map((photo, index) => {
              const remaining = review.photos!.length - 3
              const showOverlay = index === 2 && remaining > 0
              return (
                <div
                  key={photo}
                  className="relative flex aspect-square items-center justify-center rounded-lg bg-muted text-muted-foreground"
                >
                  <ImageIcon className="size-5" />
                  {showOverlay && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-foreground/60 text-sm font-semibold text-background">
                      +{remaining}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-1.5">
          {review.isVerified && (
            <Badge className="bg-success/10 text-success">
              <BadgeCheckIcon className="size-3" />
              Verified Customer
            </Badge>
          )}
          <Badge variant="outline">Review Publik</Badge>
        </div>

        {review.reply && (
          <div className="flex flex-col gap-1 rounded-lg bg-secondary p-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-foreground">Balasan Anda</p>
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="ghost" size="icon-xs" />}>
                  ⋮
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => toast.info("Fitur edit balasan segera hadir.")}>
                    Edit Balasan
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <p className="text-sm text-foreground/90">{review.reply.content}</p>
            <p className="text-[11px] text-muted-foreground">
              {formatDateTime(review.reply.repliedAt)}
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 pt-1">
          {!review.reply && <ReplyDialog review={review} triggerVariant="outline" onSubmit={onReply} />}
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info("Review dilaporkan untuk ditinjau tim KataMereka.")}
          >
            <FlagIcon />
            Laporkan
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(window.location.href)
                toast.success("Link review disalin ke clipboard.")
              } catch {
                toast.error("Gagal menyalin link. Coba lagi.")
              }
            }}
          >
            <Share2Icon />
            Bagikan
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
