// Supabase Edge Function for email reminders
// Deploy with: supabase functions deploy send-reminders

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const appUrl = Deno.env.get("APP_URL") || "https://events.vedam.org";
  const cronSecret = Deno.env.get("CRON_SECRET");

  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Trigger the Next.js cron endpoint
  const response = await fetch(`${appUrl}/api/cron/reminders`, {
    headers: { Authorization: `Bearer ${cronSecret}` },
  });

  const result = await response.json();

  return new Response(JSON.stringify(result), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
