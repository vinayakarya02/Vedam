import { getPublishedEvents } from "@/lib/api";
import { HomepageSections } from "@/features/home/homepage-sections";

export default async function HomePage() {
  const [upcomingEvents, featuredEvents, pastEvents] = await Promise.all([
    getPublishedEvents({ upcoming: true }).catch(() => []),
    getPublishedEvents({ featured: true }).catch(() => []),
    getPublishedEvents({ past: true }).catch(() => []),
  ]);

  const highlightEvent = upcomingEvents[0];

  return (
    <HomepageSections
      upcomingEvents={upcomingEvents}
      featuredEvents={featuredEvents}
      pastEvents={pastEvents}
      highlightEvent={highlightEvent}
    />
  );
}
