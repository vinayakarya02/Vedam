"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Code2,
  Rocket,
  Users,
  Brain,
  Trophy,
  Mic,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/events/event-card";
import { SectionHeading } from "@/components/shared/section-heading";
import type { Event } from "@/types/database";

const categories = [
  { icon: Code2, label: "Workshops", type: "workshop", color: "text-vedam-orange" },
  { icon: Brain, label: "AI Bootcamps", type: "bootcamp", color: "text-vedam-purple" },
  { icon: Rocket, label: "Hackathons", type: "hackathon", color: "text-vedam-cyan" },
  { icon: Mic, label: "Founder Talks", type: "founder-talk", color: "text-vedam-orange" },
  { icon: GraduationCap, label: "Masterclasses", type: "masterclass", color: "text-vedam-purple" },
  { icon: Users, label: "Meetups", type: "meetup", color: "text-vedam-cyan" },
  { icon: Trophy, label: "Demo Days", type: "demo-day", color: "text-vedam-orange" },
  { icon: Sparkles, label: "Career Sessions", type: "career-session", color: "text-vedam-purple" },
];

const whyAttend = [
  {
    title: "Build From Day 1",
    description: "Hands-on, project-based learning. No passive lectures — you ship real products.",
    icon: Code2,
  },
  {
    title: "AI-First Curriculum",
    description: "Learn the latest in GenAI, LLMs, and production AI systems from industry experts.",
    icon: Brain,
  },
  {
    title: "Startup Network",
    description: "Connect with founders, investors, and builders in India's top tech ecosystem.",
    icon: Rocket,
  },
  {
    title: "Elite Community",
    description: "Join Vedam's curated community of top 5% tech talent and ambitious builders.",
    icon: Users,
  },
];

const testimonials = [
  {
    name: "Rahul S.",
    role: "B.Tech Student, Vedam",
    text: "The GenAI bootcamp changed my career trajectory. I built 3 AI projects and landed a startup internship.",
  },
  {
    name: "Ananya P.",
    role: "Software Engineer",
    text: "Vedam events are unlike anything else — premium quality, real learning, and an incredible network.",
  },
  {
    name: "Vikram K.",
    role: "Startup Founder",
    text: "The founder talks gave me actionable insights. Vedam truly understands the builder mindset.",
  },
];

const faqs = [
  {
    q: "Are Vedam events free?",
    a: "Many events are free for students. Premium bootcamps and masterclasses may have a fee. Check each event page for details.",
  },
  {
    q: "Who can attend Vedam events?",
    a: "Students, professionals, founders, and anyone passionate about tech and AI. Most events are open to all.",
  },
  {
    q: "Do I get a certificate?",
    a: "Yes! Most workshops and bootcamps include a certificate of completion from Vedam School of Technology.",
  },
  {
    q: "How do I join the WhatsApp community?",
    a: "After registration, you'll be automatically redirected to join the event's WhatsApp community for updates and networking.",
  },
];

interface HomepageSectionsProps {
  upcomingEvents: Event[];
  featuredEvents: Event[];
  pastEvents: Event[];
  highlightEvent?: Event;
}

export function HomepageSections({
  upcomingEvents,
  featuredEvents,
  pastEvents,
  highlightEvent,
}: HomepageSectionsProps) {
  return (
    <>
      <HeroSection highlightEvent={highlightEvent} />
      <UpcomingEventsSection events={upcomingEvents} />
      <FeaturedEventsSection events={featuredEvents} />
      <WhyAttendSection />
      <CategoriesSection />
      <PastEventsSection events={pastEvents} />
      <TestimonialsSection />
      <FAQSection />
    </>
  );
}

function HeroSection({ highlightEvent }: { highlightEvent?: Event }) {
  return (
    <section className="relative min-h-screen flex items-center pt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-sm mb-6">
              <Sparkles className="h-4 w-4 text-vedam-orange" />
              <span className="text-muted-foreground">Vedam School of Technology</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
              Learn Tech by{" "}
              <span className="gradient-text">Building It</span>
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-lg leading-relaxed">
              Premium workshops, AI bootcamps, hackathons, and founder talks.
              Join India&apos;s most ambitious builder community.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button size="xl" asChild className="glow-orange">
                <Link href="/events">
                  Explore Events <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button size="xl" variant="outline" asChild>
                <Link href="https://vedam.org" target="_blank">
                  Apply to Vedam
                </Link>
              </Button>
            </div>
          </motion.div>

          {highlightEvent && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="glass-card p-6 glow-purple"
            >
              <div className="text-xs text-vedam-orange font-medium mb-2">
                NEXT EVENT
              </div>
              <h3 className="text-2xl font-bold mb-2">{highlightEvent.title}</h3>
              <p className="text-muted-foreground text-sm mb-6">
                {highlightEvent.tagline || highlightEvent.subtitle}
              </p>
              <Button className="w-full" asChild>
                <Link href={`/events/${highlightEvent.slug}`}>
                  Register Now <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}

function UpcomingEventsSection({ events }: { events: Event[] }) {
  if (events.length === 0) return null;
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Upcoming"
          title="Don't Miss These"
          subtitle="Register early — seats fill up fast"
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.slice(0, 3).map((event, i) => (
            <EventCard key={event.id} event={event} index={i} />
          ))}
        </div>
        <div className="text-center mt-10">
          <Button variant="outline" asChild>
            <Link href="/events">View All Events</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function FeaturedEventsSection({ events }: { events: Event[] }) {
  if (events.length === 0) return null;
  return (
    <section className="py-20 bg-white/[0.02]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading badge="Featured" title="Highlighted Events" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event, i) => (
            <EventCard key={event.id} event={event} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyAttendSection() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Why Vedam"
          title="Why Attend Vedam Events"
          subtitle="More than events — a gateway to India's top tech community"
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {whyAttend.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 hover:border-white/20 transition-colors"
            >
              <item.icon className="h-8 w-8 text-vedam-orange mb-4" />
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoriesSection() {
  return (
    <section id="categories" className="py-20 bg-white/[0.02]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading badge="Categories" title="Event Categories" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.type}
              href={`/events?type=${cat.type}`}
              className="glass-card p-6 text-center hover:border-white/20 transition-all group"
            >
              <cat.icon
                className={`h-8 w-8 mx-auto mb-3 ${cat.color} group-hover:scale-110 transition-transform`}
              />
              <span className="text-sm font-medium">{cat.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function PastEventsSection({ events }: { events: Event[] }) {
  if (events.length === 0) return null;
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading badge="Gallery" title="Past Events" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {events.slice(0, 4).map((event) => (
            <Link
              key={event.id}
              href={`/events/${event.slug}`}
              className="relative aspect-video rounded-xl overflow-hidden group"
            >
              {event.banner_url && (
                <Image
                  src={event.banner_url}
                  alt={event.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              )}
              <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors flex items-end p-4">
                <span className="text-sm font-medium">{event.title}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section className="py-20 bg-white/[0.02]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading badge="Community" title="What Builders Say" />
        <div className="grid sm:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6"
            >
              <p className="text-muted-foreground mb-4 italic">&ldquo;{t.text}&rdquo;</p>
              <div>
                <div className="font-medium text-sm">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.role}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  return (
    <section id="faq" className="py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SectionHeading badge="FAQ" title="Frequently Asked Questions" />
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="glass-card p-6">
              <h4 className="font-semibold mb-2">{faq.q}</h4>
              <p className="text-sm text-muted-foreground">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
