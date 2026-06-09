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

// Backoff delays (ms) used to ride out a free-tier backend cold start
// (~50s) or a brief redeploy, instead of surfacing a transient failure.
const RETRY_DELAYS_MS = [2000, 5000, 10000, 15000, 20000];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Client-side fetch with admin auth token; retries transient infra errors */
export async function clientApiFetch(
  path: string,
  init?: RequestInit
): Promise<Response> {
  const isFormData = init?.body instanceof FormData;
  const headers = await getAdminAuthHeaders({
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...init?.headers,
  });

  const url = `${getApiUrl()}${path}`;
  let lastError: unknown;

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    try {
      const res = await fetch(url, { ...init, headers });
      // Retry only transient infra responses (cold start / redeploy / gateway).
      if (
        [500, 502, 503, 504].includes(res.status) &&
        attempt < RETRY_DELAYS_MS.length
      ) {
        await sleep(RETRY_DELAYS_MS[attempt]);
        continue;
      }
      return res;
    } catch (err) {
      // Network error (backend unreachable while waking) — retry.
      lastError = err;
      if (attempt < RETRY_DELAYS_MS.length) {
        await sleep(RETRY_DELAYS_MS[attempt]);
        continue;
      }
      throw lastError;
    }
  }

  // Unreachable, but satisfies the type checker.
  throw lastError ?? new Error("Request failed");
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
