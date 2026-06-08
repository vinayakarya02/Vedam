"use client";

import { createClient } from "@/lib/supabase/client";
import { getApiUrl } from "@/lib/api";

async function getAdminAuthHeaders(
  extra?: HeadersInit
): Promise<HeadersInit> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return {
    ...(session?.access_token
      ? { Authorization: `Bearer ${session.access_token}` }
      : {}),
    ...extra,
  };
}

/** Client-side fetch with admin auth token */
export async function clientApiFetch(
  path: string,
  init?: RequestInit
): Promise<Response> {
  const isFormData = init?.body instanceof FormData;

  return fetch(`${getApiUrl()}${path}`, {
    ...init,
    headers: await getAdminAuthHeaders({
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...init?.headers,
    }),
  });
}

/** Upload a file (raw body) with admin auth — for banner uploads */
export async function clientApiUpload(
  path: string,
  file: File,
  mimeType: string
): Promise<Response> {
  return fetch(`${getApiUrl()}${path}`, {
    method: "POST",
    headers: await getAdminAuthHeaders({
      "Content-Type": mimeType,
      "X-File-Name": file.name,
    }),
    body: file,
  });
}

/** Public client fetch (no auth) */
export function publicApiFetch(path: string, init?: RequestInit) {
  return fetch(`${getApiUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
}
