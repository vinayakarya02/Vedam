"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Download,
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
  qr_code: string;
  status: string;
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

      <h1 className="text-2xl font-bold mb-2">Registration Successful!</h1>
      <p className="text-muted-foreground mb-6">
        You&apos;re registered for <strong>{event.title}</strong>
      </p>

      <div className="glass rounded-xl p-4 mb-6 text-left space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Attendee ID</span>
          <span className="font-mono text-vedam-orange">{data.attendee_id}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Date</span>
          <span>{formatDate(event.start_date)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Time</span>
          <span>{formatTime(event.start_date)}</span>
        </div>
        {event.venue && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Venue</span>
            <span>{event.venue}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-muted-foreground">Status</span>
          <span className="capitalize text-green-400">{data.status}</span>
        </div>
      </div>

      {data.qr_code && (
        <div className="mb-6">
          <Image
            src={data.qr_code}
            alt="QR Ticket"
            width={200}
            height={200}
            className="mx-auto rounded-xl"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Show this QR at check-in
          </p>
        </div>
      )}

      <div className="space-y-3">
        {whatsappLink && (
          <Button className="w-full" size="lg" onClick={handleWhatsAppClick}>
            <MessageCircle className="h-5 w-5" />
            Join WhatsApp Community
            <ExternalLink className="h-4 w-4 ml-1" />
          </Button>
        )}

        {data.qr_code && (
          <Button variant="outline" className="w-full" asChild>
            <a href={data.qr_code} download={`ticket-${data.attendee_id}.png`}>
              <Download className="h-4 w-4" />
              Download Ticket
            </a>
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
