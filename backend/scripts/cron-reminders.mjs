/**
 * Cron: hit backend reminder API
 * Env: API_URL or NEXT_PUBLIC_APP_URL + CRON_SECRET
 */
const baseUrl = (
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.RENDER_EXTERNAL_URL ||
  ""
).replace(/\/$/, "");
const secret = process.env.CRON_SECRET;

if (!baseUrl || !secret) {
  console.error("Missing API_URL and CRON_SECRET");
  process.exit(1);
}

const res = await fetch(`${baseUrl}/api/cron/reminders`, {
  headers: { Authorization: `Bearer ${secret}` },
});
const body = await res.text();
console.log(res.status, body);
if (!res.ok) process.exit(1);
