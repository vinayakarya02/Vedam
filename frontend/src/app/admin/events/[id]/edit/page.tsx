import { notFound } from "next/navigation";
import { getAccessToken } from "@/lib/api-auth";
import { getEventByIdAdmin } from "@/lib/api";
import { EventForm } from "@/features/admin/event-form";

interface EditEventPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { id } = await params;
  const token = await getAccessToken();
  if (!token) notFound();

  const event = await getEventByIdAdmin(id, token);
  if (!event) notFound();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Edit Event</h1>
        <p className="text-muted-foreground text-sm">{event.title}</p>
      </div>
      <EventForm event={event} />
    </div>
  );
}
