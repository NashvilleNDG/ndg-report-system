/**
 * lib/build-trend-data.ts
 * Converts an ordered array of historical reports into TrendChartConfig[]
 * ready to be passed to <TrendChartsSection>.
 */

import type { TrendChartConfig } from "@/components/reports/TrendChart";

interface HistoricalReport {
  period: string;
  socialMedia?: {
    instagram?: { follows?: number | null } | null;
    facebook?:  { follows?: number | null } | null;
    youtube?:   { views?: number | null; subscribers?: number | null } | null;
    tiktok?:    { follows?: number | null } | null;
  } | null;
  websiteData?: { views?: number | null } | null;
  gmbData?:     { views?: number | null } | null;
}

function shortLabel(period: string): string {
  const [year, month] = period.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[parseInt(month) - 1]} '${year.slice(2)}`;
}

export function buildTrendData(reports: HistoricalReport[]): TrendChartConfig[] {
  const charts: TrendChartConfig[] = [];

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
    if (data.filter((d) => d.value != null).length < 1) return null;
    return { id, title, metric, color, data };
  }

  const instagram = makeSeries("instagram-follows",    "Instagram Follows",      "Follows",       "#e1306c", (r) => r.socialMedia?.instagram?.follows);
  const facebook  = makeSeries("facebook-follows",     "Facebook Follows",       "Follows",       "#1877f2", (r) => r.socialMedia?.facebook?.follows);
  const youtube   = makeSeries("youtube-views",        "YouTube Views",          "Views",         "#ff0000", (r) => r.socialMedia?.youtube?.views);
  const tiktok    = makeSeries("tiktok-follows",       "TikTok Follows",         "Follows",       "#010101", (r) => r.socialMedia?.tiktok?.follows);
  const website   = makeSeries("website-views",        "Website Visits",         "Visits",        "#0d9488", (r) => r.websiteData?.views);
  const gmb       = makeSeries("gmb-views",            "Google Business Views",  "Views",         "#ea580c", (r) => r.gmbData?.views);

  for (const c of [instagram, facebook, youtube, tiktok, website, gmb]) {
    if (c) charts.push(c);
  }

  return charts;
}
