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
