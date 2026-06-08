"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
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
import type { Event, RegistrationFormField } from "@/types/database";
import { getApiUrl } from "@/lib/api";
import { getEventFormFields } from "@/lib/registration-fields";
import { getUtmFromSearchParams } from "@/lib/utm";

interface RegistrationFormProps {
  event: Event;
}

export function RegistrationForm({ event }: RegistrationFormProps) {
  const searchParams = useSearchParams();
  const utmFromUrl = useMemo(
    () => getUtmFromSearchParams(searchParams),
    [searchParams]
  );

  const fields = useMemo(
    () => getEventFormFields(event.registration_form_fields),
    [event.registration_form_fields]
  );

  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const f of fields) initial[f.id] = "";
    return initial;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setAnswer = (id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const validateClient = (): boolean => {
    const next: Record<string, string> = {};
    for (const field of fields) {
      const value = (answers[field.id] ?? "").trim();
      if (field.required && !value) {
        next[field.id] = `${field.label} is required`;
        continue;
      }
      if (!value) continue;
      if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        next[field.id] = "Please enter a valid email";
      }
      if (field.type === "phone" && !/^[+]?[\d\s-]{10,}$/.test(value)) {
        next[field.id] = "Please enter a valid phone number";
      }
      if (field.type === "url" && !/^https?:\/\/.+/.test(value)) {
        next[field.id] = "Please enter a valid URL";
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateClient()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${getApiUrl()}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          eventSlug: event.slug,
          answers,
          utm: utmFromUrl,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Registration failed");
      }

      // Always land on the Thank You screen first. The success screen shows the
      // "Join WhatsApp Community" button (opens in a new tab), so the user can
      // join and press Back to return here — matching the intended flow.
      window.location.href = `/register/success?attendee=${result.attendeeId}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <div className="relative mb-6">
          <div className="h-16 w-16 rounded-full bg-gradient-to-r from-vedam-orange to-vedam-purple animate-pulse" />
          <Loader2 className="absolute inset-0 m-auto h-8 w-8 animate-spin text-white" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Registration Successful!</h3>
        <p className="text-muted-foreground">
          Taking you to your confirmation...
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {fields.map((field) => (
          <FieldInput
            key={field.id}
            field={field}
            value={answers[field.id] ?? ""}
            error={errors[field.id]}
            onChange={(v) => setAnswer(field.id, v)}
            fullWidth={field.type === "textarea"}
          />
        ))}
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        Register & Join Community
      </Button>

      {event.whatsapp_community_link && (
        <p className="text-xs text-center text-muted-foreground">
          After registration, you&apos;ll be redirected to join our WhatsApp community
        </p>
      )}
    </form>
  );
}

function FieldInput({
  field,
  value,
  error,
  onChange,
  fullWidth,
}: {
  field: RegistrationFormField;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  fullWidth?: boolean;
}) {
  const className = fullWidth ? "sm:col-span-2" : "";

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={field.id}>
        {field.label}
        {field.required ? " *" : ""}
      </Label>
      {field.type === "textarea" ? (
        <Textarea
          id={field.id}
          placeholder={field.placeholder}
          rows={4}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : field.type === "select" ? (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger id={field.id}>
            <SelectValue placeholder={field.placeholder || "Select..."} />
          </SelectTrigger>
          <SelectContent>
            {(field.options || []).map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          id={field.id}
          type={
            field.type === "email"
              ? "email"
              : field.type === "number"
                ? "number"
                : field.type === "phone"
                  ? "tel"
                  : "text"
          }
          placeholder={field.placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
