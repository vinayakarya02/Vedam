"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/events/event-card";
import type { Event } from "@/types/database";
import { isEventPast } from "@/lib/utils";

interface EventsListingProps {
  events: Event[];
  initialFilter?: string;
  initialType?: string;
  initialSearch?: string;
}

const filters = [
  { id: "all", label: "All Events" },
  { id: "upcoming", label: "Upcoming" },
  { id: "past", label: "Past" },
  { id: "featured", label: "Featured" },
];

export function EventsListing({
  events,
  initialFilter = "all",
  initialType,
  initialSearch = "",
}: EventsListingProps) {
  const [filter, setFilter] = useState(initialFilter);
  const [search, setSearch] = useState(initialSearch);
  const [typeFilter, setTypeFilter] = useState(initialType || "");

  const filtered = useMemo(() => {
    return events.filter((event) => {
      const isPast = isEventPast(event.end_date, event.start_date);

      if (filter === "upcoming" && isPast) return false;
      if (filter === "past" && !isPast) return false;
      if (filter === "featured" && !event.is_featured) return false;
      if (typeFilter && event.event_type !== typeFilter) return false;

      if (search) {
        const q = search.toLowerCase();
        return (
          event.title.toLowerCase().includes(q) ||
          event.subtitle?.toLowerCase().includes(q) ||
          event.description?.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [events, filter, search, typeFilter]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <Button
              key={f.id}
              variant={filter === f.id ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      {typeFilter && (
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={() => setTypeFilter("")}>
            Clear type filter: {typeFilter}
          </Button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg">No events found</p>
          <p className="text-sm mt-2">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((event, i) => (
            <EventCard key={event.id} event={event} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
