"use client";

import { useState } from "react";
import { ExternalLink, Copy, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Event } from "@/types/database";
import { copyToClipboard, getEventPageUrl, getEventShareUrl } from "@/lib/event-links";

interface EventShareDialogProps {
  event: Pick<
    Event,
    "title" | "slug" | "status" | "utm_source" | "utm_medium" | "utm_campaign"
  >;
  onClose: () => void;
}

export function EventShareDialog({ event, onClose }: EventShareDialogProps) {
  const origin = typeof window !== "undefined" ? window.location.origin : undefined;
  const pageUrl = getEventPageUrl(event.slug, origin);
  const shareUrl = getEventShareUrl(event, origin);
  const [copied, setCopied] = useState<"page" | "share" | null>(null);

  const handleCopy = async (url: string, kind: "page" | "share") => {
    const ok = await copyToClipboard(url);
    if (ok) {
      setCopied(kind);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  const isDraft = event.status !== "published";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="w-full max-w-lg rounded-xl border border-white/10 bg-[#0a0a0a] p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-semibold">Share event</h2>
            <p className="text-sm text-muted-foreground mt-1">{event.title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-muted-foreground"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isDraft ? (
          <div className="mb-4 p-3 rounded-lg bg-amber-500/10 text-amber-200 text-sm">
            This event is a <strong>draft</strong>. Set status to{" "}
            <strong>Published</strong> so students can open the link and register.
          </div>
        ) : (
          <p className="text-sm text-muted-foreground mb-4">
            Share the promotion link below. Students land on your event page and
            register with the form you configured.
          </p>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Promotion link (with UTM tracking)
            </label>
            <div className="flex gap-2">
              <Input readOnly value={shareUrl} className="text-xs font-mono" />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleCopy(shareUrl, "share")}
                title="Copy promotion link"
              >
                {copied === "share" ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                asChild
                disabled={isDraft}
              >
                <a href={shareUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Event page (no UTM)
            </label>
            <div className="flex gap-2">
              <Input readOnly value={pageUrl} className="text-xs font-mono" />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleCopy(pageUrl, "page")}
                title="Copy event page link"
              >
                {copied === "page" ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-white/5">
          <Button type="button" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
