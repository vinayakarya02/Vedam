"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Event } from "@/types/database";
import {
  formatDate,
  getSeatsLeft,
  getEventTypeLabel,
  getModeLabel,
} from "@/lib/utils";

interface EventCardProps {
  event: Event;
  index?: number;
}

export function EventCard({ event, index = 0 }: EventCardProps) {
  const seatsLeft = getSeatsLeft(event.seats, event.registrations_count);
  const isFull = seatsLeft === 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group glass-card overflow-hidden hover:border-white/20 transition-all duration-300"
    >
      <div className="relative h-48 overflow-hidden">
        {event.banner_url ? (
          <Image
            src={event.banner_url}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-vedam-orange/30 to-vedam-purple/30" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute top-4 left-4 flex gap-2">
          <Badge variant="default">{getEventTypeLabel(event.event_type)}</Badge>
          {event.is_featured && <Badge variant="purple">Featured</Badge>}
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-vedam-orange transition-colors">
          {event.title}
        </h3>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 shrink-0" />
            {formatDate(event.start_date, {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            {getModeLabel(event.mode)}
            {event.venue && ` · ${event.venue}`}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4 shrink-0" />
            {isFull ? (
              <span className="text-yellow-400">Waitlist open</span>
            ) : (
              <span>{seatsLeft} seats left</span>
            )}
          </div>
        </div>

        <Button className="w-full" asChild>
          <Link href={`/events/${event.slug}`}>
            {isFull ? "Join Waitlist" : "Register Now"}
          </Link>
        </Button>
      </div>
    </motion.article>
  );
}
