"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Event } from "@/types/database";
import { getApiUrl } from "@/lib/api";

const registrationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z
    .string()
    .min(10, "Please enter a valid phone number")
    .regex(/^[+]?[\d\s-]{10,}$/, "Invalid phone number"),
  college: z.string().min(2, "Please enter your college or company"),
  role: z.string().min(1, "Please enter your year or role"),
  linkedin: z
    .string()
    .refine(
      (val) => !val || /^https?:\/\/.+/.test(val),
      "Please enter a valid LinkedIn URL"
    )
    .optional(),
  city: z.string().min(2, "Please enter your city"),
  reason: z.string().min(10, "Please tell us why you want to attend (min 10 chars)"),
});

type RegistrationFormValues = z.infer<typeof registrationSchema>;

interface RegistrationFormProps {
  event: Event;
}

export function RegistrationForm({ event }: RegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
  });

  const onSubmit = async (data: RegistrationFormValues) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${getApiUrl()}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          eventSlug: event.slug,
          ...data,
          linkedin: data.linkedin || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Registration failed");
      }

      // Show success loader briefly, then redirect to WhatsApp
      if (result.whatsappLink) {
        // Track WhatsApp click
        fetch(`${getApiUrl()}/api/analytics/whatsapp-click`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ registrationId: result.registrationId }),
        }).catch(() => {});

        // Redirect to WhatsApp community
        setTimeout(() => {
          window.location.href = result.whatsappLink;
        }, 1500);

        // Fallback redirect to success page if WhatsApp doesn't open
        setTimeout(() => {
          window.location.href = `/register/success?attendee=${result.attendeeId}`;
        }, 5000);
      } else {
        window.location.href = `/register/success?attendee=${result.attendeeId}`;
      }
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
          {event.whatsapp_community_link
            ? "Redirecting you to join the WhatsApp community..."
            : "Preparing your ticket..."}
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input id="name" placeholder="John Doe" {...register("name")} />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input id="phone" placeholder="+91 98765 43210" {...register("phone")} />
          {errors.phone && (
            <p className="text-xs text-destructive">{errors.phone.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">City *</Label>
          <Input id="city" placeholder="Hyderabad" {...register("city")} />
          {errors.city && (
            <p className="text-xs text-destructive">{errors.city.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="college">College / Company *</Label>
          <Input
            id="college"
            placeholder="Vedam School of Technology"
            {...register("college")}
          />
          {errors.college && (
            <p className="text-xs text-destructive">{errors.college.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Current Year / Role *</Label>
          <Input id="role" placeholder="2nd Year B.Tech" {...register("role")} />
          {errors.role && (
            <p className="text-xs text-destructive">{errors.role.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="linkedin">LinkedIn Profile</Label>
        <Input
          id="linkedin"
          placeholder="https://linkedin.com/in/johndoe"
          {...register("linkedin")}
        />
        {errors.linkedin && (
          <p className="text-xs text-destructive">{errors.linkedin.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason">Why do you want to attend? *</Label>
        <Textarea
          id="reason"
          placeholder="Tell us about your goals and what you hope to learn..."
          rows={4}
          {...register("reason")}
        />
        {errors.reason && (
          <p className="text-xs text-destructive">{errors.reason.message}</p>
        )}
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
