import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  }).format(new Date(date));
}

export function formatTime(date: string | Date) {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(date));
}

export function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function getSeatsLeft(seats: number, registrations: number) {
  return Math.max(0, seats - registrations);
}

export function isEventUpcoming(startDate: string) {
  return new Date(startDate) > new Date();
}

export function isEventPast(endDate: string | null, startDate: string) {
  const compareDate = endDate ? new Date(endDate) : new Date(startDate);
  return compareDate < new Date();
}

export function generateAttendeeId(eventSlug: string): string {
  const prefix = eventSlug.slice(0, 3).toUpperCase();
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `VED-${prefix}-${timestamp}-${random}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getEventTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    workshop: "Workshop",
    webinar: "Webinar",
    hackathon: "Hackathon",
    bootcamp: "Bootcamp",
    masterclass: "Masterclass",
    meetup: "Meetup",
    "career-session": "Career Session",
    "demo-day": "Demo Day",
    "founder-talk": "Founder Talk",
    "campus-event": "Campus Event",
  };
  return labels[type] || type;
}

export function getModeLabel(mode: string): string {
  const labels: Record<string, string> = {
    online: "Online",
    offline: "In-Person",
    hybrid: "Hybrid",
  };
  return labels[mode] || mode;
}

export function calculateWhatsAppRate(
  clicked: number,
  total: number
): number {
  if (total === 0) return 0;
  return Math.round((clicked / total) * 100);
}
