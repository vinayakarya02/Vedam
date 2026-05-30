import { createAnonClient, createAdminClient } from "../lib/supabase.js";
import { isSupabaseConfigured } from "../lib/env.js";
import type { Event, EventStatus } from "../types/database.js";

export async function getPublishedEvents(filters?: {
  featured?: boolean;
  upcoming?: boolean;
  past?: boolean;
  search?: string;
  eventType?: string;
}) {
  if (!isSupabaseConfigured()) return [];

  const supabase = createAnonClient();
  let query = supabase
    .from("events")
    .select("*")
    .eq("status", "published")
    .order("start_date", { ascending: true });

  if (filters?.featured) {
    query = query.eq("is_featured", true);
  }

  if (filters?.upcoming) {
    query = query.gte("start_date", new Date().toISOString());
  }

  if (filters?.past) {
    query = query.lt("start_date", new Date().toISOString());
  }

  if (filters?.eventType) {
    query = query.eq("event_type", filters.eventType);
  }

  if (filters?.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,subtitle.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
    );
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Event[];
}

export async function getEventBySlug(slug: string) {
  if (!isSupabaseConfigured()) return null;

  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error) return null;
  return data as Event;
}

export async function getAllEventsAdmin() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Event[];
}

export async function getEventByIdAdmin(id: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as Event;
}

export async function createEvent(event: Partial<Event>) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("events")
    .insert(event)
    .select()
    .single();

  if (error) throw error;
  return data as Event;
}

export async function updateEvent(id: string, event: Partial<Event>) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("events")
    .update(event)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Event;
}

export async function deleteEvent(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw error;
}

export async function duplicateEvent(id: string) {
  const event = await getEventByIdAdmin(id);
  if (!event) throw new Error("Event not found");

  const { id: _id, created_at, updated_at, registrations_count, ...rest } = event;
  return createEvent({
    ...rest,
    slug: `${rest.slug}-copy-${Date.now()}`,
    title: `${rest.title} (Copy)`,
    status: "draft" as EventStatus,
    registrations_count: 0,
  });
}

export async function updateEventStatus(id: string, status: EventStatus) {
  return updateEvent(id, { status });
}
