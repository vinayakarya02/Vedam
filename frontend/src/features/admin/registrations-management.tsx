"use client";

import { useMemo, useState, useEffect } from "react";
import { Download, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RegistrationColumnFilter,
  BLANK_FILTER_VALUE,
} from "@/features/admin/registration-column-filter";
import type { Event, Registration, RegistrationStatus } from "@/types/database";
import { formatDate, formatTime } from "@/lib/utils";
import { clientApiFetch } from "@/lib/api-client";

interface RegistrationsManagementProps {
  events: Event[];
}

type ColumnKey =
  | "name"
  | "email"
  | "phone"
  | "passout_year_12th"
  | "stream_12th"
  | "registered"
  | "utm"
  | "status";

interface ColumnDef {
  key: ColumnKey;
  label: string;
  getValue: (r: Registration) => string;
}

const COLUMNS: ColumnDef[] = [
  { key: "name", label: "Name", getValue: (r) => r.name },
  { key: "email", label: "Email", getValue: (r) => r.email },
  { key: "phone", label: "Phone", getValue: (r) => r.phone },
  {
    key: "passout_year_12th",
    label: "12th Passout",
    getValue: (r) => r.passout_year_12th || "",
  },
  {
    key: "stream_12th",
    label: "12th Stream",
    getValue: (r) => r.stream_12th || "",
  },
  {
    key: "registered",
    label: "Registered",
    getValue: (r) =>
      `${formatDate(r.created_at, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })} ${formatTime(r.created_at)}`,
  },
  {
    key: "utm",
    label: "UTM",
    getValue: (r) =>
      [r.utm_source, r.utm_medium, r.utm_campaign, r.utm_content]
        .filter(Boolean)
        .join(" / "),
  },
  {
    key: "status",
    label: "Status",
    getValue: (r) => r.status,
  },
];

function normalizeFilterValue(value: string): string {
  const trimmed = value.trim();
  return trimmed || BLANK_FILTER_VALUE;
}

function getUniqueColumnValues(
  registrations: Registration[],
  getValue: (r: Registration) => string
): string[] {
  const set = new Set<string>();
  for (const r of registrations) {
    set.add(normalizeFilterValue(getValue(r)));
  }
  return [...set];
}

function matchesColumnFilters(
  reg: Registration,
  filters: Partial<Record<ColumnKey, Set<string> | null>>,
  columns: ColumnDef[]
): boolean {
  for (const col of columns) {
    const selected = filters[col.key];
    if (selected === null || selected === undefined) continue;
    if (selected.size === 0) return false;
    const cell = normalizeFilterValue(col.getValue(reg));
    if (!selected.has(cell)) return false;
  }
  return true;
}

export function RegistrationsManagement({ events }: RegistrationsManagementProps) {
  const [selectedEvent, setSelectedEvent] = useState(events[0]?.id || "");
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [search, setSearch] = useState("");
  const [columnFilters, setColumnFilters] = useState<
    Partial<Record<ColumnKey, Set<string> | null>>
  >({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedEvent) return;
    setLoading(true);
    setColumnFilters({});
    clientApiFetch(`/api/admin/registrations?eventId=${selectedEvent}`)
      .then((res) => res.json())
      .then((data) => setRegistrations(data.registrations || []))
      .catch(() => setRegistrations([]))
      .finally(() => setLoading(false));
  }, [selectedEvent]);

  const uniqueByColumn = useMemo(() => {
    const map: Partial<Record<ColumnKey, string[]>> = {};
    for (const col of COLUMNS) {
      map[col.key] = getUniqueColumnValues(registrations, col.getValue);
    }
    return map;
  }, [registrations]);

  const activeFilterCount = useMemo(
    () =>
      COLUMNS.filter((col) => {
        const selected = columnFilters[col.key];
        const all = uniqueByColumn[col.key]?.length ?? 0;
        return (
          selected !== null &&
          selected !== undefined &&
          selected.size > 0 &&
          selected.size < all
        );
      }).length,
    [columnFilters, uniqueByColumn]
  );

  const filtered = useMemo(() => {
    return registrations.filter((r) => {
      if (!matchesColumnFilters(r, columnFilters, COLUMNS)) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return COLUMNS.some((col) =>
        col.getValue(r).toLowerCase().includes(q)
      );
    });
  }, [registrations, columnFilters, search]);

  const setColumnFilter = (key: ColumnKey, selected: Set<string> | null) => {
    setColumnFilters((prev) => ({ ...prev, [key]: selected }));
  };

  const clearAllFilters = () => {
    setColumnFilters({});
    setSearch("");
  };

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

  const renderCell = (reg: Registration, key: ColumnKey) => {
    switch (key) {
      case "name":
        return <span className="font-medium">{reg.name}</span>;
      case "email":
        return <span className="text-muted-foreground">{reg.email}</span>;
      case "phone":
        return reg.phone;
      case "passout_year_12th":
        return reg.passout_year_12th || "—";
      case "stream_12th":
        return reg.stream_12th || "—";
      case "registered":
        return (
          <span className="text-muted-foreground text-xs whitespace-nowrap">
            {formatDate(reg.created_at, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
            <br />
            {formatTime(reg.created_at)}
          </span>
        );
      case "utm":
        return (
          <span className="text-xs text-muted-foreground">
            {reg.utm_source && (
              <div>
                {reg.utm_source} / {reg.utm_medium}
              </div>
            )}
            {reg.utm_campaign && (
              <div className="truncate max-w-[120px]">{reg.utm_campaign}</div>
            )}
            {reg.utm_content && (
              <div className="font-mono text-[10px]">{reg.utm_content}</div>
            )}
            {!reg.utm_source && !reg.utm_campaign && "—"}
          </span>
        );
      case "status":
        return (
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
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
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

        <div className="relative flex-1 max-w-sm min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search all columns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {(activeFilterCount > 0 || search) && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            className="gap-1"
          >
            <X className="h-3.5 w-3.5" />
            Clear filters
            {activeFilterCount > 0 && ` (${activeFilterCount})`}
          </Button>
        )}

        <Button variant="outline" onClick={exportCSV} disabled={!selectedEvent}>
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Showing {filtered.length} of {registrations.length} registrations
        {activeFilterCount > 0
          ? ` · ${activeFilterCount} column filter${activeFilterCount > 1 ? "s" : ""} active`
          : ""}
      </p>

      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="border-b border-white/5 text-muted-foreground">
                  {COLUMNS.map((col) => (
                    <th key={col.key} className="text-left p-4 font-medium">
                      <div className="flex items-center gap-1.5">
                        <span>{col.label}</span>
                        <RegistrationColumnFilter
                          label={col.label}
                          values={uniqueByColumn[col.key] || []}
                          selected={columnFilters[col.key] ?? null}
                          onChange={(selected) =>
                            setColumnFilter(col.key, selected)
                          }
                        />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((reg) => (
                  <tr
                    key={reg.id}
                    className="border-b border-white/5 hover:bg-white/[0.02]"
                  >
                    {COLUMNS.map((col) => (
                      <td key={col.key} className="p-4">
                        {renderCell(reg, col.key)}
                      </td>
                    ))}
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
