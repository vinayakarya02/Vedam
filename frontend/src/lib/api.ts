import type { Event, EventType } from "@/types/database";

export function getApiUrl(): string {
  const url = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(
    /\/$/,
    ""
  );
  // Browser: use same-origin /api/* (Next.js rewrite → backend). Avoids CORS.
  if (typeof window !== "undefined") {
    return "";
  }
  return url;
}

export function getAppUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  const url = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return url.replace(/\/$/, "");
}

/** Server-side fetch to backend (no auth) */
export async function serverFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`${getApiUrl()}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${path}`);
  }
  return res.json() as Promise<T>;
}

export async function getPublishedEvents(filters?: {
  featured?: boolean;
  upcoming?: boolean;
  past?: boolean;
}): Promise<Event[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.featured) params.set("featured", "true");
    if (filters?.upcoming) params.set("upcoming", "true");
    if (filters?.past) params.set("past", "true");
    const q = params.toString();
    const { events } = await serverFetch<{ events: Event[] }>(
      `/api/events${q ? `?${q}` : ""}`
    );
    return events;
  } catch {
    return [];
  }
}

export async function getEventTypes(): Promise<EventType[]> {
  try {
    const { eventTypes } = await serverFetch<{ eventTypes: EventType[] }>(
      "/api/event-types"
    );
    return eventTypes;
  } catch {
    return [];
  }
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  try {
    const { event } = await serverFetch<{ event: Event }>(`/api/events/${slug}`);
    return event;
  } catch {
    return null;
  }
}

export async function getAllEventsAdmin(token: string): Promise<Event[]> {
  const res = await fetch(`${getApiUrl()}/api/admin/events`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  const { events } = await res.json();
  return events;
}

export async function getEventByIdAdmin(
  id: string,
  token: string
): Promise<Event | null> {
  const res = await fetch(`${getApiUrl()}/api/admin/events/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const { event } = await res.json();
  return event;
}

export async function getAdminDashboard(token: string) {
  const res = await fetch(`${getApiUrl()}/api/admin/analytics/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) {
    return {
      stats: {
        totalEvents: 0,
        activeEvents: 0,
        totalRegistrations: 0,
        attendanceRate: 0,
        whatsappJoinRate: 0,
      },
      registrationsPerDay: [],
      eventPerformance: [],
      attendanceData: [],
    };
  }
  return res.json();
}
