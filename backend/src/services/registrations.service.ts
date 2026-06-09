import { createAdminClient } from "../lib/supabase.js";
import type {
  Registration,
  RegistrationStatus,
} from "../types/database.js";

export interface RegistrationInsertData {
  name: string;
  email: string;
  phone: string;
  passout_year_12th: string | null;
  stream_12th: string | null;
  college: string | null;
  role: string | null;
  linkedin: string | null;
  city: string | null;
  reason: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  form_responses: Record<string, string>;
}

export async function getRegistrationsByEvent(eventId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("registrations")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Registration[];
}

export async function getAllRegistrations() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("registrations")
    .select("*, events(title, slug)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getRegistrationByAttendeeId(attendeeId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("registrations")
    .select("*, events(*)")
    .eq("attendee_id", attendeeId)
    .single();

  if (error) return null;
  return data;
}

export async function createRegistration(
  eventId: string,
  formData: RegistrationInsertData,
  attendeeId: string,
  qrCode: string
) {
  const supabase = createAdminClient();

  const { data: event } = await supabase
    .from("events")
    .select("seats, registrations_count")
    .eq("id", eventId)
    .single();

  const status: RegistrationStatus =
    event && event.registrations_count >= event.seats
      ? "waitlisted"
      : "registered";

  const { data, error } = await supabase
    .from("registrations")
    .insert({
      event_id: eventId,
      attendee_id: attendeeId,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      passout_year_12th: formData.passout_year_12th,
      stream_12th: formData.stream_12th,
      college: formData.college,
      role: formData.role,
      linkedin: formData.linkedin,
      city: formData.city,
      reason: formData.reason,
      utm_source: formData.utm_source,
      utm_medium: formData.utm_medium,
      utm_campaign: formData.utm_campaign,
      utm_content: formData.utm_content,
      form_responses: formData.form_responses,
      qr_code: qrCode,
      status,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Registration;
}

export async function updateRegistrationStatus(
  id: string,
  status: RegistrationStatus
) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("registrations")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Registration;
}

export async function markAttendance(attendeeId: string) {
  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("registrations")
    .select("*")
    .eq("attendee_id", attendeeId)
    .single();

  if (!existing) {
    return { success: false, error: "Registration not found" };
  }

  if (existing.status === "attended") {
    return { success: false, error: "Already checked in", registration: existing };
  }

  const { data, error } = await supabase
    .from("registrations")
    .update({ status: "attended" })
    .eq("attendee_id", attendeeId)
    .select("*, events(title)")
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, registration: data };
}

export async function trackWhatsAppClick(registrationId: string) {
  const supabase = createAdminClient();
  await supabase
    .from("registrations")
    .update({
      whatsapp_clicked: true,
      whatsapp_clicked_at: new Date().toISOString(),
    })
    .eq("id", registrationId);

  await supabase.from("analytics_events").insert({
    registration_id: registrationId,
    event_type: "whatsapp_click",
  });
}

export async function checkExistingRegistration(eventId: string, email: string) {
  // Must use the admin (service-role) client: RLS has no public SELECT policy
  // on registrations, so the anon client always sees zero rows and the
  // duplicate check would silently pass — letting the insert hit the
  // UNIQUE(event_id, email) constraint and throw a 500 instead of a clean 409.
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("registrations")
    .select("id, attendee_id")
    .eq("event_id", eventId)
    .eq("email", email)
    .maybeSingle();

  return data;
}
