import type { Event } from "../types/database.js";

const EVENT_COLUMNS = new Set([
  "slug",
  "title",
  "subtitle",
  "tagline",
  "description",
  "banner_url",
  "event_type",
  "mode",
  "venue",
  "start_date",
  "end_date",
  "seats",
  "duration_minutes",
  "whatsapp_community_link",
  "whatsapp_group_link",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "is_featured",
  "status",
  "meta_title",
  "meta_description",
  "speaker_data",
  "schedule_data",
  "page_config",
  "learning_outcomes",
  "benefits",
  "who_should_attend",
  "faq_data",
  "testimonials_data",
  "registration_form_fields",
]);

function emptyToNull(value: unknown): unknown {
  if (value === "" || value === undefined) return null;
  return value;
}

export function sanitizeEventPayload(body: Record<string, unknown>): Partial<Event> {
  const payload: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(body)) {
    if (!EVENT_COLUMNS.has(key)) continue;
    if (key === "is_featured") {
      payload[key] = Boolean(value);
      continue;
    }
    if (key === "seats" || key === "duration_minutes") {
      payload[key] = value === null || value === "" ? null : Number(value);
      continue;
    }
    if (
      key === "subtitle" ||
      key === "tagline" ||
      key === "description" ||
      key === "banner_url" ||
      key === "venue" ||
      key === "meta_title" ||
      key === "meta_description" ||
      key === "whatsapp_community_link" ||
      key === "whatsapp_group_link" ||
      key === "utm_source" ||
      key === "utm_medium" ||
      key === "utm_campaign"
    ) {
      payload[key] = emptyToNull(value);
      continue;
    }
    payload[key] = value;
  }

  if (typeof payload.slug === "string") {
    payload.slug = payload.slug.trim().toLowerCase();
  }
  if (typeof payload.title === "string") {
    payload.title = payload.title.trim();
  }

  return payload as Partial<Event>;
}

export function formatDbError(error: { code?: string; message?: string }): string {
  if (error.code === "23505") {
    if (error.message?.includes("slug")) {
      return "An event with this slug already exists. Choose a different slug.";
    }
    return "This event already exists.";
  }
  return error.message || "Database error";
}
