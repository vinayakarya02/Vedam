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

// Gentle backoff to ride out a brief cold start / redeploy without bursting
// (which can trip an edge rate limit). Only a couple of attempts, and only for
// clear gateway/network failures — never for 429 (rate limited) or 500 (app
// error), which retrying would only make worse.
const RETRY_DELAYS_MS = [1500, 4000];
const RETRYABLE_STATUS = new Set([502, 503, 504]);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Client-side fetch with admin auth token; retries transient gateway errors */
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
      if (RETRYABLE_STATUS.has(res.status) && attempt < RETRY_DELAYS_MS.length) {
        await sleep(RETRY_DELAYS_MS[attempt]);
        continue;
      }
      return res;
    } catch (err) {
      lastError = err;
      if (attempt < RETRY_DELAYS_MS.length) {
        await sleep(RETRY_DELAYS_MS[attempt]);
        continue;
      }
      throw lastError;
    }
  }

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
