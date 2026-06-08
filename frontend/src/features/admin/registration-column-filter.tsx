"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const BLANK_FILTER_VALUE = "(Blanks)";

interface RegistrationColumnFilterProps {
  label: string;
  values: string[];
  selected: Set<string> | null;
  onChange: (selected: Set<string> | null) => void;
}

export function RegistrationColumnFilter({
  label,
  values,
  selected,
  onChange,
}: RegistrationColumnFilterProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<Set<string>>(new Set());
  const panelRef = useRef<HTMLDivElement>(null);

  const sortedValues = useMemo(
    () => [...values].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" })),
    [values]
  );

  const isActive =
    selected !== null && selected.size > 0 && selected.size < sortedValues.length;

  useEffect(() => {
    if (!open) return;
    setDraft(
      selected === null ? new Set(sortedValues) : new Set(selected)
    );
    setSearch("");
  }, [open, selected, sortedValues]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const visibleValues = sortedValues.filter((v) =>
    v.toLowerCase().includes(search.toLowerCase())
  );

  const allVisibleSelected =
    visibleValues.length > 0 &&
    visibleValues.every((v) => draft.has(v));

  const toggleValue = (value: string) => {
    setDraft((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  const toggleAllVisible = () => {
    setDraft((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        visibleValues.forEach((v) => next.delete(v));
      } else {
        visibleValues.forEach((v) => next.add(v));
      }
      return next;
    });
  };

  const apply = () => {
    if (draft.size === 0) {
      onChange(new Set());
    } else if (draft.size >= sortedValues.length) {
      onChange(null);
    } else {
      onChange(new Set(draft));
    }
    setOpen(false);
  };

  const clear = () => {
    onChange(null);
    setOpen(false);
  };

  return (
    <div className="relative inline-flex" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "p-1 rounded hover:bg-white/10 transition-colors",
          isActive ? "text-vedam-orange" : "text-muted-foreground"
        )}
        title={`Filter ${label}`}
        aria-label={`Filter ${label}`}
      >
        <Filter className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-56 rounded-lg border border-white/10 bg-[hsl(0,0%,8%)] shadow-xl">
          <div className="p-2 border-b border-white/5">
            <p className="text-xs font-medium text-foreground mb-2">{label}</p>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search values..."
                className="h-8 pl-7 text-xs"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 px-3 py-2 text-xs border-b border-white/5 cursor-pointer hover:bg-white/5">
            <input
              type="checkbox"
              checked={allVisibleSelected}
              onChange={toggleAllVisible}
              className="rounded"
            />
            <span>Select all</span>
          </label>

          <div className="max-h-48 overflow-y-auto py-1">
            {visibleValues.length === 0 ? (
              <p className="px-3 py-2 text-xs text-muted-foreground">No values</p>
            ) : (
              visibleValues.map((value) => (
                <label
                  key={value}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs cursor-pointer hover:bg-white/5"
                >
                  <input
                    type="checkbox"
                    checked={draft.has(value)}
                    onChange={() => toggleValue(value)}
                    className="rounded shrink-0"
                  />
                  <span className="truncate" title={value}>
                    {value}
                  </span>
                </label>
              ))
            )}
          </div>

          <div className="flex gap-2 p-2 border-t border-white/5">
            <Button type="button" size="sm" className="flex-1 h-7 text-xs" onClick={apply}>
              OK
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={clear}
            >
              Clear
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
