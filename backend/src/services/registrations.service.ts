import { createAdminClient, createAnonClient } from "../lib/supabase.js";
import type {
  Registration,
  RegistrationFormData,
  RegistrationStatus,
} from "../types/database.js";

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
  formData: RegistrationFormData,
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
      college: formData.college,
      role: formData.role,
      linkedin: formData.linkedin,
      city: formData.city,
      reason: formData.reason,
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
  const supabase = createAnonClient();
  const { data } = await supabase
    .from("registrations")
    .select("id, attendee_id")
    .eq("event_id", eventId)
    .eq("email", email)
    .single();

  return data;
}
