"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Edit,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  ExternalLink,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { Event } from "@/types/database";
import { formatDate } from "@/lib/utils";
import { clientApiFetch } from "@/lib/api-client";

interface EventsManagementProps {
  initialEvents: Event[];
}

export function EventsManagement({ initialEvents }: EventsManagementProps) {
  const [events, setEvents] = useState(initialEvents);
  const [search, setSearch] = useState("");
  const router = useRouter();

  const filtered = events.filter(
    (e) =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.slug.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    await clientApiFetch("/api/admin/events", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    });
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const handleDuplicate = async (id: string) => {
    const res = await clientApiFetch("/api/admin/events/duplicate", {
      method: "POST",
      body: JSON.stringify({ id }),
    });
    const { event } = await res.json();
    if (event) {
      setEvents((prev) => [event, ...prev]);
      router.push(`/admin/events/${event.id}/edit`);
    }
  };

  const toggleStatus = async (event: Event) => {
    const newStatus = event.status === "published" ? "draft" : "published";
    const res = await clientApiFetch("/api/admin/events", {
      method: "PUT",
      body: JSON.stringify({ id: event.id, status: newStatus }),
    });
    const { event: updated } = await res.json();
    if (updated) {
      setEvents((prev) =>
        prev.map((e) => (e.id === event.id ? updated : e))
      );
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Input
          placeholder="Search events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Button asChild className="sm:ml-auto">
          <Link href="/admin/events/new">
            <Plus className="h-4 w-4" />
            Create Event
          </Link>
        </Button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-muted-foreground">
                <th className="text-left p-4 font-medium">Event</th>
                <th className="text-left p-4 font-medium">Date</th>
                <th className="text-left p-4 font-medium">Registrations</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-right p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((event) => (
                <tr
                  key={event.id}
                  className="border-b border-white/5 hover:bg-white/[0.02]"
                >
                  <td className="p-4">
                    <div className="font-medium">{event.title}</div>
                    <div className="text-xs text-muted-foreground">
                      /{event.slug}
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {formatDate(event.start_date, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="p-4">
                    <span className="text-vedam-orange font-medium">
                      {event.registrations_count}
                    </span>
                    <span className="text-muted-foreground">
                      /{event.seats}
                    </span>
                  </td>
                  <td className="p-4">
                    <Badge
                      variant={
                        event.status === "published" ? "success" : "secondary"
                      }
                    >
                      {event.status}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-1">
                      {event.status === "published" && (
                        <Button variant="ghost" size="icon" asChild>
                          <Link
                            href={`/events/${event.slug}`}
                            target="_blank"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleStatus(event)}
                        title={event.status === "published" ? "Unpublish" : "Publish"}
                      >
                        {event.status === "published" ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/events/${event.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDuplicate(event.id)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(event.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-12 text-center text-muted-foreground">
            No events found
          </div>
        )}
      </div>
    </div>
  );
}
