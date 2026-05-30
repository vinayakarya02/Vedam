import { getAccessToken } from "@/lib/api-auth";
import { getAllEventsAdmin } from "@/lib/api";
import { RegistrationsManagement } from "@/features/admin/registrations-management";

export default async function AdminRegistrationsPage() {
  const token = await getAccessToken();
  const events = token ? await getAllEventsAdmin(token) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Registrations</h1>
        <p className="text-muted-foreground text-sm">
          View, search, and manage event registrations
        </p>
      </div>
      <RegistrationsManagement events={events} />
    </div>
  );
}
