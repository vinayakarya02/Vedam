"use client";

import { Plus, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { RegistrationFormField } from "@/types/database";
import {
  createEmptyFormField,
  DEFAULT_REGISTRATION_FORM_FIELDS,
  FORM_FIELD_TYPES,
} from "@/lib/registration-fields";

interface RegistrationFormBuilderProps {
  fields: RegistrationFormField[];
  onChange: (fields: RegistrationFormField[]) => void;
}

const CORE_FIELD_KEYS = new Set([
  "name",
  "email",
  "phone",
  "passout_year_12th",
  "stream_12th",
]);

export function RegistrationFormBuilder({
  fields,
  onChange,
}: RegistrationFormBuilderProps) {
  const updateField = (index: number, patch: Partial<RegistrationFormField>) => {
    onChange(
      fields.map((f, i) => (i === index ? { ...f, ...patch } : f))
    );
  };

  const removeField = (index: number) => {
    const field = fields[index];
    if (field.fieldKey && CORE_FIELD_KEYS.has(field.fieldKey)) return;
    onChange(fields.filter((_, i) => i !== index));
  };

  const addField = () => {
    onChange([...fields, createEmptyFormField(fields.length)]);
  };

  const resetToDefault = () => {
    onChange([...DEFAULT_REGISTRATION_FORM_FIELDS]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="font-semibold">Registration questions</h3>
          <p className="text-sm text-muted-foreground">
            Customize what attendees answer when registering. Name, email, and
            phone are always required.
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={resetToDefault}>
            Reset to default
          </Button>
          <Button type="button" size="sm" onClick={addField}>
            <Plus className="h-4 w-4" />
            Add question
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => {
          const isCore = field.fieldKey && CORE_FIELD_KEYS.has(field.fieldKey);
          return (
            <div
              key={field.id}
              className="glass-card p-4 space-y-4 border border-white/5"
            >
              <div className="flex items-start gap-3">
                <GripVertical className="h-5 w-5 text-muted-foreground mt-2 shrink-0" />
                <div className="flex-1 grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label>Question label *</Label>
                    <Input
                      value={field.label}
                      onChange={(e) =>
                        updateField(index, { label: e.target.value })
                      }
                      placeholder="e.g. Years of experience"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Answer type</Label>
                    <Select
                      value={field.type}
                      onValueChange={(v) =>
                        updateField(index, {
                          type: v as RegistrationFormField["type"],
                        })
                      }
                      disabled={isCore}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FORM_FIELD_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Placeholder</Label>
                    <Input
                      value={field.placeholder || ""}
                      onChange={(e) =>
                        updateField(index, { placeholder: e.target.value })
                      }
                    />
                  </div>
                  {field.type === "select" && (
                    <div className="space-y-2 md:col-span-2">
                      <Label>Options (one per line)</Label>
                      <Textarea
                        value={(field.options || []).join("\n")}
                        onChange={(e) =>
                          updateField(index, {
                            options: e.target.value
                              .split("\n")
                              .map((s) => s.trim())
                              .filter(Boolean),
                          })
                        }
                        rows={3}
                        placeholder="Option 1&#10;Option 2"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-2 md:col-span-2">
                    <input
                      type="checkbox"
                      id={`required-${field.id}`}
                      checked={field.required}
                      onChange={(e) =>
                        updateField(index, { required: e.target.checked })
                      }
                      disabled={isCore}
                      className="rounded"
                    />
                    <Label htmlFor={`required-${field.id}`}>Required</Label>
                    {isCore && (
                      <span className="text-xs text-muted-foreground">
                        (core field)
                      </span>
                    )}
                  </div>
                </div>
                {!isCore && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive shrink-0"
                    onClick={() => removeField(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
