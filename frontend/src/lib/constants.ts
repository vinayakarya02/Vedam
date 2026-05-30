export const EVENT_TYPES = [
  { value: "workshop", label: "Workshop" },
  { value: "webinar", label: "Webinar" },
  { value: "hackathon", label: "Hackathon" },
  { value: "bootcamp", label: "AI Bootcamp" },
  { value: "masterclass", label: "Masterclass" },
  { value: "meetup", label: "Community Meetup" },
  { value: "career-session", label: "Career Session" },
  { value: "demo-day", label: "Demo Day" },
  { value: "founder-talk", label: "Founder Talk" },
  { value: "campus-event", label: "Campus Event" },
] as const;

export const EVENT_MODES = [
  { value: "online", label: "Online" },
  { value: "offline", label: "In-Person" },
  { value: "hybrid", label: "Hybrid" },
] as const;

export const REGISTRATION_STATUSES = [
  "registered",
  "waitlisted",
  "attended",
  "cancelled",
] as const;

export const PAGE_SECTION_TYPES = [
  "hero",
  "about",
  "speakers",
  "schedule",
  "who_should_attend",
  "faq",
  "testimonials",
  "registration",
  "sponsors",
  "gallery",
] as const;
