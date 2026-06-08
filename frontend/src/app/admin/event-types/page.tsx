import { getAccessToken } from "@/lib/api-auth";
import { getApiUrl } from "@/lib/api";
import { EventTypesManagement } from "@/features/admin/event-types-management";
import type { EventType } from "@/types/database";

async function getEventTypesAdmin(token: string): Promise<EventType[]> {
  const res = await fetch(`${getApiUrl()}/api/admin/event-types`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.eventTypes || [];
}

export default async function AdminEventTypesPage() {
  const token = await getAccessToken();
  const eventTypes = token ? await getEventTypesAdmin(token) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Event Types</h1>
        <p className="text-muted-foreground text-sm">
          Manage categories used when creating events (Workshop, Hackathon, etc.)
        </p>
      </div>
      <EventTypesManagement initialTypes={eventTypes} />
    </div>
  );
}
