export const EVENT_TYPES = [
  { value: "webinar", label: "Webinar" },
  { value: "bootcamp", label: "AI Bootcamp" },
  { value: "masterclass", label: "Masterclass" },
  { value: "meetup", label: "Seek your Seniors" },
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
