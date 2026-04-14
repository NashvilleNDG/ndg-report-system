import { google } from "googleapis";

function getAuth() {
  const json = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!json) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is not set");
  }
  const credentials = JSON.parse(json);
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });
}

const XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const GSHEET_MIME = "application/vnd.google-apps.spreadsheet";

export async function downloadDriveFile(fileId: string): Promise<Buffer> {
  const auth = getAuth();
  const drive = google.drive({ version: "v3", auth });

  // Check the file's mimeType first
  const meta = await drive.files.get({ fileId, fields: "mimeType,name" });
  const mimeType = meta.data.mimeType ?? "";

  if (mimeType === GSHEET_MIME) {
    // Google Sheets — must export as xlsx
    const response = await drive.files.export(
      { fileId, mimeType: XLSX_MIME },
      { responseType: "arraybuffer" }
    );
    return Buffer.from(response.data as ArrayBuffer);
  } else {
    // Regular xlsx file — download directly
    const response = await drive.files.get(
      { fileId, alt: "media" },
      { responseType: "arraybuffer" }
    );
    return Buffer.from(response.data as ArrayBuffer);
  }
}

export async function getDriveFileName(fileId: string): Promise<string> {
  const auth = getAuth();
  const drive = google.drive({ version: "v3", auth });

  const response = await drive.files.get({
    fileId,
    fields: "name",
  });

  return response.data.name ?? fileId;
}
