"use client";

import { createClient } from "@/lib/supabase/client";
import { getApiUrl } from "@/lib/api";

/** Client-side fetch with admin auth token */
export async function clientApiFetch(
  path: string,
  init?: RequestInit
): Promise<Response> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return fetch(`${getApiUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(session?.access_token
        ? { Authorization: `Bearer ${session.access_token}` }
        : {}),
      ...init?.headers,
    },
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
