"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageBuilder } from "@/features/admin/page-builder";
import { BannerUpload } from "@/features/admin/banner-upload";
import { RegistrationFormBuilder } from "@/features/admin/registration-form-builder";
import { EventShareDialog } from "@/features/admin/event-share-dialog";
import type { Event, EventType, PageSection, RegistrationFormField } from "@/types/database";
import { slugify } from "@/lib/utils";
import { clientApiFetch } from "@/lib/api-client";
import { getEventFormFields } from "@/lib/registration-fields";
import { buildEventRegistrationUrl } from "@/lib/utm";
import { getAppUrl } from "@/lib/api";
import { EVENT_TYPES } from "@/lib/constants";

interface EventFormProps {
  event?: Event;
}

const DEFAULT_PAGE_CONFIG: PageSection[] = [
  { id: "hero", type: "hero", enabled: true, order: 0 },
  { id: "about", type: "about", enabled: true, order: 1 },
  { id: "speakers", type: "speakers", enabled: true, order: 2 },
  { id: "schedule", type: "schedule", enabled: true, order: 3 },
  { id: "who_should_attend", type: "who_should_attend", enabled: true, order: 4 },
  { id: "faq", type: "faq", enabled: true, order: 5 },
  { id: "testimonials", type: "testimonials", enabled: true, order: 6 },
  { id: "registration", type: "registration", enabled: true, order: 7 },
];

export function EventForm({ event }: EventFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [shareEvent, setShareEvent] = useState<Event | null>(null);
  const [activeTab, setActiveTab] = useState<
    "details" | "content" | "registration" | "builder"
  >("details");
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);

  useEffect(() => {
    clientApiFetch("/api/admin/event-types")
      .then((res) => res.json())
      .then((data) => setEventTypes(data.eventTypes || []))
      .catch(() => setEventTypes([]));
  }, []);

  const [form, setForm] = useState({
    title: event?.title || "",
    slug: event?.slug || "",
    subtitle: event?.subtitle || "",
    tagline: event?.tagline || "",
    description: event?.description || "",
    banner_url: event?.banner_url || "",
    event_type: event?.event_type || "webinar",
    mode: event?.mode || "online",
    venue: event?.venue || "",
    start_date: event?.start_date
      ? new Date(event.start_date).toISOString().slice(0, 16)
      : "",
    end_date: event?.end_date
      ? new Date(event.end_date).toISOString().slice(0, 16)
      : "",
    seats: event?.seats || 100,
    duration_minutes: event?.duration_minutes || 120,
    whatsapp_community_link: event?.whatsapp_community_link || "",
    utm_source: event?.utm_source || "vedam-events",
    utm_medium: event?.utm_medium || "web",
    utm_campaign: event?.utm_campaign || event?.slug || "",
    is_featured: event?.is_featured || false,
    status: event?.status || "draft",
    meta_title: event?.meta_title || "",
    meta_description: event?.meta_description || "",
    speaker_data: JSON.stringify(event?.speaker_data || [], null, 2),
    schedule_data: JSON.stringify(event?.schedule_data || [], null, 2),
    learning_outcomes: (event?.learning_outcomes || []).join("\n"),
    benefits: (event?.benefits || []).join("\n"),
    who_should_attend: (event?.who_should_attend || []).join("\n"),
    faq_data: JSON.stringify(event?.faq_data || [], null, 2),
    testimonials_data: JSON.stringify(event?.testimonials_data || [], null, 2),
    page_config: event?.page_config?.length
      ? event.page_config
      : DEFAULT_PAGE_CONFIG,
    registration_form_fields: getEventFormFields(
      event?.registration_form_fields
    ),
  });

  const trackingLink =
    form.slug.trim() &&
    buildEventRegistrationUrl(getAppUrl(), form.slug, {
      utm_source: form.utm_source,
      utm_medium: form.utm_medium,
      utm_campaign: form.utm_campaign || form.slug,
    });

  const typeOptions =
    eventTypes.filter((t) => t.is_active).length > 0
      ? eventTypes.filter((t) => t.is_active)
      : EVENT_TYPES.map((t) => ({
          id: t.value,
          slug: t.value,
          label: t.label,
          is_active: true,
          sort_order: 0,
          description: null,
          created_at: "",
          updated_at: "",
        }));

  const update = (key: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleTitleChange = (title: string) => {
    update("title", title);
    if (!event) update("slug", slugify(title));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...form,
        whatsapp_group_link: null,
        registration_form_fields: form.registration_form_fields,
        utm_campaign: form.utm_campaign || form.slug,
        seats: Number(form.seats),
        duration_minutes: Number(form.duration_minutes),
        is_featured: form.is_featured,
        learning_outcomes: form.learning_outcomes
          .split("\n")
          .filter(Boolean),
        benefits: form.benefits.split("\n").filter(Boolean),
        who_should_attend: form.who_should_attend
          .split("\n")
          .filter(Boolean),
        speaker_data: JSON.parse(form.speaker_data || "[]"),
        schedule_data: JSON.parse(form.schedule_data || "[]"),
        faq_data: JSON.parse(form.faq_data || "[]"),
        testimonials_data: JSON.parse(form.testimonials_data || "[]"),
        start_date: new Date(form.start_date).toISOString(),
        end_date: form.end_date
          ? new Date(form.end_date).toISOString()
          : null,
      };

      const method = event ? "PUT" : "POST";
      const body = event ? { id: event.id, ...payload } : payload;

      if (!form.start_date) {
        alert("Please set a start date and time");
        setLoading(false);
        return;
      }

      if (!form.slug.trim()) {
        alert("Please set an event slug");
        setLoading(false);
        return;
      }

      let res: Response;
      try {
        res = await clientApiFetch("/api/admin/events", {
          method,
          body: JSON.stringify(body),
        });
      } catch {
        throw new Error(
          "Cannot reach the API. Run `npm run dev` from the project root (backend + frontend), then try again."
        );
      }

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "Failed to save event"
        );
      }

      const saved = data.event as Event | undefined;
      if (!saved) throw new Error("Invalid response from server");

      setShareEvent(saved);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "details", label: "Event Details" },
    { id: "content", label: "Content" },
    { id: "registration", label: "Registration" },
    { id: "builder", label: "Page Builder" },
  ] as const;

  return (
    <>
      {shareEvent && (
        <EventShareDialog
          event={shareEvent}
          onClose={() => {
            setShareEvent(null);
            router.push("/admin/events");
            router.refresh();
          }}
        />
      )}
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex gap-2 border-b border-white/5 pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              activeTab === tab.id
                ? "bg-vedam-orange/10 text-vedam-orange"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "details" && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4 md:col-span-2">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Slug *</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => update("slug", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Event Type</Label>
                <Select
                  value={form.event_type}
                  onValueChange={(v) => update("event_type", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.map((t) => (
                      <SelectItem key={t.slug} value={t.slug}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  <a href="/admin/event-types" className="text-vedam-orange hover:underline">
                    Manage event types
                  </a>
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Subtitle</Label>
            <Input
              value={form.subtitle}
              onChange={(e) => update("subtitle", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Tagline</Label>
            <Input
              value={form.tagline}
              onChange={(e) => update("tagline", e.target.value)}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={4}
            />
          </div>

          <BannerUpload
            value={form.banner_url}
            onChange={(url) => update("banner_url", url)}
          />
          <div className="space-y-2">
            <Label>Mode</Label>
            <Select
              value={form.mode}
              onValueChange={(v) => update("mode", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Venue</Label>
            <Input
              value={form.venue}
              onChange={(e) => update("venue", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Seats</Label>
            <Input
              type="number"
              value={form.seats}
              onChange={(e) => update("seats", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Start Date & Time *</Label>
            <Input
              type="datetime-local"
              value={form.start_date}
              onChange={(e) => update("start_date", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>End Date & Time</Label>
            <Input
              type="datetime-local"
              value={form.end_date}
              onChange={(e) => update("end_date", e.target.value)}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label className="text-vedam-orange">
              WhatsApp Community Link *
            </Label>
            <Input
              value={form.whatsapp_community_link}
              onChange={(e) =>
                update("whatsapp_community_link", e.target.value)
              }
              placeholder="https://chat.whatsapp.com/..."
            />
            <p className="text-xs text-muted-foreground">
              Users will be redirected here after registration
            </p>
          </div>

          <div className="space-y-2 md:col-span-2 border-t border-white/5 pt-6">
            <Label className="text-vedam-orange">UTM tracking (per registrant)</Label>
            <p className="text-xs text-muted-foreground mb-4">
              Each registration is tagged with these UTM values. Share the tracking link below; every user gets a unique utm_content (attendee ID).
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>UTM Source</Label>
                <Input
                  value={form.utm_source}
                  onChange={(e) => update("utm_source", e.target.value)}
                  placeholder="instagram"
                />
              </div>
              <div className="space-y-2">
                <Label>UTM Medium</Label>
                <Input
                  value={form.utm_medium}
                  onChange={(e) => update("utm_medium", e.target.value)}
                  placeholder="social"
                />
              </div>
              <div className="space-y-2">
                <Label>UTM Campaign</Label>
                <Input
                  value={form.utm_campaign}
                  onChange={(e) => update("utm_campaign", e.target.value)}
                  placeholder={form.slug || "event-slug"}
                />
              </div>
            </div>
            {trackingLink && (
              <div className="mt-4 p-3 rounded-lg bg-white/5 text-xs break-all">
                <span className="text-muted-foreground">Tracking link: </span>
                <a
                  href={trackingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-vedam-orange hover:underline"
                >
                  {trackingLink}
                </a>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={form.status}
              onValueChange={(v) => update("status", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="featured"
              checked={form.is_featured}
              onChange={(e) => update("is_featured", e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="featured">Featured Event</Label>
          </div>
        </div>
      )}

      {activeTab === "content" && (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Learning Outcomes (one per line)</Label>
            <Textarea
              value={form.learning_outcomes}
              onChange={(e) => update("learning_outcomes", e.target.value)}
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label>Benefits (one per line)</Label>
            <Textarea
              value={form.benefits}
              onChange={(e) => update("benefits", e.target.value)}
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label>Who Should Attend (one per line)</Label>
            <Textarea
              value={form.who_should_attend}
              onChange={(e) => update("who_should_attend", e.target.value)}
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label>Speakers (JSON)</Label>
            <Textarea
              value={form.speaker_data}
              onChange={(e) => update("speaker_data", e.target.value)}
              rows={6}
              className="font-mono text-xs"
            />
          </div>
          <div className="space-y-2">
            <Label>Schedule (JSON)</Label>
            <Textarea
              value={form.schedule_data}
              onChange={(e) => update("schedule_data", e.target.value)}
              rows={6}
              className="font-mono text-xs"
            />
          </div>
          <div className="space-y-2">
            <Label>FAQ (JSON)</Label>
            <Textarea
              value={form.faq_data}
              onChange={(e) => update("faq_data", e.target.value)}
              rows={4}
              className="font-mono text-xs"
            />
          </div>
          <div className="space-y-2">
            <Label>Testimonials (JSON)</Label>
            <Textarea
              value={form.testimonials_data}
              onChange={(e) => update("testimonials_data", e.target.value)}
              rows={4}
              className="font-mono text-xs"
            />
          </div>
        </div>
      )}

      {activeTab === "registration" && (
        <RegistrationFormBuilder
          fields={form.registration_form_fields}
          onChange={(fields) => update("registration_form_fields", fields)}
        />
      )}

      {activeTab === "builder" && (
        <PageBuilder
          sections={form.page_config}
          onChange={(sections) => update("page_config", sections)}
        />
      )}

      <div className="flex gap-4 pt-4 border-t border-white/5">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : event ? "Update Event" : "Create Event"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
    </>
  );
}
