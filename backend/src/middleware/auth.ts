import type { Request, Response, NextFunction } from "express";
import type { User } from "@supabase/supabase-js";
import { createAnonClient, createAdminClient } from "../lib/supabase.js";

// Single reusable client so the JWKS used to verify access tokens is fetched
// once per process and cached, rather than on every request.
const authClient = createAnonClient();

// The admin dashboard fires many API calls in parallel; verifying each against
// Supabase Auth over the network previously tripped its rate limit (429/500).
// We now verify the access token locally via the project's JWKS (asymmetric
// ES256 keys) and cache the verified-admin result per token. TTL is short so
// revoked access is reflected quickly; the cache self-prunes expired entries.
const VERIFY_TTL_MS = 5 * 60_000;
const verifiedAdmins = new Map<
  string,
  { user: User; expires: number }
>();

export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const token = authHeader.slice(7);
    const now = Date.now();

    const cached = verifiedAdmins.get(token);
    if (cached && cached.expires > now) {
      req.user = cached.user;
      next();
      return;
    }

    // Verify locally via JWKS — no network round-trip to Supabase Auth, so it
    // cannot be rate-limited. Fall back to the network getUser only if the
    // token can't be verified locally (e.g. a legacy HS256 token).
    let userId: string | undefined;
    let email = "";
    try {
      const { data, error } = await authClient.auth.getClaims(token);
      const claims = data?.claims as { sub?: string; email?: string } | undefined;
      if (!error && claims?.sub) {
        userId = claims.sub;
        email = claims.email ?? "";
      }
    } catch {
      // fall through to the network fallback below
    }

    if (!userId) {
      try {
        const {
          data: { user },
          error,
        } = await authClient.auth.getUser(token);
        if (error || !user) {
          res.status(401).json({ error: "Unauthorized" });
          return;
        }
        userId = user.id;
        email = user.email ?? "";
      } catch {
        // Auth backend unreachable/rate-limited — retryable, not a hard 500.
        res.status(503).json({ error: "Auth temporarily unavailable, please retry" });
        return;
      }
    }

    const { data: admin } = await createAdminClient()
      .from("admins")
      .select("id, role")
      .eq("user_id", userId)
      .single();

    if (!admin) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    // Prune expired entries opportunistically, then cache this verification.
    for (const [t, v] of verifiedAdmins) {
      if (v.expires <= now) verifiedAdmins.delete(t);
    }
    const user = { id: userId, email } as User;
    verifiedAdmins.set(token, { user, expires: now + VERIFY_TTL_MS });

    req.user = user;
    next();
  } catch {
    res.status(500).json({ error: "Auth failed" });
  }
}
