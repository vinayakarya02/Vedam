import type { Request, Response, NextFunction } from "express";
import type { User } from "@supabase/supabase-js";
import { createAnonClient, createAdminClient } from "../lib/supabase.js";

// The admin dashboard fires many API calls in parallel, each of which would
// otherwise make two Supabase calls (Auth getUser + admins lookup). That burst
// trips Supabase's rate limit (HTTP 429). Cache the verified result per token
// for a short window so repeated requests reuse it. TTL is short so revoked
// access is reflected quickly; the cache is per-process (fine for a single
// instance) and self-prunes expired entries.
const VERIFY_TTL_MS = 60_000;
const verifiedAdmins = new Map<string, { user: User; expires: number }>();

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

    const supabase = createAnonClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { data: admin } = await createAdminClient()
      .from("admins")
      .select("id, role")
      .eq("user_id", user.id)
      .single();

    if (!admin) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    // Prune expired entries opportunistically, then cache this verification.
    for (const [t, v] of verifiedAdmins) {
      if (v.expires <= now) verifiedAdmins.delete(t);
    }
    verifiedAdmins.set(token, { user, expires: now + VERIFY_TTL_MS });

    req.user = user;
    next();
  } catch {
    res.status(500).json({ error: "Auth failed" });
  }
}
