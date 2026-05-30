import { EventForm } from "@/features/admin/event-form";

export default function NewEventPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Create Event</h1>
        <p className="text-muted-foreground text-sm">
          Set up a new event with custom page builder
        </p>
      </div>
      <EventForm />
    </div>
  );
}
