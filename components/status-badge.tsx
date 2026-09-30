import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

// Single source of truth for status color mapping (spec AU) — every status
// badge in either dashboard should render through this component so colors
// stay consistent across pages instead of being picked ad hoc.
const statusBadgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap",
  {
    variants: {
      tone: {
        green: "bg-success/10 text-success",
        amber: "bg-warning/10 text-warning",
        red: "bg-destructive/10 text-destructive",
        gray: "bg-muted text-muted-foreground",
        blue: "bg-info/10 text-info",
      },
    },
    defaultVariants: {
      tone: "gray",
    },
  }
)

const STATUS_TONE: Record<string, VariantProps<typeof statusBadgeVariants>["tone"]> = {
  // green
  ACTIVE: "green",
  VERIFIED: "green",
  PUBLISHED: "green",
  APPROVED: "green",
  KEPT: "green",
  COMPLETED: "green",
  RESOLVED: "green",
  // amber
  PENDING: "amber",
  PENDING_REVIEW: "amber",
  UNDER_INVESTIGATION: "amber",
  OPEN: "amber",
  // red
  BANNED: "red",
  SUSPENDED: "red",
  REJECTED: "red",
  REMOVED: "red",
  HIGH: "red",
  EXPIRED: "red",
  // gray
  INACTIVE: "gray",
  UNVERIFIED: "gray",
  HIDDEN: "gray",
  MEMBER: "gray",
  SENT: "gray",
  // blue
  IN_PROGRESS: "blue",
  INFORMATIONAL: "blue",
  MEDIUM: "blue",
  ADMIN: "blue",
  OWNER: "blue",
  OPENED: "blue",
  // Indonesian labels used by the Business Admin "needs attention" list —
  // reuses the same tone system instead of ad hoc colors.
  Dibalas: "green",
  "Belum Dibalas": "amber",
  Dilaporkan: "red",
  "Rating Rendah": "red",
  "Komplain Layanan": "amber",
  Pertanyaan: "blue",
  // Trust & Safety report queue statuses (/admin/trust-safety).
  MENUNGGU: "red",
  DALAM_PROSES: "amber",
  SELESAI: "green",
  DITOLAK: "red",
  // CMS content statuses (/admin/cms). PUBLISHED is already green above.
  DRAFT: "gray",
  IN_REVIEW: "amber",
  SCHEDULED: "blue",
  ARCHIVED: "gray",
}

const STATUS_LABEL: Record<string, string> = {
  PENDING_REVIEW: "Pending Review",
  UNDER_INVESTIGATION: "Under Investigation",
  IN_PROGRESS: "In Progress",
  Dibalas: "Dibalas",
  "Belum Dibalas": "Belum Dibalas",
  Dilaporkan: "Dilaporkan",
  "Rating Rendah": "Rating Rendah",
  "Komplain Layanan": "Komplain Layanan",
  Pertanyaan: "Pertanyaan",
  MENUNGGU: "Menunggu",
  DALAM_PROSES: "Dalam Proses",
  SELESAI: "Selesai",
  DITOLAK: "Ditolak",
}

export function StatusBadge({
  status,
  label,
  className,
}: {
  status: string
  label?: string
  className?: string
}) {
  const tone = STATUS_TONE[status] ?? "gray"
  const text = label ?? STATUS_LABEL[status] ?? toTitleCase(status)

  return (
    <span className={cn(statusBadgeVariants({ tone }), className)}>{text}</span>
  )
}

function toTitleCase(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}
