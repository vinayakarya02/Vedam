import { Resend } from "resend";
import type { Event, Registration } from "../types/database.js";
import { formatDate, formatTime } from "../lib/utils.js";
import { getAppUrl } from "../lib/env.js";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "events@vedam.org";

function baseTemplate(content: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0a0a; color: #fafafa; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .header { text-align: center; margin-bottom: 32px; }
    .logo { font-size: 24px; font-weight: 700; background: linear-gradient(135deg, #FF6B35, #8B5CF6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .card { background: #141414; border: 1px solid #262626; border-radius: 16px; padding: 32px; margin-bottom: 24px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #FF6B35, #8B5CF6); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; margin: 8px 4px; }
    .btn-secondary { background: #262626; }
    .detail { margin: 8px 0; color: #a3a3a3; }
    .detail strong { color: #fafafa; }
    .qr { text-align: center; margin: 24px 0; }
    .footer { text-align: center; color: #525252; font-size: 12px; margin-top: 32px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Vedam Events</div>
      <p style="color: #737373; margin-top: 8px;">School of Technology</p>
    </div>
    ${content}
    <div class="footer">
      <p>© ${new Date().getFullYear()} Vedam School of Technology</p>
      <p><a href="https://vedam.org" style="color: #8B5CF6;">vedam.org</a></p>
    </div>
  </div>
</body>
</html>`;
}

export async function sendRegistrationConfirmation(
  registration: Registration,
  event: Event,
  qrCodeDataUrl: string
) {
  const appUrl = getAppUrl();
  const ticketUrl = `${appUrl}/register/success?attendee=${registration.attendee_id}`;
  const calendarUrl = `${appUrl}/api/calendar?attendee=${registration.attendee_id}`;

  const content = `
    <div class="card">
      <h1 style="margin-top: 0;">You're Registered! 🎉</h1>
      <p>Hi ${registration.name}, your spot is confirmed for:</p>
      <h2 style="color: #FF6B35;">${event.title}</h2>
      <div class="detail"><strong>Date:</strong> ${formatDate(event.start_date)}</div>
      <div class="detail"><strong>Time:</strong> ${formatTime(event.start_date)}</div>
      <div class="detail"><strong>Venue:</strong> ${event.venue || "Online"}</div>
      <div class="detail"><strong>Attendee ID:</strong> ${registration.attendee_id}</div>
      <div class="qr">
        <img src="${qrCodeDataUrl}" alt="QR Ticket" width="200" height="200" style="border-radius: 12px;" />
        <p style="color: #737373; font-size: 14px;">Show this QR at check-in</p>
      </div>
      <div style="text-align: center;">
        ${event.whatsapp_community_link ? `<a href="${event.whatsapp_community_link}" class="btn">Join WhatsApp Community</a>` : ""}
        <a href="${ticketUrl}" class="btn btn-secondary">View Ticket</a>
        <a href="${calendarUrl}" class="btn btn-secondary">Add to Calendar</a>
      </div>
    </div>`;

  return resend.emails.send({
    from: `Vedam Events <${FROM_EMAIL}>`,
    to: registration.email,
    subject: `Confirmed: ${event.title} | Vedam Events`,
    html: baseTemplate(content),
  });
}

export async function sendReminderEmail(
  registration: Registration,
  event: Event
) {
  const content = `
    <div class="card">
      <h1 style="margin-top: 0;">Reminder: Event Tomorrow! ⏰</h1>
      <p>Hi ${registration.name},</p>
      <p><strong>${event.title}</strong> is happening tomorrow!</p>
      <div class="detail"><strong>Date:</strong> ${formatDate(event.start_date)}</div>
      <div class="detail"><strong>Time:</strong> ${formatTime(event.start_date)}</div>
      <div class="detail"><strong>Venue:</strong> ${event.venue || "Online"}</div>
      <p>Don't forget your QR ticket for check-in.</p>
    </div>`;

  return resend.emails.send({
    from: `Vedam Events <${FROM_EMAIL}>`,
    to: registration.email,
    subject: `Tomorrow: ${event.title} | Vedam Events`,
    html: baseTemplate(content),
  });
}

export async function sendStartingSoonEmail(
  registration: Registration,
  event: Event
) {
  const content = `
    <div class="card">
      <h1 style="margin-top: 0;">Starting in 15 Minutes! 🚀</h1>
      <p>Hi ${registration.name}, <strong>${event.title}</strong> begins shortly!</p>
      <div class="detail"><strong>Time:</strong> ${formatTime(event.start_date)}</div>
      <div class="detail"><strong>Venue:</strong> ${event.venue || "Online"}</div>
      <p>See you there!</p>
    </div>`;

  return resend.emails.send({
    from: `Vedam Events <${FROM_EMAIL}>`,
    to: registration.email,
    subject: `Starting Soon: ${event.title}`,
    html: baseTemplate(content),
  });
}

export async function sendThankYouEmail(
  registration: Registration,
  event: Event
) {
  const content = `
    <div class="card">
      <h1 style="margin-top: 0;">Thank You! 🙏</h1>
      <p>Hi ${registration.name},</p>
      <p>Thank you for attending <strong>${event.title}</strong>!</p>
      <p>We hope you had an amazing experience. Stay connected with the Vedam community for more events.</p>
      <div style="text-align: center; margin-top: 24px;">
        <a href="${getAppUrl()}/events" class="btn">Explore More Events</a>
      </div>
    </div>`;

  return resend.emails.send({
    from: `Vedam Events <${FROM_EMAIL}>`,
    to: registration.email,
    subject: `Thank you for attending ${event.title}`,
    html: baseTemplate(content),
  });
}
