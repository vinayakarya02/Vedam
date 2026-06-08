import { Suspense } from "react";
import type { Metadata } from "next";
import { getPublishedEvents, getEventTypes } from "@/lib/api";
import { eventTypesToLabelMap } from "@/lib/utils";
import { EventsListing } from "@/features/events/events-listing";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "All Events",
  description:
    "Browse upcoming AI bootcamps, masterclasses, founder talks, and Seek your Seniors sessions by Vedam School of Technology.",
};

interface EventsPageProps {
  searchParams: Promise<{
    filter?: string;
    type?: string;
    search?: string;
  }>;
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const params = await searchParams;

  const [allEvents, eventTypes] = await Promise.all([
    getPublishedEvents().catch(() => []),
    getEventTypes().catch(() => []),
  ]);
  const typeLabels = eventTypesToLabelMap(eventTypes);

  return (
    <div className="pt-24 pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Explore <span className="gradient-text">Events</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            AI bootcamps, masterclasses, founder talks, Seek your Seniors, and more.
            Find your next learning adventure.
          </p>
        </div>

        <Suspense fallback={<EventsListingSkeleton />}>
          <EventsListing
            events={allEvents}
            typeLabels={typeLabels}
            initialFilter={params.filter}
            initialType={params.type}
            initialSearch={params.search}
          />
        </Suspense>
      </div>
    </div>
  );
}

function EventsListingSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-80 rounded-2xl" />
      ))}
    </div>
  );
}
