"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Calendar,
  MessageCircle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate, formatTime } from "@/lib/utils";
import { getApiUrl } from "@/lib/api";

interface RegistrationData {
  attendee_id: string;
  name: string;
  email: string;
  phone: string;
  passout_year_12th: string | null;
  stream_12th: string | null;
  qr_code: string | null;
  status: string;
  created_at: string;
  events: {
    title: string;
    slug: string;
    start_date: string;
    venue: string | null;
    whatsapp_community_link: string | null;
    banner_url: string | null;
  };
}

export function RegistrationSuccess() {
  const searchParams = useSearchParams();
  const attendeeId = searchParams.get("attendee");
  const [data, setData] = useState<RegistrationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!attendeeId) {
      setLoading(false);
      return;
    }

    fetch(`${getApiUrl()}/api/registrations/${attendeeId}`)
      .then((res) => res.json())
      .then((result) => {
        if (result.data) setData(result.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [attendeeId]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="h-12 w-12 rounded-full border-2 border-vedam-orange border-t-transparent animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Loading your ticket...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center glass-card p-8">
        <h2 className="text-xl font-semibold mb-2">Registration Not Found</h2>
        <p className="text-muted-foreground mb-6">
          We couldn&apos;t find your registration. Please check your email.
        </p>
        <Button asChild>
          <Link href="/events">Browse Events</Link>
        </Button>
      </div>
    );
  }

  const event = data.events;
  const whatsappLink = event.whatsapp_community_link;

  const handleWhatsAppClick = () => {
    if (!whatsappLink) return;
    fetch(`${getApiUrl()}/api/analytics/whatsapp-click`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attendeeId: data.attendee_id }),
    }).catch(() => {});
    window.open(whatsappLink, "_blank");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-8 text-center"
    >
      <div className="flex justify-center mb-6">
        <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-green-400" />
        </div>
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold mb-2">Thank You!</h1>
      <p className="text-lg font-semibold text-vedam-orange mb-1">
        Registration Successful
      </p>
      <p className="text-muted-foreground mb-6">
        You&apos;re registered for <strong>{event.title}</strong>
      </p>

      <div className="glass rounded-xl p-4 mb-6 text-left space-y-3 text-sm">
        <p className="font-semibold text-foreground">
          Thank You for Registering!
        </p>
        <p className="text-muted-foreground">
          Your seat for <strong>{event.title}</strong> is confirmed.
        </p>
        <p className="text-muted-foreground">
          Join our WhatsApp Community to receive bootcamp updates, session
          reminders, resources, future event announcements, and valuable
          insights on B.Tech in CS (AI).
        </p>
        <p className="text-muted-foreground">See you at the bootcamp!</p>
      </div>

      <div className="glass rounded-xl p-4 mb-6 text-left space-y-2 text-sm">
        <h3 className="font-semibold text-vedam-orange text-xs uppercase tracking-wide mb-3">
          Your registration details
        </h3>
        <DetailRow label="Name" value={data.name} />
        <DetailRow label="Email" value={data.email} />
        <DetailRow label="Phone" value={data.phone} />
        <DetailRow
          label="12th passout year"
          value={data.passout_year_12th || "—"}
        />
        <DetailRow label="Stream of 12th" value={data.stream_12th || "—"} />
        <DetailRow
          label="Registered on"
          value={`${formatDate(data.created_at, {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
          })} at ${formatTime(data.created_at)}`}
        />
        <DetailRow label="Attendee ID" value={data.attendee_id} mono />
        <DetailRow label="Status" value={data.status} highlight />
      </div>

      <div className="space-y-3">
        {whatsappLink && (
          <Button className="w-full" size="lg" onClick={handleWhatsAppClick}>
            <MessageCircle className="h-5 w-5" />
            Join WhatsApp Community
            <ExternalLink className="h-4 w-4 ml-1" />
          </Button>
        )}

        <Button variant="outline" className="w-full" asChild>
          <a
            href={`${getApiUrl()}/api/calendar?attendee=${data.attendee_id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Calendar className="h-4 w-4" />
            Add to Calendar
          </a>
        </Button>

        <Button variant="ghost" className="w-full" asChild>
          <Link href={`/events/${event.slug}`}>View Event Page</Link>
        </Button>
      </div>
    </motion.div>
  );
}

function DetailRow({
  label,
  value,
  mono,
  highlight,
}: {
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span
        className={`text-right ${mono ? "font-mono text-vedam-orange text-xs" : ""} ${highlight ? "capitalize text-green-400" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
