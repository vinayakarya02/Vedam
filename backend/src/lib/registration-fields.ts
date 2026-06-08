import type { RegistrationFormField } from "../types/database.js";

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

export function getEventFormFields(
  fields: RegistrationFormField[] | null | undefined
): RegistrationFormField[] {
  if (fields && fields.length > 0) return fields;
  return DEFAULT_REGISTRATION_FORM_FIELDS;
}

export interface RegistrationUtm {
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
}

export function validateRegistrationAnswers(
  fields: RegistrationFormField[],
  answers: Record<string, string>
): { valid: true; mapped: Record<string, string | null>; formResponses: Record<string, string> } | { valid: false; error: string } {
  const mapped: Record<string, string | null> = {
    name: "",
    email: "",
    phone: "",
    passout_year_12th: null,
    stream_12th: null,
    college: null,
    role: null,
    linkedin: null,
    city: null,
    reason: null,
  };
  const formResponses: Record<string, string> = {};

  for (const field of fields) {
    const value = (answers[field.id] ?? "").trim();

    if (field.required && !value) {
      return { valid: false, error: `${field.label} is required` };
    }

    if (!value) continue;

    if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return { valid: false, error: `Please enter a valid email for ${field.label}` };
    }

    if (field.type === "phone" && !/^[+]?[\d\s-]{10,}$/.test(value)) {
      return { valid: false, error: `Please enter a valid phone number for ${field.label}` };
    }

    if (field.type === "url" && value && !/^https?:\/\/.+/.test(value)) {
      return { valid: false, error: `Please enter a valid URL for ${field.label}` };
    }

    if (field.fieldKey === "reason" && value.length < 10) {
      return { valid: false, error: "Please tell us why you want to attend (min 10 characters)" };
    }

    if (field.fieldKey) {
      mapped[field.fieldKey] = value;
    } else {
      formResponses[field.id] = value;
    }
  }

  if (!mapped.name || mapped.name.length < 2) {
    return { valid: false, error: "Name is required" };
  }
  if (!mapped.email) {
    return { valid: false, error: "Email is required" };
  }
  if (!mapped.phone || mapped.phone.length < 10) {
    return { valid: false, error: "Phone is required" };
  }

  for (const field of fields) {
    if (field.required && field.fieldKey && !mapped[field.fieldKey]) {
      return { valid: false, error: `${field.label} is required` };
    }
  }

  return { valid: true, mapped, formResponses };
}

export function mergeUtmParams(
  fromUrl: RegistrationUtm,
  eventDefaults: RegistrationUtm
): RegistrationUtm {
  return {
    utm_source: fromUrl.utm_source || eventDefaults.utm_source || null,
    utm_medium: fromUrl.utm_medium || eventDefaults.utm_medium || null,
    utm_campaign: fromUrl.utm_campaign || eventDefaults.utm_campaign || null,
    utm_content: fromUrl.utm_content || null,
  };
}
