import type { RegistrationFormField } from "@/types/database";

const PASSOUT_YEARS = Array.from({ length: 12 }, (_, i) =>
  String(new Date().getFullYear() - i)
);

export const STREAM_12TH_OPTIONS = [
  "Science (PCM)",
  "Science (PCB)",
  "Science (PCMB)",
  "Commerce",
  "Arts / Humanities",
  "Other",
];

/** Default registration questions for new events */
export const DEFAULT_REGISTRATION_FORM_FIELDS: RegistrationFormField[] = [
  {
    id: "name",
    label: "Full Name",
    type: "text",
    required: true,
    fieldKey: "name",
    placeholder: "John Doe",
  },
  {
    id: "email",
    label: "Email Address",
    type: "email",
    required: true,
    fieldKey: "email",
    placeholder: "john@example.com",
  },
  {
    id: "phone",
    label: "Phone Number",
    type: "phone",
    required: true,
    fieldKey: "phone",
    placeholder: "+91 98765 43210",
  },
  {
    id: "passout_year_12th",
    label: "12th Passout Year",
    type: "select",
    required: true,
    fieldKey: "passout_year_12th",
    options: PASSOUT_YEARS,
  },
  {
    id: "stream_12th",
    label: "Stream of 12th",
    type: "select",
    required: true,
    fieldKey: "stream_12th",
    options: STREAM_12TH_OPTIONS,
  },
  {
    id: "city",
    label: "City",
    type: "text",
    required: true,
    fieldKey: "city",
    placeholder: "Hyderabad",
  },
  {
    id: "college",
    label: "College / Company",
    type: "text",
    required: true,
    fieldKey: "college",
    placeholder: "Vedam School of Technology",
  },
  {
    id: "role",
    label: "Current Year / Role",
    type: "text",
    required: true,
    fieldKey: "role",
    placeholder: "2nd Year B.Tech",
  },
  {
    id: "linkedin",
    label: "LinkedIn Profile",
    type: "url",
    required: false,
    fieldKey: "linkedin",
    placeholder: "https://linkedin.com/in/johndoe",
  },
  {
    id: "reason",
    label: "Why do you want to attend?",
    type: "textarea",
    required: true,
    fieldKey: "reason",
    placeholder: "Tell us about your goals and what you hope to learn...",
  },
];

export const FORM_FIELD_TYPES = [
  { value: "text", label: "Short text" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "textarea", label: "Long text" },
  { value: "select", label: "Dropdown" },
  { value: "number", label: "Number" },
  { value: "url", label: "URL" },
] as const;

export function getEventFormFields(
  fields: RegistrationFormField[] | null | undefined
): RegistrationFormField[] {
  if (fields && fields.length > 0) return fields;
  return DEFAULT_REGISTRATION_FORM_FIELDS;
}

export function createEmptyFormField(order: number): RegistrationFormField {
  return {
    id: `field_${Date.now()}_${order}`,
    label: "New question",
    type: "text",
    required: false,
    placeholder: "",
  };
}
