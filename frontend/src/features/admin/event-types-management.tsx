"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { EventType } from "@/types/database";
import { slugify } from "@/lib/utils";
import { clientApiFetch } from "@/lib/api-client";

interface EventTypesManagementProps {
  initialTypes: EventType[];
}

export function EventTypesManagement({
  initialTypes,
}: EventTypesManagementProps) {
  const [types, setTypes] = useState(initialTypes);
  const [editing, setEditing] = useState<EventType | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    label: "",
    slug: "",
    description: "",
    sort_order: 0,
    is_active: true,
  });

  const openCreate = () => {
    setEditing(null);
    setForm({
      label: "",
      slug: "",
      description: "",
      sort_order: types.length + 1,
      is_active: true,
    });
    setShowForm(true);
  };

  const openEdit = (type: EventType) => {
    setEditing(type);
    setForm({
      label: type.label,
      slug: type.slug,
      description: type.description || "",
      sort_order: type.sort_order,
      is_active: type.is_active,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = {
        label: form.label.trim(),
        slug: form.slug.trim() || slugify(form.label),
        description: form.description.trim() || null,
        sort_order: Number(form.sort_order),
        is_active: form.is_active,
      };

      const res = await clientApiFetch("/api/admin/event-types", {
        method: editing ? "PUT" : "POST",
        body: JSON.stringify(editing ? { id: editing.id, ...payload } : payload),
      });

      if (!res.ok) throw new Error("Failed to save");

      const data = await res.json();
      if (editing) {
        setTypes((prev) =>
          prev.map((t) => (t.id === editing.id ? data.eventType : t))
        );
      } else {
        setTypes((prev) => [...prev, data.eventType]);
      }
      closeForm();
    } catch {
      alert("Could not save event type");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this event type? Events using it will keep the slug.")) return;
    const res = await clientApiFetch("/api/admin/event-types", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    });
    if (res.ok) setTypes((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add event type
        </Button>
      </div>

      {showForm && (
        <div className="glass-card p-6 space-y-4 border border-vedam-orange/20">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">
              {editing ? "Edit event type" : "New event type"}
            </h3>
            <Button type="button" variant="ghost" size="icon" onClick={closeForm}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Display name *</Label>
              <Input
                value={form.label}
                onChange={(e) => {
                  const label = e.target.value;
                  setForm((f) => ({
                    ...f,
                    label,
                    slug: editing ? f.slug : slugify(label),
                  }));
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Slug *</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Sort order</Label>
              <Input
                type="number"
                value={form.sort_order}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))
                }
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="type-active"
                checked={form.is_active}
                onChange={(e) =>
                  setForm((f) => ({ ...f, is_active: e.target.checked }))
                }
                className="rounded"
              />
              <Label htmlFor="type-active">Active</Label>
            </div>
          </div>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save event type"}
          </Button>
        </div>
      )}

      <div className="glass-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-muted-foreground">
              <th className="text-left p-4">Label</th>
              <th className="text-left p-4">Slug</th>
              <th className="text-left p-4">Order</th>
              <th className="text-left p-4">Status</th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {types.map((type) => (
              <tr
                key={type.id}
                className="border-b border-white/5 hover:bg-white/[0.02]"
              >
                <td className="p-4 font-medium">{type.label}</td>
                <td className="p-4 text-muted-foreground font-mono text-xs">
                  {type.slug}
                </td>
                <td className="p-4">{type.sort_order}</td>
                <td className="p-4">
                  <Badge variant={type.is_active ? "success" : "secondary"}>
                    {type.is_active ? "Active" : "Hidden"}
                  </Badge>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(type)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => handleDelete(type.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {types.length === 0 && !showForm && (
          <div className="p-12 text-center text-muted-foreground">
            No event types yet. Add one to use when creating events.
          </div>
        )}
      </div>
    </div>
  );
}
