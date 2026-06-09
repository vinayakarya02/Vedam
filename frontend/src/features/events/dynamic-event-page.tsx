"use client";

import { Suspense } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Linkedin,
  CheckCircle,
  GraduationCap,
  Gift,
  Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RegistrationForm } from "@/components/events/registration-form";
import { SectionHeading } from "@/components/shared/section-heading";
import type { Event, PageSection } from "@/types/database";
import {
  formatDate,
  formatTime,
  formatDuration,
  getSeatsLeft,
  getEventTypeLabel,
  getModeLabel,
} from "@/lib/utils";

interface DynamicEventPageProps {
  event: Event;
  typeLabels?: Record<string, string>;
}

const DEFAULT_SECTIONS: PageSection[] = [
  { id: "hero", type: "hero", enabled: true, order: 0 },
  { id: "about", type: "about", enabled: true, order: 1 },
  { id: "speakers", type: "speakers", enabled: true, order: 2 },
  { id: "schedule", type: "schedule", enabled: true, order: 3 },
  { id: "who_should_attend", type: "who_should_attend", enabled: true, order: 4 },
  { id: "faq", type: "faq", enabled: true, order: 5 },
  { id: "testimonials", type: "testimonials", enabled: true, order: 6 },
  { id: "registration", type: "registration", enabled: true, order: 7 },
];

export function DynamicEventPage({ event, typeLabels }: DynamicEventPageProps) {
  const sections =
  event.page_config?.length > 0
    ? [...event.page_config].sort((a, b) => a.order - b.order).filter((s) => s.enabled)
    : DEFAULT_SECTIONS;

  const seatsLeft = getSeatsLeft(event.seats, event.registrations_count);

  const renderSection = (section: PageSection) => {
    switch (section.type) {
      case "hero":
        return (
          <HeroSection
            key={section.id}
            event={event}
            seatsLeft={seatsLeft}
            typeLabels={typeLabels}
          />
        );
      case "about":
        return <AboutSection key={section.id} event={event} />;
      case "speakers":
        return event.speaker_data?.length > 0 ? (
          <SpeakersSection key={section.id} event={event} />
        ) : null;
      case "schedule":
        return event.schedule_data?.length > 0 ? (
          <ScheduleSection key={section.id} event={event} />
        ) : null;
      case "who_should_attend":
        return event.who_should_attend?.length > 0 ? (
          <WhoShouldAttendSection key={section.id} event={event} />
        ) : null;
      case "faq":
        return event.faq_data?.length > 0 ? (
          <FAQSection key={section.id} event={event} />
        ) : null;
      case "testimonials":
        return event.testimonials_data?.length > 0 ? (
          <TestimonialsSection key={section.id} event={event} />
        ) : null;
      case "registration":
        return <RegistrationSection key={section.id} event={event} />;
      default:
        return null;
    }
  };

  return (
    <div>
      {sections.map((section) => renderSection(section))}
    </div>
  );
}

function HeroSection({
  event,
  seatsLeft,
  typeLabels,
}: {
  event: Event;
  seatsLeft: number;
  typeLabels?: Record<string, string>;
}) {
  return (
    <section className="relative pt-32 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={`grid gap-10 lg:gap-12 items-center ${event.banner_url ? "lg:grid-cols-2" : ""}`}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="order-2 lg:order-1"
          >
            <div className="flex flex-wrap gap-2 mb-6">
              <Badge>{getEventTypeLabel(event.event_type, typeLabels)}</Badge>
              <Badge variant="secondary">{getModeLabel(event.mode)}</Badge>
              {event.is_featured && <Badge variant="purple">Featured</Badge>}
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
              {event.title}
            </h1>

            {event.tagline && (
              <p className="text-xl text-muted-foreground mb-8">
                {event.tagline}
              </p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
              <InfoPill icon={Calendar} label="Date" value={formatDate(event.start_date, { weekday: "short", month: "short", day: "numeric", year: "numeric" })} />
              <InfoPill icon={Clock} label="Time" value={formatTime(event.start_date)} />
              {event.duration_minutes && (
                <InfoPill icon={Clock} label="Duration" value={formatDuration(event.duration_minutes)} />
              )}
              <InfoPill icon={MapPin} label="Venue" value={event.venue || getModeLabel(event.mode)} />
              <InfoPill
                icon={Users}
                label="Seats"
                value={seatsLeft > 0 ? `${seatsLeft} left` : "Waitlist"}
                highlight={seatsLeft <= 10 && seatsLeft > 0}
              />
            </div>

            <Button size="xl" asChild className="glow-orange">
              <a href="#register">Register Now</a>
            </Button>
          </motion.div>

          {event.banner_url && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="order-1 lg:order-2"
            >
              {/* Show the full banner at its natural aspect ratio (no cropping). */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={event.banner_url}
                alt={event.title}
                className="w-full h-auto rounded-2xl border border-white/10 shadow-2xl"
              />
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}

function InfoPill({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="glass rounded-xl p-4">
      <Icon className="h-4 w-4 text-vedam-orange mb-2" />
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`text-sm font-medium mt-0.5 ${highlight ? "text-vedam-orange" : ""}`}>
        {value}
      </div>
    </div>
  );
}

function AboutSection({ event }: { event: Event }) {
  const cards = [
    {
      title: "Learning Outcomes",
      items: event.learning_outcomes ?? [],
      icon: GraduationCap,
      orange: true,
    },
    {
      title: "What You Get",
      items: event.benefits ?? [],
      icon: Gift,
      orange: false,
    },
  ].filter((c) => c.items.length > 0);

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading badge="About" title="What You'll Experience" align="left" />
        {event.description && (
          <p className="text-lg text-muted-foreground leading-relaxed mb-12 max-w-3xl">
            {event.description}
          </p>
        )}
        <div className="grid md:grid-cols-2 gap-8">
          {cards.map((card, ci) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: ci * 0.1 }}
              className={`group relative glass-card p-8 overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
                card.orange
                  ? "hover:border-vedam-orange/30"
                  : "hover:border-vedam-purple/30"
              }`}
            >
              <div
                className={`pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${
                  card.orange ? "bg-vedam-orange/20" : "bg-vedam-purple/20"
                }`}
              />
              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                      card.orange
                        ? "bg-vedam-orange/10 text-vedam-orange"
                        : "bg-vedam-purple/10 text-vedam-purple"
                    }`}
                  >
                    <card.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-semibold">{card.title}</h3>
                </div>
                <ul className="space-y-1">
                  {card.items.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 rounded-lg -mx-2 p-2 transition-colors hover:bg-white/[0.03]"
                    >
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                          card.orange
                            ? "bg-vedam-orange/15 text-vedam-orange"
                            : "bg-vedam-purple/15 text-vedam-purple"
                        }`}
                      >
                        <Check className="h-3 w-3" />
                      </span>
                      <span className="text-muted-foreground leading-relaxed">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SpeakersSection({ event }: { event: Event }) {
  return (
    <section className="py-20 bg-white/[0.02]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading badge="Speakers" title="Learn from the Best" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {event.speaker_data.map((speaker, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 text-center"
            >
              <div className="relative h-24 w-24 mx-auto mb-4 rounded-full overflow-hidden">
                {speaker.photo && (
                  <Image src={speaker.photo} alt={speaker.name} fill className="object-cover" />
                )}
              </div>
              <h3 className="font-semibold text-lg">{speaker.name}</h3>
              <p className="text-vedam-orange text-sm mb-3">{speaker.designation}</p>
              <p className="text-sm text-muted-foreground mb-4">{speaker.bio}</p>
              {speaker.linkedin && (
                <a
                  href={speaker.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  <Linkedin className="h-4 w-4" /> LinkedIn
                </a>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ScheduleSection({ event }: { event: Event }) {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SectionHeading badge="Schedule" title="Event Timeline" />
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-vedam-orange via-vedam-purple to-vedam-cyan" />
          <div className="space-y-6">
            {event.schedule_data.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative pl-16"
              >
                <div
                  className={`absolute left-4 top-3 h-4 w-4 rounded-full border-2 ${
                    item.type === "break"
                      ? "border-muted-foreground bg-muted"
                      : item.type === "networking"
                      ? "border-vedam-cyan bg-vedam-cyan/20"
                      : "border-vedam-orange bg-vedam-orange/20"
                  }`}
                />
                <div className="glass-card p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-mono text-vedam-orange">{item.time}</span>
                    <Badge
                      variant={
                        item.type === "break"
                          ? "secondary"
                          : item.type === "networking"
                          ? "cyan"
                          : "default"
                      }
                    >
                      {item.type}
                    </Badge>
                  </div>
                  <h4 className="font-semibold">{item.title}</h4>
                  {item.speaker && (
                    <p className="text-sm text-muted-foreground mt-1">{item.speaker}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function WhoShouldAttendSection({ event }: { event: Event }) {
  return (
    <section className="py-20 bg-white/[0.02]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading badge="Audience" title="Who Should Attend" />
        <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
          {event.who_should_attend.map((item, i) => (
            <div key={i} className="flex items-center gap-3 glass-card p-4">
              <CheckCircle className="h-5 w-5 text-vedam-cyan shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection({ event }: { event: Event }) {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SectionHeading badge="FAQ" title="Common Questions" />
        <div className="space-y-4">
          {event.faq_data.map((faq, i) => (
            <div key={i} className="glass-card p-6">
              <h4 className="font-semibold mb-2">{faq.question}</h4>
              <p className="text-muted-foreground text-sm">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection({ event }: { event: Event }) {
  return (
    <section className="py-20 bg-white/[0.02]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading badge="Testimonials" title="What Attendees Say" />
        <div className="grid sm:grid-cols-2 gap-6">
          {event.testimonials_data.map((t, i) => (
            <div key={i} className="glass-card p-6">
              <p className="text-muted-foreground mb-4 italic">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-3">
                {t.avatar && (
                  <div className="relative h-10 w-10 rounded-full overflow-hidden">
                    <Image src={t.avatar} alt={t.name} fill className="object-cover" />
                  </div>
                )}
                <div>
                  <div className="font-medium text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RegistrationSection({ event }: { event: Event }) {
  return (
    <section id="register" className="py-20">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Register"
          title="Secure Your Spot"
          subtitle={`Join ${event.title} — limited seats available`}
        />
        <div className="glass-card p-8">
          <Suspense
            fallback={
              <div className="py-8 text-center text-muted-foreground">
                Loading form...
              </div>
            }
          >
            <RegistrationForm event={event} />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
