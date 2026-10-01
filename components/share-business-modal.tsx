"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, Copy, Link2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ShareBusinessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessName: string;
  shareUrl: string;
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.74.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0012.04 2zm0 1.67c2.2 0 4.26.86 5.82 2.42a8.22 8.22 0 012.41 5.83c0 4.54-3.7 8.23-8.24 8.23-1.48 0-2.93-.4-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 01-1.26-4.38c.01-4.54 3.7-8.24 8.25-8.24zm-4.52 4.9c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.67 2.59 4.14 3.59.58.24 1.03.38 1.38.49.58.18 1.11.16 1.52.1.47-.07 1.44-.59 1.64-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.46-.28-.24-.12-1.44-.71-1.66-.79-.22-.08-.38-.12-.54.12-.16.24-.62.79-.76.95-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.92-1.18-.71-.63-1.19-1.41-1.33-1.65-.14-.24-.01-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.19-.46-.39-.4-.54-.41-.14-.01-.3-.01-.46-.01z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4.3" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 110-4.14 2.07 2.07 0 010 4.14zM7.12 20.45H3.56V9h3.56v11.45z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M16.5 2h-3.2v13.6c0 1.5-1.2 2.7-2.7 2.7a2.7 2.7 0 01-2.7-2.7 2.7 2.7 0 012.7-2.7c.27 0 .53.04.78.11V9.7a6 6 0 00-.78-.05A5.9 5.9 0 004.7 15.6 5.9 5.9 0 0010.6 21.5a5.9 5.9 0 005.9-5.9V8.4a8.3 8.3 0 004.8 1.54V6.7a5 5 0 01-4.8-4.7z" />
    </svg>
  );
}

type SharePlatform = {
  id: string;
  label: string;
  bg: string;
  icon: () => React.ReactElement;
  buildHref: (url: string, text: string) => string;
  copyBeforeOpen?: boolean;
};

const SHARE_PLATFORMS: SharePlatform[] = [
  {
    id: "whatsapp",
    label: "WhatsApp",
    bg: "bg-[#25D366]",
    icon: WhatsAppIcon,
    buildHref: (url, text) => `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
  },
  {
    id: "instagram",
    label: "Instagram",
    bg: "bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af]",
    icon: InstagramIcon,
    // Instagram has no public web share-intent for links, so we open the app/site
    // directly and copy the link for the user to paste.
    buildHref: () => "https://www.instagram.com/",
    copyBeforeOpen: true,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    bg: "bg-[#0A66C2]",
    icon: LinkedInIcon,
    buildHref: (url) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    id: "x",
    label: "X",
    bg: "bg-black",
    icon: XIcon,
    buildHref: (url, text) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
  {
    id: "tiktok",
    label: "TikTok",
    bg: "bg-black",
    icon: TikTokIcon,
    // TikTok has no public web share-intent for links either.
    buildHref: () => "https://www.tiktok.com/upload",
    copyBeforeOpen: true,
  },
];

export default function ShareBusinessModal({
  open,
  onOpenChange,
  businessName,
  shareUrl,
}: ShareBusinessModalProps) {
  const [copied, setCopied] = useState(false);
  const displayUrl = shareUrl.replace(/^https?:\/\//, "");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link berhasil disalin");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Gagal menyalin link");
    }
  };

  const handlePlatformClick = (platform: SharePlatform) => {
    const text = `Lihat ${businessName} di Katamereka`;
    if (platform.copyBeforeOpen) {
      handleCopy();
      toast.info(`Link disalin, tempel di ${platform.label} untuk membagikan`);
    }
    window.open(platform.buildHref(shareUrl, text), "_blank", "noopener,noreferrer");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="gap-5 rounded-t-3xl rounded-b-none border-slate-200 p-6 pb-8 shadow-xl bottom-0 top-auto left-0 translate-x-0 translate-y-0 w-full max-w-full sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[calc(100%-2rem)] sm:max-w-md sm:rounded-3xl"
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-extrabold text-slate-900">
            Bagikan {businessName}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Bagikan profil bisnis ini ke teman atau platform lainnya.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between gap-2 sm:gap-3">
          {SHARE_PLATFORMS.map((platform) => {
            const Icon = platform.icon;
            return (
              <button
                key={platform.id}
                type="button"
                onClick={() => handlePlatformClick(platform)}
                className="flex flex-col items-center gap-1.5 group focus:outline-none"
                aria-label={`Bagikan via ${platform.label}`}
              >
                <span
                  className={`w-11 h-11 rounded-full flex items-center justify-center text-white transition-transform duration-150 group-hover:scale-110 group-focus-visible:ring-2 group-focus-visible:ring-offset-2 group-focus-visible:ring-[#008767] ${platform.bg}`}
                >
                  <Icon />
                </span>
                <span className="text-[11px] font-medium text-slate-600">{platform.label}</span>
              </button>
            );
          })}
        </div>

        <div className="pt-4 border-t border-slate-100 space-y-2">
          <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Link2 className="w-3.5 h-3.5 text-[#008767]" />
            Salin tautan
          </p>
          <p className="text-xs text-slate-500">Link publik dapat dibagikan ke siapa saja.</p>

          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-600 truncate">
              {displayUrl}
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className={`shrink-0 inline-flex items-center justify-center gap-1.5 min-w-[108px] px-3.5 py-2.5 rounded-xl border font-semibold text-xs sm:text-sm whitespace-nowrap transition-colors active:scale-95 ${
                copied
                  ? "bg-emerald-50 text-[#008767] border-[#008767]/30"
                  : "bg-[#008767] hover:bg-[#007458] text-white border-transparent"
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Tersalin" : "Salin Link"}</span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
