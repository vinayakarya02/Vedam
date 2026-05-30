"use client";

import { useState } from "react";
import {
  GripVertical,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PageSection } from "@/types/database";

const SECTION_TYPES = [
  { type: "hero", label: "Hero" },
  { type: "about", label: "About" },
  { type: "speakers", label: "Speakers" },
  { type: "schedule", label: "Schedule" },
  { type: "who_should_attend", label: "Who Should Attend" },
  { type: "faq", label: "FAQ" },
  { type: "testimonials", label: "Testimonials" },
  { type: "registration", label: "Registration" },
  { type: "sponsors", label: "Sponsors" },
  { type: "gallery", label: "Gallery" },
] as const;

interface PageBuilderProps {
  sections: PageSection[];
  onChange: (sections: PageSection[]) => void;
}

export function PageBuilder({ sections, onChange }: PageBuilderProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const sorted = [...sections].sort((a, b) => a.order - b.order);

  const moveSection = (index: number, direction: "up" | "down") => {
    const newSections = [...sorted];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSections.length) return;

    [newSections[index], newSections[targetIndex]] = [
      newSections[targetIndex],
      newSections[index],
    ];

    onChange(
      newSections.map((s, i) => ({ ...s, order: i }))
    );
  };

  const toggleSection = (id: string) => {
    onChange(
      sections.map((s) =>
        s.id === id ? { ...s, enabled: !s.enabled } : s
      )
    );
  };

  const addSection = (type: string) => {
    const newSection: PageSection = {
      id: `${type}-${Date.now()}`,
      type: type as PageSection["type"],
      enabled: true,
      order: sections.length,
    };
    onChange([...sections, newSection]);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newSections = [...sorted];
    const dragged = newSections[draggedIndex];
    newSections.splice(draggedIndex, 1);
    newSections.splice(index, 0, dragged);

    onChange(newSections.map((s, i) => ({ ...s, order: i })));
    setDraggedIndex(index);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Drag to reorder sections. Toggle visibility with the eye icon.
        The page renders sections dynamically — no code changes needed.
      </p>

      <div className="space-y-2">
        {sorted.map((section, index) => {
          const typeInfo = SECTION_TYPES.find((t) => t.type === section.type);
          return (
            <div
              key={section.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={() => setDraggedIndex(null)}
              className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-grab active:cursor-grabbing ${
                section.enabled
                  ? "border-white/10 bg-white/[0.02]"
                  : "border-white/5 bg-white/[0.01] opacity-50"
              } ${draggedIndex === index ? "border-vedam-orange/50" : ""}`}
            >
              <GripVertical className="h-5 w-5 text-muted-foreground shrink-0" />
              <div className="flex-1">
                <div className="font-medium text-sm">
                  {typeInfo?.label || section.type}
                </div>
                <div className="text-xs text-muted-foreground">
                  Order: {index + 1}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => moveSection(index, "up")}
                  disabled={index === 0}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => moveSection(index, "down")}
                  disabled={index === sorted.length - 1}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleSection(section.id)}
                >
                  {section.enabled ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-4 border-t border-white/5">
        <p className="text-sm font-medium mb-3">Add Section</p>
        <div className="flex flex-wrap gap-2">
          {SECTION_TYPES.map((type) => (
            <Button
              key={type.type}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addSection(type.type)}
            >
              + {type.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
