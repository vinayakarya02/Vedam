import "dotenv/config";
import express from "express";
import cors from "cors";
import { z } from "zod";
import { requireAdmin } from "./middleware/auth.js";
import {
  getPublishedEvents,
  getEventBySlug,
  getAllEventsAdmin,
  getEventByIdAdmin,
  createEvent,
  updateEvent,
  deleteEvent,
  duplicateEvent,
} from "./services/events.service.js";
import {
  createRegistration,
  checkExistingRegistration,
  getRegistrationByAttendeeId,
  getRegistrationsByEvent,
  getAllRegistrations,
  updateRegistrationStatus,
  markAttendance,
  trackWhatsAppClick,
} from "./services/registrations.service.js";
import {
  getDashboardStats,
  getRegistrationsPerDay,
  getEventPerformance,
  getAttendanceAnalytics,
  trackAnalytics,
} from "./services/analytics.service.js";
import { generateQRCode, getQRData } from "./services/qr.service.js";
import { sendRegistrationConfirmation } from "./services/email.service.js";
import {
  sendReminderEmail,
  sendStartingSoonEmail,
  sendThankYouEmail,
} from "./services/email.service.js";
import { generateAttendeeId } from "./lib/utils.js";
import { isSupabaseConfigured } from "./lib/env.js";
import { getAppUrl } from "./lib/env.js";
import { createAdminClient } from "./lib/supabase.js";
import type { Event, Registration, RegistrationStatus } from "./types/database.js";

const app = express();
const PORT = Number(process.env.PORT) || 4000;

function getCorsOrigins(): string[] {
  const origins = new Set<string>();
  process.env.CORS_ALLOWED_ORIGINS?.split(",").forEach((o) => {
    const t = o.trim();
    if (t) origins.add(t);
  });
  if (process.env.FRONTEND_URL) origins.add(process.env.FRONTEND_URL.replace(/\/$/, ""));
  if (process.env.RENDER_EXTERNAL_URL) origins.add(process.env.RENDER_EXTERNAL_URL.replace(/\/$/, ""));
  origins.add("http://localhost:3000");
  origins.add("http://127.0.0.1:3000");
  return Array.from(origins);
}

app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = getCorsOrigins();
      if (!origin || allowed.includes(origin) || allowed.includes("*")) {
        callback(null, true);
      } else {
        callback(null, allowed[0] ?? "http://localhost:3000");
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
  })
);
app.use(express.json({ limit: "4mb" }));

// ——— Health ———
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "vedam-events-api",
    timestamp: new Date().toISOString(),
    supabase: isSupabaseConfigured() ? "configured" : "missing",
  });
});

// ——— Public events ———
app.get("/api/events", async (req, res) => {
  try {
    const events = await getPublishedEvents({
      featured: req.query.featured === "true",
      upcoming: req.query.upcoming === "true",
      past: req.query.past === "true",
      search: req.query.search as string | undefined,
      eventType: req.query.type as string | undefined,
    });
    res.json({ events });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

app.get("/api/events/:slug", async (req, res) => {
  const slug = String(req.params.slug);
  const event = await getEventBySlug(slug);
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  res.json({ event });
});

// ——— Registration ———
const registerSchema = z.object({
  eventId: z.string().uuid(),
  eventSlug: z.string(),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  college: z.string().min(2),
  role: z.string().min(1),
  linkedin: z.string().nullable().optional(),
  city: z.string().min(2),
  reason: z.string().min(10),
});

app.post("/api/register", async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);
    const existing = await checkExistingRegistration(data.eventId, data.email);
    if (existing) {
      res.status(409).json({ error: "You're already registered for this event" });
      return;
    }

    const event = await getEventByIdAdmin(data.eventId);
    if (!event || event.status !== "published") {
      res.status(404).json({ error: "Event not found" });
      return;
    }

    const attendeeId = generateAttendeeId(data.eventSlug);
    const qrCodeDataUrl = await generateQRCode(getQRData(attendeeId, data.eventId));

    const registration = await createRegistration(
      data.eventId,
      {
        name: data.name,
        email: data.email,
        phone: data.phone,
        college: data.college,
        role: data.role,
        linkedin: data.linkedin || "",
        city: data.city,
        reason: data.reason,
      },
      attendeeId,
      qrCodeDataUrl
    );

    await trackAnalytics("registration", data.eventId, registration.id, {
      eventSlug: data.eventSlug,
    });

    sendRegistrationConfirmation(registration, event, qrCodeDataUrl).catch(console.error);

    res.json({
      success: true,
      attendeeId: registration.attendee_id,
      registrationId: registration.id,
      whatsappLink: event.whatsapp_community_link,
      status: registration.status,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid form data", details: error.errors });
      return;
    }
    console.error(error);
    res.status(500).json({ error: "Registration failed" });
  }
});

app.get("/api/registrations/:attendeeId", async (req, res) => {
  const data = await getRegistrationByAttendeeId(String(req.params.attendeeId));
  if (!data) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({ data });
});

app.post("/api/analytics/whatsapp-click", async (req, res) => {
  try {
    const { registrationId, attendeeId } = req.body;
    if (registrationId) {
      await trackWhatsAppClick(registrationId);
    } else if (attendeeId) {
      const supabase = createAdminClient();
      const { data } = await supabase
        .from("registrations")
        .select("id")
        .eq("attendee_id", attendeeId)
        .single();
      if (data) await trackWhatsAppClick(data.id);
    }
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
});

app.post("/api/attendance/scan", requireAdmin, async (req, res) => {
  try {
    const { qrData } = req.body;
    let attendeeId: string;
    try {
      attendeeId = JSON.parse(qrData).attendeeId;
    } catch {
      attendeeId = qrData;
    }
    const result = await markAttendance(attendeeId);
    if (!result.success) {
      res.status(400).json({ error: result.error, registration: result.registration });
      return;
    }
    res.json({ success: true, registration: result.registration });
  } catch {
    res.status(500).json({ error: "Scan failed" });
  }
});

app.get("/api/calendar", async (req, res) => {
  const attendeeId = req.query.attendee as string;
  if (!attendeeId) {
    res.status(400).json({ error: "Missing attendee ID" });
    return;
  }
  const registration = await getRegistrationByAttendeeId(attendeeId);
  if (!registration?.events) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const event = registration.events as Event;
  const start = new Date(event.start_date);
  const end = event.end_date
    ? new Date(event.end_date)
    : new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Vedam Events//EN
BEGIN:VEVENT
UID:${attendeeId}@vedam.org
DTSTAMP:${fmt(new Date())}
DTSTART:${fmt(start)}
DTEND:${fmt(end)}
SUMMARY:${event.title}
DESCRIPTION:Vedam Event - Attendee ID: ${attendeeId}
LOCATION:${event.venue || "Online"}
END:VEVENT
END:VCALENDAR`;
  res.setHeader("Content-Type", "text/calendar; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="vedam-event-${attendeeId}.ics"`);
  res.send(ics);
});

// ——— Admin analytics ———
app.get("/api/admin/analytics/dashboard", requireAdmin, async (_req, res) => {
  try {
    const [stats, registrationsPerDay, eventPerformance, attendanceData] =
      await Promise.all([
        getDashboardStats(),
        getRegistrationsPerDay(),
        getEventPerformance(),
        getAttendanceAnalytics(),
      ]);
    res.json({ stats, registrationsPerDay, eventPerformance, attendanceData });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load analytics" });
  }
});

// ——— Admin events ———
app.get("/api/admin/events", requireAdmin, async (_req, res) => {
  const events = await getAllEventsAdmin();
  res.json({ events });
});

app.get("/api/admin/events/:id", requireAdmin, async (req, res) => {
  const event = await getEventByIdAdmin(String(req.params.id));
  if (!event) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({ event });
});

app.post("/api/admin/events", requireAdmin, async (req, res) => {
  const event = await createEvent(req.body);
  res.json({ event });
});

app.put("/api/admin/events", requireAdmin, async (req, res) => {
  const { id, ...data } = req.body;
  const event = await updateEvent(id, data);
  res.json({ event });
});

app.delete("/api/admin/events", requireAdmin, async (req, res) => {
  await deleteEvent(req.body.id);
  res.json({ success: true });
});

app.post("/api/admin/events/duplicate", requireAdmin, async (req, res) => {
  const event = await duplicateEvent(req.body.id);
  res.json({ event });
});

// ——— Admin registrations ———
app.get("/api/admin/registrations", requireAdmin, async (req, res) => {
  const eventId = req.query.eventId as string | undefined;
  const registrations = eventId
    ? await getRegistrationsByEvent(eventId)
    : await getAllRegistrations();
  res.json({ registrations });
});

app.patch("/api/admin/registrations", requireAdmin, async (req, res) => {
  const { id, status } = req.body;
  const registration = await updateRegistrationStatus(id, status as RegistrationStatus);
  res.json({ registration });
});

app.get("/api/admin/registrations/export", requireAdmin, async (req, res) => {
  const eventId = req.query.eventId as string;
  if (!eventId) {
    res.status(400).json({ error: "eventId required" });
    return;
  }
  const registrations = await getRegistrationsByEvent(eventId);
  const headers = [
    "Attendee ID", "Name", "Email", "Phone", "College", "Role",
    "City", "LinkedIn", "Status", "WhatsApp Clicked", "Registered At",
  ];
  const rows = registrations.map((r) => [
    r.attendee_id, r.name, r.email, r.phone, r.college || "", r.role || "",
    r.city || "", r.linkedin || "", r.status,
    r.whatsapp_clicked ? "Yes" : "No", r.created_at,
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="registrations-${eventId}.csv"`);
  res.send(csv);
});

// ——— Cron ———
app.get("/api/cron/reminders", async (req, res) => {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const supabase = createAdminClient();
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowEnd = new Date(tomorrow.getTime() + 60 * 60 * 1000);

  const { data: tomorrowEvents } = await supabase
    .from("events")
    .select("*")
    .eq("status", "published")
    .gte("start_date", tomorrow.toISOString())
    .lte("start_date", tomorrowEnd.toISOString());

  for (const event of (tomorrowEvents || []) as Event[]) {
    const { data: regs } = await supabase
      .from("registrations")
      .select("*")
      .eq("event_id", event.id)
      .in("status", ["registered", "waitlisted"]);
    for (const reg of (regs || []) as Registration[]) {
      await sendReminderEmail(reg, event).catch(console.error);
    }
  }

  const soon = new Date(now.getTime() + 15 * 60 * 1000);
  const soonEnd = new Date(soon.getTime() + 5 * 60 * 1000);
  const { data: soonEvents } = await supabase
    .from("events")
    .select("*")
    .eq("status", "published")
    .gte("start_date", soon.toISOString())
    .lte("start_date", soonEnd.toISOString());

  for (const event of (soonEvents || []) as Event[]) {
    const { data: regs } = await supabase
      .from("registrations")
      .select("*")
      .eq("event_id", event.id)
      .in("status", ["registered", "waitlisted"]);
    for (const reg of (regs || []) as Registration[]) {
      await sendStartingSoonEmail(reg, event).catch(console.error);
    }
  }

  const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const { data: endedEvents } = await supabase
    .from("events")
    .select("*")
    .eq("status", "published")
    .gte("end_date", hourAgo.toISOString())
    .lte("end_date", now.toISOString());

  for (const event of (endedEvents || []) as Event[]) {
    const { data: regs } = await supabase
      .from("registrations")
      .select("*")
      .eq("event_id", event.id)
      .eq("status", "attended");
    for (const reg of (regs || []) as Registration[]) {
      await sendThankYouEmail(reg, event).catch(console.error);
    }
  }

  res.json({ success: true });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Vedam API running on http://0.0.0.0:${PORT}`);
  console.log(`CORS origins: ${getCorsOrigins().join(", ")}`);
  console.log(`App URL: ${getAppUrl()}`);
});
