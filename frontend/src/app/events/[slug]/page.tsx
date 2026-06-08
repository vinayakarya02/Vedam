import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getEventBySlug, getPublishedEvents, getAppUrl, getEventTypes } from "@/lib/api";
import { eventTypesToLabelMap } from "@/lib/utils";
import { DynamicEventPage } from "@/features/events/dynamic-event-page";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

interface EventPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const events = await getPublishedEvents().catch(() => []);
  return events.map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({
  params,
}: EventPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) return { title: "Event Not Found" };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return {
    title: event.meta_title || event.title,
    description: event.meta_description || event.tagline || event.subtitle || undefined,
    openGraph: {
      title: event.title,
      description: event.tagline || event.subtitle || undefined,
      images: event.banner_url ? [{ url: event.banner_url }] : [],
      url: `${appUrl}/events/${event.slug}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: event.title,
      description: event.tagline || undefined,
      images: event.banner_url ? [event.banner_url] : [],
    },
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;
  const [event, eventTypes] = await Promise.all([
    getEventBySlug(slug),
    getEventTypes().catch(() => []),
  ]);

  if (!event) notFound();

  const typeLabels = eventTypesToLabelMap(eventTypes);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description,
    startDate: event.start_date,
    endDate: event.end_date || event.start_date,
    eventAttendanceMode:
      event.mode === "online"
        ? "https://schema.org/OnlineEventAttendanceMode"
        : "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: {
      "@type": "Place",
      name: event.venue || "Online",
    },
    organizer: {
      "@type": "Organization",
      name: "Vedam School of Technology",
      url: "https://vedam.org",
    },
    image: event.banner_url,
    offers: {
      "@type": "Offer",
      url: `${getAppUrl()}/events/${event.slug}`,
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DynamicEventPage event={event} typeLabels={typeLabels} />
    </>
  );
}
