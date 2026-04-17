/**
 * lib/build-trend-data.ts
 * Converts an ordered array of historical reports into TrendChartConfig[]
 * ready to be passed to <TrendChartsSection>.
 */

import type { TrendChartConfig } from "@/components/reports/TrendChart";

interface HistoricalReport {
  period: string;
  socialMedia?: {
    instagram?: { followers?: number | null } | null;
    facebook?: { followers?: number | null } | null;
    youtube?: { subscribers?: number | null } | null;
    tiktok?: { followers?: number | null } | null;
  } | null;
  websiteData?: { sessions?: number | null } | null;
  gmbData?: { profileViews?: number | null } | null;
}

function shortLabel(period: string): string {
  const [year, month] = period.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[parseInt(month) - 1]} '${year.slice(2)}`;
}

export function buildTrendData(reports: HistoricalReport[]): TrendChartConfig[] {
  const charts: TrendChartConfig[] = [];

  // ── Helpers ──────────────────────────────────────────────────────────────────

  function makeSeries(
    id: string,
    title: string,
    metric: string,
    color: string,
    extract: (r: HistoricalReport) => number | null | undefined
  ): TrendChartConfig | null {
    const data = reports.map((r) => ({
      label: shortLabel(r.period),
      value: extract(r) ?? null,
    }));
    // Only add if at least 2 points have real data
    const nonNull = data.filter((d) => d.value != null).length;
    if (nonNull < 1) return null;
    return { id, title, metric, color, data };
  }

  // ── Social Media ─────────────────────────────────────────────────────────────

  const instagram = makeSeries(
    "instagram-followers",
    "Instagram Followers",
    "Followers",
    "#e1306c",
    (r) => r.socialMedia?.instagram?.followers
  );
  if (instagram) charts.push(instagram);

  const facebook = makeSeries(
    "facebook-followers",
    "Facebook Followers",
    "Followers",
    "#1877f2",
    (r) => r.socialMedia?.facebook?.followers
  );
  if (facebook) charts.push(facebook);

  const youtube = makeSeries(
    "youtube-subscribers",
    "YouTube Subscribers",
    "Subscribers",
    "#ff0000",
    (r) => r.socialMedia?.youtube?.subscribers
  );
  if (youtube) charts.push(youtube);

  const tiktok = makeSeries(
    "tiktok-followers",
    "TikTok Followers",
    "Followers",
    "#010101",
    (r) => r.socialMedia?.tiktok?.followers
  );
  if (tiktok) charts.push(tiktok);

  // ── Website ──────────────────────────────────────────────────────────────────

  const website = makeSeries(
    "website-sessions",
    "Website Sessions",
    "Sessions",
    "#0d9488",
    (r) => r.websiteData?.sessions
  );
  if (website) charts.push(website);

  // ── GMB ───────────────────────────────────────────────────────────────────────

  const gmb = makeSeries(
    "gmb-views",
    "Google Business Views",
    "Profile Views",
    "#ea580c",
    (r) => r.gmbData?.profileViews
  );
  if (gmb) charts.push(gmb);

  return charts;
}
