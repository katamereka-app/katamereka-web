"use client"

import * as React from "react"
import { CheckIcon, LinkIcon } from "lucide-react"

// lucide-react dropped brand/social glyphs — inline the few this page needs.
function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M13.5 21v-7.5h2.5l.5-3h-3V8.25c0-.87.24-1.46 1.49-1.46H16.5V4.1A20 20 0 0 0 14.33 4c-2.2 0-3.7 1.34-3.7 3.8V10.5H8v3h2.63V21z" />
    </svg>
  )
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M6.94 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM3.2 8.75h3.5V21H3.2zm6.2 0h3.35v1.68h.05c.47-.88 1.6-1.8 3.3-1.8 3.53 0 4.18 2.32 4.18 5.34V21h-3.5v-5.4c0-1.3-.02-2.96-1.8-2.96-1.82 0-2.1 1.42-2.1 2.87V21H9.4z" />
    </svg>
  )
}

function WhatsappIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12.04 2c-5.5 0-9.96 4.46-9.96 9.96 0 1.76.46 3.45 1.33 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.5 0 9.96-4.46 9.96-9.96S17.54 2 12.04 2zm0 18.2a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.23 8.23 0 1 1 6.98 3.86zm4.52-6.16c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.13-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.04-.38-1.98-1.21-.73-.65-1.23-1.46-1.37-1.7-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.42-.14 0-.31-.01-.47-.01-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08s.9 2.41 1.02 2.58c.12.17 1.76 2.69 4.27 3.77.6.26 1.06.41 1.43.53.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.08.14-1.18-.06-.11-.23-.17-.48-.29z" />
    </svg>
  )
}

export function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = React.useState(false)
  const [url, setUrl] = React.useState("")

  React.useEffect(() => {
    setUrl(window.location.href)
  }, [])

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard unavailable — ignore
    }
  }

  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  const links = [
    {
      label: "WhatsApp",
      href: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
      icon: WhatsappIcon,
      className: "bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white",
    },
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: FacebookIcon,
      className: "bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2] hover:text-white",
    },
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      icon: XIcon,
      className: "bg-slate-900/10 text-slate-900 hover:bg-slate-900 hover:text-white",
    },
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: LinkedinIcon,
      className: "bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2] hover:text-white",
    },
  ]

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={copyLink}
        aria-label="Salin link"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200"
      >
        {copied ? <CheckIcon className="h-4 w-4 text-[#008767]" /> : <LinkIcon className="h-4 w-4" />}
      </button>
      {links.map((l) => (
        <a
          key={l.label}
          href={url ? l.href : undefined}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Bagikan ke ${l.label}`}
          className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${l.className}`}
        >
          <l.icon className="h-4 w-4" />
        </a>
      ))}
    </div>
  )
}
