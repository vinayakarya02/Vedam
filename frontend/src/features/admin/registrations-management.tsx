"use client";

import { useState, useEffect } from "react";
import { Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Event, Registration, RegistrationStatus } from "@/types/database";
import { formatDate } from "@/lib/utils";
import { clientApiFetch } from "@/lib/api-client";

interface RegistrationsManagementProps {
  events: Event[];
}

export function RegistrationsManagement({ events }: RegistrationsManagementProps) {
  const [selectedEvent, setSelectedEvent] = useState(events[0]?.id || "");
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedEvent) return;
    setLoading(true);
    clientApiFetch(`/api/admin/registrations?eventId=${selectedEvent}`)
      .then((res) => res.json())
      .then((data) => setRegistrations(data.registrations || []))
      .catch(() => setRegistrations([]))
      .finally(() => setLoading(false));
  }, [selectedEvent]);

  const filtered = registrations.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.attendee_id.toLowerCase().includes(q)
    );
  });

  const updateStatus = async (id: string, status: RegistrationStatus) => {
    await clientApiFetch("/api/admin/registrations", {
      method: "PATCH",
      body: JSON.stringify({ id, status }),
    });
    setRegistrations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
  };

  const exportCSV = async () => {
    const res = await clientApiFetch(
      `/api/admin/registrations/export?eventId=${selectedEvent}`
    );
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `registrations-${selectedEvent}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={selectedEvent} onValueChange={setSelectedEvent}>
          <SelectTrigger className="max-w-xs">
            <SelectValue placeholder="Select event" />
          </SelectTrigger>
          <SelectContent>
            {events.map((e) => (
              <SelectItem key={e.id} value={e.id}>
                {e.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="registered">Registered</SelectItem>
            <SelectItem value="waitlisted">Waitlisted</SelectItem>
            <SelectItem value="attended">Attended</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={exportCSV} disabled={!selectedEvent}>
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-muted-foreground">
                  <th className="text-left p-4">Attendee</th>
                  <th className="text-left p-4">Contact</th>
                  <th className="text-left p-4">College</th>
                  <th className="text-left p-4">WhatsApp</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Registered</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((reg) => (
                  <tr
                    key={reg.id}
                    className="border-b border-white/5 hover:bg-white/[0.02]"
                  >
                    <td className="p-4">
                      <div className="font-medium">{reg.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {reg.attendee_id}
                      </div>
                    </td>
                    <td className="p-4">
                      <div>{reg.email}</div>
                      <div className="text-xs text-muted-foreground">
                        {reg.phone}
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {reg.college}
                      <div className="text-xs">{reg.role}</div>
                    </td>
                    <td className="p-4">
                      <Badge variant={reg.whatsapp_clicked ? "success" : "secondary"}>
                        {reg.whatsapp_clicked ? "Joined" : "Pending"}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Select
                        value={reg.status}
                        onValueChange={(v) =>
                          updateStatus(reg.id, v as RegistrationStatus)
                        }
                      >
                        <SelectTrigger className="w-32 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="registered">Registered</SelectItem>
                          <SelectItem value="waitlisted">Waitlisted</SelectItem>
                          <SelectItem value="attended">Attended</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-4 text-muted-foreground text-xs">
                      {formatDate(reg.created_at, {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="p-12 text-center text-muted-foreground">
                No registrations found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
