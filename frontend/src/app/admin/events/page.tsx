import Link from "next/link";
import { Plus } from "lucide-react";
import { getAccessToken } from "@/lib/api-auth";
import { getAllEventsAdmin } from "@/lib/api";
import { EventsManagement } from "@/features/admin/events-management";
import { Button } from "@/components/ui/button";

export default async function AdminEventsPage() {
  const token = await getAccessToken();
  const events = token ? await getAllEventsAdmin(token) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Events</h1>
          <p className="text-muted-foreground text-sm">
            Manage all your events
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/events/new">
            <Plus className="h-4 w-4" />
            Create Event
          </Link>
        </Button>
      </div>
      <EventsManagement initialEvents={events} />
    </div>
  );
}
