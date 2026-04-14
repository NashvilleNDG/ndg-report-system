import * as XLSX from "xlsx";
import type { ParsedReportRow } from "@/types/report";

// Column index constants (0-based). Update these if your Excel layout changes.
const COL = {
  PERIOD: 0,
  IG_FOLLOWERS: 1,
  IG_FOLLOWERS_CHANGE: 2,
  IG_LIKES: 3,
  IG_REACH: 4,
  IG_IMPRESSIONS: 5,
  IG_ENGAGEMENT: 6,
  FB_FOLLOWERS: 7,
  FB_FOLLOWERS_CHANGE: 8,
  FB_LIKES: 9,
  FB_REACH: 10,
  FB_IMPRESSIONS: 11,
  FB_ENGAGEMENT: 12,
  YT_SUBSCRIBERS: 13,
  YT_SUBSCRIBERS_CHANGE: 14,
  YT_LIKES: 15,
  YT_VIEWS: 16,
  YT_IMPRESSIONS: 17,
  YT_ENGAGEMENT: 18,
  TT_FOLLOWERS: 19,
  TT_FOLLOWERS_CHANGE: 20,
  TT_LIKES: 21,
  TT_REACH: 22,
  TT_IMPRESSIONS: 23,
  TT_ENGAGEMENT: 24,
  SESSIONS: 25,
  USERS: 26,
  PAGEVIEWS: 27,
  BOUNCE_RATE: 28,
  CONVERSIONS: 29,
  CONVERSION_RATE: 30,
  GMB_VIEWS: 31,
  GMB_SEARCHES: 32,
  GMB_INTERACTIONS: 33,
  GMB_CLICKS: 34,
  GMB_CALLS: 35,
  GMB_DIRECTIONS: 36,
} as const;

function num(
  row: (string | number | null | undefined)[],
  col: number
): number | null {
  const val = row[col];
  if (val == null || val === "") return null;
  const n = Number(val);
  return isNaN(n) ? null : n;
}

function toPeriod(val: string | number | null | undefined | Date): string | null {
  if (val == null || val === "") return null;

  // Already a JS Date (when cellDates: true)
  if (val instanceof Date) {
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  }

  // Excel date serial number (e.g. 46023 = Jan 2026)
  if (typeof val === "number") {
    const date = XLSX.SSF.parse_date_code(val);
    if (date) {
      const m = String(date.m).padStart(2, "0");
      return `${date.y}-${m}`;
    }
    return null;
  }

  // String — validate YYYY-MM format
  const s = String(val).trim();
  if (/^\d{4}-\d{2}$/.test(s)) return s;

  // Handle "Jan 2026", "January 2026", "2026/01", "01/2026" etc.
  const monthNames: Record<string, string> = {
    jan:"01",feb:"02",mar:"03",apr:"04",may:"05",jun:"06",
    jul:"07",aug:"08",sep:"09",oct:"10",nov:"11",dec:"12"
  };
  const mname = s.match(/([a-zA-Z]{3,})\s+(\d{4})/);
  if (mname) {
    const mo = monthNames[mname[1].toLowerCase().slice(0,3)];
    if (mo) return `${mname[2]}-${mo}`;
  }
  const slash = s.match(/^(\d{4})\/(\d{2})$/) || s.match(/^(\d{2})\/(\d{4})$/);
  if (slash) return slash[1].length === 4 ? `${slash[1]}-${slash[2]}` : `${slash[2]}-${slash[1]}`;

  return null;
}

export function parseExcelBuffer(
  buffer: Buffer,
  sheetName?: string
): ParsedReportRow[] {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });

  const sheet = sheetName
    ? workbook.Sheets[sheetName] ?? workbook.Sheets[workbook.SheetNames[0]]
    : workbook.Sheets[workbook.SheetNames[0]];

  if (!sheet) return [];

  const rows: (string | number | null | Date)[][] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: null,
    raw: true,
  });

  const results: ParsedReportRow[] = [];

  // Skip header row (row 0)
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const period = toPeriod(row[COL.PERIOD] as string | number | null | Date);

    // Must have a valid YYYY-MM period
    if (!period) continue;

    results.push({
      period,
      instagram: {
        followers: num(row, COL.IG_FOLLOWERS),
        followersChange: num(row, COL.IG_FOLLOWERS_CHANGE),
        likes: num(row, COL.IG_LIKES),
        reach: num(row, COL.IG_REACH),
        impressions: num(row, COL.IG_IMPRESSIONS),
        engagement: num(row, COL.IG_ENGAGEMENT),
      },
      facebook: {
        followers: num(row, COL.FB_FOLLOWERS),
        followersChange: num(row, COL.FB_FOLLOWERS_CHANGE),
        likes: num(row, COL.FB_LIKES),
        reach: num(row, COL.FB_REACH),
        impressions: num(row, COL.FB_IMPRESSIONS),
        engagement: num(row, COL.FB_ENGAGEMENT),
      },
      youtube: {
        subscribers: num(row, COL.YT_SUBSCRIBERS),
        subscribersChange: num(row, COL.YT_SUBSCRIBERS_CHANGE),
        likes: num(row, COL.YT_LIKES),
        views: num(row, COL.YT_VIEWS),
        impressions: num(row, COL.YT_IMPRESSIONS),
        engagement: num(row, COL.YT_ENGAGEMENT),
      },
      tiktok: {
        followers: num(row, COL.TT_FOLLOWERS),
        followersChange: num(row, COL.TT_FOLLOWERS_CHANGE),
        likes: num(row, COL.TT_LIKES),
        reach: num(row, COL.TT_REACH),
        impressions: num(row, COL.TT_IMPRESSIONS),
        engagement: num(row, COL.TT_ENGAGEMENT),
      },
      website: {
        sessions: num(row, COL.SESSIONS),
        users: num(row, COL.USERS),
        pageviews: num(row, COL.PAGEVIEWS),
        bounceRate: num(row, COL.BOUNCE_RATE),
        conversions: num(row, COL.CONVERSIONS),
        conversionRate: num(row, COL.CONVERSION_RATE),
      },
      gmb: {
        profileViews: num(row, COL.GMB_VIEWS),
        searchImpressions: num(row, COL.GMB_SEARCHES),
        businessInteractions: num(row, COL.GMB_INTERACTIONS),
        clicks: num(row, COL.GMB_CLICKS),
        calls: num(row, COL.GMB_CALLS),
        directionRequests: num(row, COL.GMB_DIRECTIONS),
      },
    });
  }

  return results;
}

export function generateTemplate(): Buffer {
  const wb = XLSX.utils.book_new();

  const headers = [
    "Period (YYYY-MM)",
    "IG Followers",
    "IG Followers Change",
    "IG Likes",
    "IG Reach",
    "IG Impressions",
    "IG Engagement%",
    "FB Followers",
    "FB Followers Change",
    "FB Likes",
    "FB Reach",
    "FB Impressions",
    "FB Engagement%",
    "YT Subscribers",
    "YT Subscribers Change",
    "YT Likes",
    "YT Views",
    "YT Impressions",
    "YT Engagement%",
    "TT Followers",
    "TT Followers Change",
    "TT Likes",
    "TT Reach",
    "TT Impressions",
    "TT Engagement%",
    "Sessions",
    "Users",
    "Pageviews",
    "Bounce Rate%",
    "Conversions",
    "Conversion Rate%",
    "GMB Profile Views",
    "GMB Search Impressions",
    "GMB Business Interactions",
    "GMB Clicks",
    "GMB Calls",
    "GMB Direction Requests",
  ];

  const sampleRow = ["2024-01", 12500, 340, 8200, 45000, 62000, 4.2, 8900, 120, 3400, 28000, 41000, 2.8, 5200, 95, 1800, 32000, 58000, 3.5, 18700, 820, 24500, 95000, 140000, 8.1, 14200, 11800, 38500, 42.3, 186, 1.31, 3200, 8700, 540, 280, 95, 165];

  const ws = XLSX.utils.aoa_to_sheet([headers, sampleRow]);

  // Set column widths
  ws["!cols"] = headers.map(() => ({ wch: 18 }));

  XLSX.utils.book_append_sheet(wb, ws, "client-slug");

  return Buffer.from(XLSX.write(wb, { type: "buffer", bookType: "xlsx" }));
}
