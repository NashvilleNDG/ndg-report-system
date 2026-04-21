import { google } from "googleapis";
import { Readable } from "stream";
import { toPeriod } from "./excel-parser";

// ── Auth ──────────────────────────────────────────────────────────────────────

function getAuth() {
  const json = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!json) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is not set");
  const credentials = JSON.parse(json);
  return new google.auth.GoogleAuth({
    credentials,
    scopes: [
      "https://www.googleapis.com/auth/drive",           // read + write Drive files
      "https://www.googleapis.com/auth/spreadsheets",    // read + write Google Sheets
    ],
  });
}

// ── MIME types ────────────────────────────────────────────────────────────────

const XLSX_MIME   = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const GSHEET_MIME = "application/vnd.google-apps.spreadsheet";

// ── Column helpers ────────────────────────────────────────────────────────────

/** Convert 0-based column index to Sheets letter (0→A, 25→Z, 26→AA …) */
function colLetter(zeroIdx: number): string {
  let n = zeroIdx + 1;
  let result = "";
  while (n > 0) {
    n--;
    result = String.fromCharCode(65 + (n % 26)) + result;
    n = Math.floor(n / 26);
  }
  return result;
}

// ── Write-back data shape ─────────────────────────────────────────────────────

export interface DriveWriteData {
  instagram?:      { views?: number | null; contentInteractions?: number | null; follows?: number | null; numberOfPosts?: number | null } | null;
  facebook?:       { views?: number | null; contentInteractions?: number | null; follows?: number | null; numberOfPosts?: number | null } | null;
  tiktok?:         { views?: number | null; contentInteractions?: number | null; follows?: number | null; numberOfReels?: number | null } | null;
  youtube?:        { views?: number | null; subscribers?: number | null; numberOfVideos?: number | null } | null;
  website?:        { totalUsers?: number | null; newUsers?: number | null; views?: number | null; eventCount?: number | null } | null;
  gmb?:            { profileInteractions?: number | null; views?: number | null; searches?: number | null; numberOfReviews?: number | null } | null;
  emailMarketing?: { numberOfEmails?: number | null; totalSends?: number | null; openRate?: number | null } | null;
}

/** Build the 27-column row array matching the Excel column layout exactly. */
function buildRowValues(period: string, d: DriveWriteData): (number | string | null)[] {
  return [
    period,
    // Instagram (cols 1-4)
    d.instagram?.views               ?? null,
    d.instagram?.contentInteractions ?? null,
    d.instagram?.follows             ?? null,
    d.instagram?.numberOfPosts       ?? null,
    // Facebook (cols 5-8)
    d.facebook?.views                ?? null,
    d.facebook?.contentInteractions  ?? null,
    d.facebook?.follows              ?? null,
    d.facebook?.numberOfPosts        ?? null,
    // TikTok (cols 9-12)
    d.tiktok?.views                  ?? null,
    d.tiktok?.contentInteractions    ?? null,
    d.tiktok?.follows                ?? null,
    d.tiktok?.numberOfReels          ?? null,
    // YouTube (cols 13-15)
    d.youtube?.views                 ?? null,
    d.youtube?.subscribers           ?? null,
    d.youtube?.numberOfVideos        ?? null,
    // Website (cols 16-19)
    d.website?.totalUsers            ?? null,
    d.website?.newUsers              ?? null,
    d.website?.views                 ?? null,
    d.website?.eventCount            ?? null,
    // GMB (cols 20-23)
    d.gmb?.profileInteractions       ?? null,
    d.gmb?.views                     ?? null,
    d.gmb?.searches                  ?? null,
    d.gmb?.numberOfReviews           ?? null,
    // Email Marketing (cols 24-26)
    d.emailMarketing?.numberOfEmails ?? null,
    d.emailMarketing?.totalSends     ?? null,
    d.emailMarketing?.openRate       ?? null,
  ];
}

// ── Read helpers ──────────────────────────────────────────────────────────────

export async function downloadDriveFile(fileId: string): Promise<Buffer> {
  const auth  = getAuth();
  const drive = google.drive({ version: "v3", auth });

  const meta     = await drive.files.get({ fileId, fields: "mimeType,name" });
  const mimeType = meta.data.mimeType ?? "";

  if (mimeType === GSHEET_MIME) {
    const response = await drive.files.export(
      { fileId, mimeType: XLSX_MIME },
      { responseType: "arraybuffer" }
    );
    return Buffer.from(response.data as ArrayBuffer);
  } else {
    const response = await drive.files.get(
      { fileId, alt: "media" },
      { responseType: "arraybuffer" }
    );
    return Buffer.from(response.data as ArrayBuffer);
  }
}

export async function getDriveFileName(fileId: string): Promise<string> {
  const auth  = getAuth();
  const drive = google.drive({ version: "v3", auth });
  const res   = await drive.files.get({ fileId, fields: "name" });
  return res.data.name ?? fileId;
}

// ── Write-back ────────────────────────────────────────────────────────────────

/**
 * Write updated report data back into the connected Google Drive file.
 *
 * • Google Sheets  → uses the Sheets API to update / append the matching row in-place
 * • Regular .xlsx  → downloads the file, modifies the row in memory, re-uploads
 *
 * NOTE: the service account must have **Editor** access to the file
 * (not just Viewer) for this to succeed.
 */
export async function writeBackToDrive(
  fileId:    string,
  sheetName: string | null,
  period:    string,
  data:      DriveWriteData,
): Promise<void> {
  const auth  = getAuth();
  const drive = google.drive({ version: "v3", auth });

  const meta     = await drive.files.get({ fileId, fields: "mimeType,name" });
  const mimeType = meta.data.mimeType ?? "";

  const rowValues = buildRowValues(period, data);
  const lastCol   = colLetter(rowValues.length - 1); // "AA" for 27 columns

  // ── Google Sheets ────────────────────────────────────────────────────────
  if (mimeType === GSHEET_MIME) {
    const sheets = google.sheets({ version: "v4", auth });
    const tab    = sheetName ?? "Sheet1";

    // Fetch period column to locate the right row
    const getRes = await sheets.spreadsheets.values.get({
      spreadsheetId: fileId,
      range: `'${tab}'!A:A`,
    });

    const col0  = getRes.data.values ?? [];
    let rowNum  = -1; // 1-indexed Sheets row number

    for (let i = 1; i < col0.length; i++) {
      const cellPeriod = toPeriod(col0[i]?.[0]);
      if (cellPeriod === period) { rowNum = i + 1; break; }
    }

    if (rowNum === -1) {
      // Period not in sheet yet — append a new row
      await sheets.spreadsheets.values.append({
        spreadsheetId:    fileId,
        range:            `'${tab}'!A:${lastCol}`,
        valueInputOption: "USER_ENTERED",
        requestBody:      { values: [rowValues.map(v => v ?? "")] },
      });
    } else {
      // Update the existing row
      await sheets.spreadsheets.values.update({
        spreadsheetId:    fileId,
        range:            `'${tab}'!A${rowNum}:${lastCol}${rowNum}`,
        valueInputOption: "USER_ENTERED",
        requestBody:      { values: [rowValues.map(v => v ?? "")] },
      });
    }

    return;
  }

  // ── Regular .xlsx ────────────────────────────────────────────────────────
  const dlRes = await drive.files.get(
    { fileId, alt: "media" },
    { responseType: "arraybuffer" }
  );
  const buffer = Buffer.from(dlRes.data as ArrayBuffer);

  // Dynamic import keeps xlsx out of the edge bundle
  const XLSX  = await import("xlsx");
  const wb    = XLSX.read(buffer, { type: "buffer", cellDates: true });
  const tab   = sheetName ?? wb.SheetNames[0];
  const ws    = wb.Sheets[tab];
  if (!ws) throw new Error(`Sheet "${tab}" not found in the xlsx file`);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null, raw: true });

  // Find the matching period row (skip header at index 0)
  let rowIdx = -1;
  for (let i = 1; i < rows.length; i++) {
    if (toPeriod(rows[i][0]) === period) { rowIdx = i; break; }
  }

  if (rowIdx === -1) {
    // Append new row
    rows.push(rowValues);
  } else {
    // Overwrite columns 0-26 in the existing row, leave any extra columns intact
    rowValues.forEach((v, col) => { rows[rowIdx][col] = v; });
  }

  // Rebuild sheet and generate new buffer
  wb.Sheets[tab] = XLSX.utils.aoa_to_sheet(rows);
  const newBuffer = Buffer.from(XLSX.write(wb, { type: "buffer", bookType: "xlsx" }));

  // Re-upload, overwriting the same Drive file
  await drive.files.update({
    fileId,
    media: { mimeType: XLSX_MIME, body: Readable.from(newBuffer) },
  });
}
