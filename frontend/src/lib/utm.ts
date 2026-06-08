export interface UtmParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
}

export function getUtmFromSearchParams(
  search: string | URLSearchParams
): UtmParams {
  const params =
    typeof search === "string" ? new URLSearchParams(search) : search;
  const utm: UtmParams = {};
  const source = params.get("utm_source");
  const medium = params.get("utm_medium");
  const campaign = params.get("utm_campaign");
  const content = params.get("utm_content");
  if (source) utm.utm_source = source;
  if (medium) utm.utm_medium = medium;
  if (campaign) utm.utm_campaign = campaign;
  if (content) utm.utm_content = content;
  return utm;
}

export function buildEventRegistrationUrl(
  appUrl: string,
  slug: string,
  utm: { utm_source?: string | null; utm_medium?: string | null; utm_campaign?: string | null }
): string {
  const url = new URL(`${appUrl.replace(/\/$/, "")}/events/${slug}`);
  if (utm.utm_source) url.searchParams.set("utm_source", utm.utm_source);
  if (utm.utm_medium) url.searchParams.set("utm_medium", utm.utm_medium);
  if (utm.utm_campaign) url.searchParams.set("utm_campaign", utm.utm_campaign);
  return url.toString();
}
