import { createAdminClient } from "../lib/supabase.js";
import type { EventType } from "../types/database.js";

export async function getActiveEventTypes() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("event_types")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data as EventType[];
}

export async function getAllEventTypesAdmin() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("event_types")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data as EventType[];
}

export async function createEventType(payload: {
  slug: string;
  label: string;
  description?: string | null;
  sort_order?: number;
  is_active?: boolean;
}) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("event_types")
    .insert({
      slug: payload.slug,
      label: payload.label,
      description: payload.description ?? null,
      sort_order: payload.sort_order ?? 0,
      is_active: payload.is_active ?? true,
    })
    .select()
    .single();

  if (error) throw error;
  return data as EventType;
}

export async function updateEventType(
  id: string,
  payload: Partial<{
    slug: string;
    label: string;
    description: string | null;
    sort_order: number;
    is_active: boolean;
  }>
) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("event_types")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as EventType;
}

export async function deleteEventType(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("event_types").delete().eq("id", id);
  if (error) throw error;
}
