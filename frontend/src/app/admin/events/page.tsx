import { getAccessToken } from "@/lib/api-auth";
import { getAllEventsAdmin } from "@/lib/api";
import { EventsManagement } from "@/features/admin/events-management";

export default async function AdminEventsPage() {
  const token = await getAccessToken();
  const events = token ? await getAllEventsAdmin(token) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Events</h1>
          <p className="text-muted-foreground text-sm">
            Manage all your events
          </p>
        </div>
      </div>
      <EventsManagement initialEvents={events} />
    </div>
  );
}
