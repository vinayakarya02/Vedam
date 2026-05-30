import { createAdminClient } from "../lib/supabase.js";
import type { DashboardStats } from "../types/database.js";

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = createAdminClient();

  const { data: events } = await supabase.from("events").select("id, status, start_date, end_date, seats, registrations_count");

  const { data: registrations } = await supabase
    .from("registrations")
    .select("id, status, whatsapp_clicked");

  const totalEvents = events?.length ?? 0;
  const activeEvents =
    events?.filter(
      (e) =>
        e.status === "published" &&
        new Date(e.start_date) >= new Date()
    ).length ?? 0;

  const totalRegistrations = registrations?.length ?? 0;
  const attended =
    registrations?.filter((r) => r.status === "attended").length ?? 0;
  const registered =
    registrations?.filter(
      (r) => r.status === "registered" || r.status === "attended"
    ).length ?? 0;

  const attendanceRate =
    registered > 0 ? Math.round((attended / registered) * 100) : 0;

  const whatsappClicked =
    registrations?.filter((r) => r.whatsapp_clicked).length ?? 0;
  const whatsappJoinRate =
    totalRegistrations > 0
      ? Math.round((whatsappClicked / totalRegistrations) * 100)
      : 0;

  return {
    totalEvents,
    activeEvents,
    totalRegistrations,
    attendanceRate,
    whatsappJoinRate,
  };
}

export async function getRegistrationsPerDay(days = 30) {
  const supabase = createAdminClient();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data } = await supabase
    .from("registrations")
    .select("created_at")
    .gte("created_at", startDate.toISOString())
    .order("created_at", { ascending: true });

  const grouped: Record<string, number> = {};
  data?.forEach((r) => {
    const day = new Date(r.created_at).toISOString().split("T")[0];
    grouped[day] = (grouped[day] || 0) + 1;
  });

  return Object.entries(grouped).map(([date, count]) => ({ date, count }));
}

export async function getEventPerformance() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("events")
    .select("id, title, slug, registrations_count, seats, start_date")
    .eq("status", "published")
    .order("registrations_count", { ascending: false })
    .limit(10);

  return (
    data?.map((e) => ({
      name: e.title.length > 20 ? e.title.slice(0, 20) + "…" : e.title,
      registrations: e.registrations_count,
      capacity: Math.round((e.registrations_count / e.seats) * 100),
      slug: e.slug,
    })) ?? []
  );
}

export async function getAttendanceAnalytics() {
  const supabase = createAdminClient();
  const { data } = await supabase.from("registrations").select("status");

  const counts = {
    registered: 0,
    waitlisted: 0,
    attended: 0,
    cancelled: 0,
  };

  data?.forEach((r) => {
    if (r.status in counts) {
      counts[r.status as keyof typeof counts]++;
    }
  });

  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

export async function trackAnalytics(
  eventType: string,
  eventId?: string,
  registrationId?: string,
  metadata?: Record<string, unknown>
) {
  const supabase = createAdminClient();
  await supabase.from("analytics_events").insert({
    event_id: eventId,
    registration_id: registrationId,
    event_type: eventType,
    metadata: metadata ?? {},
  });
}
