import type { Request, Response, NextFunction } from "express";
import { createAnonClient, createAdminClient } from "../lib/supabase.js";

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

    req.user = user;
    next();
  } catch {
    res.status(500).json({ error: "Auth failed" });
  }
}
