import * as XLSX from "xlsx";
import type { ParsedReportRow } from "@/types/report";

// Column index constants (0-based). Update these if your Excel layout changes.
const COL = {
  PERIOD:             0,
  // Instagram
  IG_VIEWS:           1,
  IG_INTERACTIONS:    2,
  IG_FOLLOWS:         3,
  IG_POSTS:           4,
  // Facebook
  FB_VIEWS:           5,
  FB_INTERACTIONS:    6,
  FB_FOLLOWS:         7,
  FB_POSTS:           8,
  // TikTok
  TT_VIEWS:           9,
  TT_INTERACTIONS:    10,
  TT_FOLLOWS:         11,
  TT_REELS:           12,
  // YouTube
  YT_VIEWS:           13,
  YT_SUBSCRIBERS:     14,
  YT_VIDEOS:          15,
  // Website
  WEB_TOTAL_USERS:    16,
  WEB_NEW_USERS:      17,
  WEB_VIEWS:          18,
  WEB_EVENTS:         19,
  // GMB
  GMB_INTERACTIONS:   20,
  GMB_VIEWS:          21,
  GMB_SEARCHES:       22,
  GMB_REVIEWS:        23,
  // Email Marketing
  EMAIL_COUNT:        24,
  EMAIL_SENDS:        25,
  EMAIL_OPEN_RATE:    26,
} as const;

function num(
  row: (string | number | Date | null | undefined)[],
  col: number
): number | null {
  const val = row[col];
  if (val == null || val === "") return null;
  const n = Number(val);
  return isNaN(n) ? null : n;
}

export function toPeriod(val: string | number | null | undefined | Date): string | null {
  if (val == null || val === "") return null;

  if (val instanceof Date) {
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  }

  if (typeof val === "number") {
    const date = XLSX.SSF.parse_date_code(val);
    if (date) {
      const m = String(date.m).padStart(2, "0");
      return `${date.y}-${m}`;
    }
    return null;
  }

  const s = String(val).trim();
  if (/^\d{4}-\d{2}$/.test(s)) return s;

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

  if (sheetName && !workbook.Sheets[sheetName]) {
    throw new Error(
      `Sheet "${sheetName}" not found in the file. Available sheets: ${workbook.SheetNames.join(", ")}`
    );
  }

  const sheet = sheetName
    ? workbook.Sheets[sheetName]
    : workbook.Sheets[workbook.SheetNames[0]];

  if (!sheet) return [];

  const rows: (string | number | null | Date)[][] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: null,
    raw: true,
  });

  const results: ParsedReportRow[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const period = toPeriod(row[COL.PERIOD] as string | number | null | Date);
    if (!period) continue;

    results.push({
      period,
      instagram: {
        views:               num(row, COL.IG_VIEWS),
        contentInteractions: num(row, COL.IG_INTERACTIONS),
        follows:             num(row, COL.IG_FOLLOWS),
        numberOfPosts:       num(row, COL.IG_POSTS),
      },
      facebook: {
        views:               num(row, COL.FB_VIEWS),
        contentInteractions: num(row, COL.FB_INTERACTIONS),
        follows:             num(row, COL.FB_FOLLOWS),
        numberOfPosts:       num(row, COL.FB_POSTS),
      },
      tiktok: {
        views:               num(row, COL.TT_VIEWS),
        contentInteractions: num(row, COL.TT_INTERACTIONS),
        follows:             num(row, COL.TT_FOLLOWS),
        numberOfReels:       num(row, COL.TT_REELS),
      },
      youtube: {
        views:          num(row, COL.YT_VIEWS),
        subscribers:    num(row, COL.YT_SUBSCRIBERS),
        numberOfVideos: num(row, COL.YT_VIDEOS),
      },
      website: {
        totalUsers: num(row, COL.WEB_TOTAL_USERS),
        newUsers:   num(row, COL.WEB_NEW_USERS),
        views:      num(row, COL.WEB_VIEWS),
        eventCount: num(row, COL.WEB_EVENTS),
      },
      gmb: {
        profileInteractions: num(row, COL.GMB_INTERACTIONS),
        views:               num(row, COL.GMB_VIEWS),
        searches:            num(row, COL.GMB_SEARCHES),
        numberOfReviews:     num(row, COL.GMB_REVIEWS),
      },
      emailMarketing: {
        numberOfEmails: num(row, COL.EMAIL_COUNT),
        totalSends:     num(row, COL.EMAIL_SENDS),
        openRate:       num(row, COL.EMAIL_OPEN_RATE),
      },
    });
  }

  return results;
}

export function generateTemplate(): Buffer {
  const wb = XLSX.utils.book_new();

  const headers = [
    "Period (YYYY-MM)",
    // Instagram
    "IG Views", "IG Content Interactions", "IG Follows", "IG Number of Posts",
    // Facebook
    "FB Views", "FB Content Interactions", "FB Follows", "FB Number of Posts",
    // TikTok
    "TT Views", "TT Content Interactions", "TT Follows", "TT Number of Reels",
    // YouTube
    "YT Views", "YT Subscribers", "YT Number of Videos",
    // Website
    "Web Total Users", "Web New Users", "Web Views", "Web Event Count",
    // GMB
    "GMB Profile Interactions", "GMB Views", "GMB Searches", "GMB Number of Reviews",
    // Email
    "Email Number of Emails", "Email Total Sends", "Email Open Rate %",
  ];

  const sampleRow = [
    "2024-01",
    45000, 3200, 340, 12,
    28000, 1800, 120, 8,
    95000, 8400, 820, 25,
    32000, 5200, 15,
    11800, 3200, 38500, 540,
    940, 3200, 8700, 47,
    4, 2800, 24.5,
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, sampleRow]);
  ws["!cols"] = headers.map(() => ({ wch: 22 }));
  XLSX.utils.book_append_sheet(wb, ws, "client-slug");

  return Buffer.from(XLSX.write(wb, { type: "buffer", bookType: "xlsx" }));
}
