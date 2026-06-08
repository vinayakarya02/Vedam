export type EventStatus = "draft" | "published" | "archived";
export type EventMode = "online" | "offline" | "hybrid";
export type RegistrationStatus =
  | "registered"
  | "waitlisted"
  | "attended"
  | "cancelled";
export type AdminRole = "super_admin" | "admin" | "viewer";

export interface Speaker {
  name: string;
  designation: string;
  bio: string;
  photo: string;
  linkedin?: string;
}

export interface ScheduleItem {
  time: string;
  title: string;
  type: "session" | "break" | "networking";
  speaker?: string;
  description?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface Testimonial {
  name: string;
  role: string;
  text: string;
  avatar?: string;
}

export type RegistrationFieldType =
  | "text"
  | "email"
  | "phone"
  | "textarea"
  | "select"
  | "number"
  | "url";

export interface RegistrationFormField {
  id: string;
  label: string;
  type: RegistrationFieldType;
  required: boolean;
  placeholder?: string;
  options?: string[];
  fieldKey?:
    | "name"
    | "email"
    | "phone"
    | "passout_year_12th"
    | "stream_12th"
    | "college"
    | "role"
    | "linkedin"
    | "city"
    | "reason";
}

export interface EventType {
  id: string;
  slug: string;
  label: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PageSection {
  id: string;
  type:
    | "hero"
    | "about"
    | "speakers"
    | "schedule"
    | "sponsors"
    | "gallery"
    | "faq"
    | "testimonials"
    | "who_should_attend"
    | "registration";
  enabled: boolean;
  order: number;
  config?: Record<string, unknown>;
}

export interface Event {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  tagline: string | null;
  description: string | null;
  banner_url: string | null;
  event_type: string;
  mode: EventMode;
  venue: string | null;
  start_date: string;
  end_date: string | null;
  seats: number;
  registrations_count: number;
  speaker_data: Speaker[];
  schedule_data: ScheduleItem[];
  page_config: PageSection[];
  learning_outcomes: string[];
  benefits: string[];
  who_should_attend: string[];
  faq_data: FAQItem[];
  testimonials_data: Testimonial[];
  whatsapp_community_link: string | null;
  whatsapp_group_link: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  is_featured: boolean;
  duration_minutes: number | null;
  status: EventStatus;
  meta_title: string | null;
  meta_description: string | null;
  registration_form_fields?: RegistrationFormField[];
  created_at: string;
  updated_at: string;
}

export interface Registration {
  id: string;
  attendee_id: string;
  event_id: string;
  name: string;
  email: string;
  phone: string;
  college: string | null;
  role: string | null;
  linkedin: string | null;
  city: string | null;
  reason: string | null;
  passout_year_12th: string | null;
  stream_12th: string | null;
  qr_code: string | null;
  status: RegistrationStatus;
  whatsapp_clicked: boolean;
  whatsapp_clicked_at: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  form_responses?: Record<string, string>;
  created_at: string;
  events?: Event;
}

export interface Admin {
  id: string;
  user_id: string | null;
  email: string;
  role: AdminRole;
  created_at: string;
}

export interface AnalyticsEvent {
  id: string;
  event_id: string | null;
  registration_id: string | null;
  event_type: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface DashboardStats {
  totalEvents: number;
  activeEvents: number;
  totalRegistrations: number;
  attendanceRate: number;
  whatsappJoinRate: number;
}

export interface RegistrationFormData {
  name: string;
  email: string;
  phone: string;
  college: string;
  role: string;
  linkedin: string;
  city: string;
  reason: string;
}
