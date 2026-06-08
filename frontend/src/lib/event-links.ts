import { buildEventRegistrationUrl } from "@/lib/utm";
import { getAppUrl } from "@/lib/api";
import type { Event } from "@/types/database";

/** Public event landing page (registration form lives on this page). */
export function getEventPageUrl(slug: string, origin?: string): string {
  const base = (origin || getAppUrl()).replace(/\/$/, "");
  return `${base}/events/${slug}`;
}

/** Share / promotion link with UTM tags for tracking. */
export function getEventShareUrl(event: Pick<Event, "slug" | "utm_source" | "utm_medium" | "utm_campaign">, origin?: string): string {
  return buildEventRegistrationUrl(origin || getAppUrl(), event.slug, {
    utm_source: event.utm_source || "vedam-events",
    utm_medium: event.utm_medium || "web",
    utm_campaign: event.utm_campaign || event.slug,
  });
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
