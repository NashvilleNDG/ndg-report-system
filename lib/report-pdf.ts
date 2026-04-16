/**
 * lib/report-pdf.ts
 * Server-side PDF generator for NDG monthly marketing reports.
 * Uses pdfkit — pure Node.js, no browser or bundler issues.
 */

import PDFDocument from "pdfkit";

import { periodLabel } from "./report-utils";
import type {
  FullReport,
  SocialPlatformData,
  YouTubePlatformData,
  WebsiteMetrics,
  GMBMetrics,
} from "@/types/report";

// ── Colours ───────────────────────────────────────────────────────────────────

const BRAND       = "#4f46e5";
const BRAND_DARK  = "#312e81";
const BRAND_LIGHT = "#ede9fe";
const TEAL        = "#0d9488";
const TEAL_LIGHT  = "#ccfbf1";
const ORANGE      = "#ea580c";
const ORANGE_LIGHT = "#ffedd5";
const EMERALD     = "#059669";
const RED         = "#dc2626";
const SLATE_900   = "#0f172a";
const SLATE_700   = "#334155";
const SLATE_500   = "#64748b";
const SLATE_300   = "#cbd5e1";
const SLATE_100   = "#f1f5f9";
const WHITE       = "#ffffff";

// ── Page constants ─────────────────────────────────────────────────────────────

const PW      = 595.28; // A4 width  (points)
const PH      = 841.89; // A4 height (points)
const MARGIN  = 36;
const BW      = PW - MARGIN * 2; // body width = 523.28
const FOOTER_Y = PH - 36;        // footer top

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

function pct(n: number | null | undefined): string {
  if (n == null) return "—";
  return n.toFixed(1) + "%";
}

// ── Drawing helpers ───────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Doc = InstanceType<typeof PDFDocument> & Record<string, any>;

function hline(doc: Doc, y: number, color = SLATE_300) {
  doc.moveTo(MARGIN, y).lineTo(MARGIN + BW, y).lineWidth(0.5).strokeColor(color).stroke();
}

function sectionHeading(doc: Doc, cy: number, label: string, sub: string, dotColor: string): number {
  // dot
  doc.circle(MARGIN + 5, cy + 6, 5).fillColor(dotColor).fill();
  // title
  doc.fillColor(SLATE_900).font("Helvetica-Bold").fontSize(11)
     .text(label, MARGIN + 16, cy, { lineBreak: false });
  // subtitle (offset after title approx width)
  const titleW = label.length * 6.5;
  doc.fillColor(SLATE_500).font("Helvetica").fontSize(7.5)
     .text(sub, MARGIN + 16 + titleW + 6, cy + 2, { lineBreak: false });
  cy += 18;
  hline(doc, cy);
  return cy + 10;
}

function statCard(
  doc: Doc,
  x: number, y: number, w: number, h: number,
  label: string, value: string,
  delta?: number | null,
  accentColor?: string
) {
  // background + border
  doc.roundedRect(x, y, w, h, 4).fillColor(WHITE).fill();
  doc.roundedRect(x, y, w, h, 4).lineWidth(0.5).strokeColor(SLATE_300).stroke();

  // label
  doc.fillColor(SLATE_500).font("Helvetica").fontSize(6)
     .text(label.toUpperCase(), x + 8, y + 7, { width: w - 16, lineBreak: false });

  // value
  const valColor = accentColor ?? SLATE_900;
  doc.fillColor(valColor).font("Helvetica-Bold").fontSize(13)
     .text(value, x + 8, y + 17, { width: w - 16, lineBreak: false });

  // delta arrow
  if (delta != null) {
    const isPos = delta >= 0;
    const arrow = isPos ? "+" : "−";
    const dStr  = arrow + fmt(Math.abs(delta));
    doc.fillColor(isPos ? EMERALD : RED).font("Helvetica-Bold").fontSize(7)
       .text(dStr, x + 8, y + 35, { width: w - 16, lineBreak: false });
  }
}

function platformBlock(
  doc: Doc,
  cy: number,
  name: string,
  color: string,
  data: SocialPlatformData | YouTubePlatformData,
  isYouTube: boolean
): number {
  const isYT = isYouTube;

  // Platform header bar
  doc.roundedRect(MARGIN, cy, BW, 26, 3).fillColor(color).fill();
  doc.fillColor(WHITE).font("Helvetica-Bold").fontSize(9.5)
     .text(name, MARGIN + 12, cy + 8, { lineBreak: false });

  // Engagement rate (right side of bar)
  if (data.engagement != null) {
    const engText = `Engagement: ${pct(data.engagement)}`;
    doc.fillColor("rgba(255,255,255,0.85)").font("Helvetica").fontSize(8)
       .text(engText, MARGIN, cy + 9, { width: BW - 12, align: "right", lineBreak: false });
  }
  cy += 30;

  // Stat cards
  const followers = isYT
    ? (data as YouTubePlatformData).subscribers
    : (data as SocialPlatformData).followers;
  const followersChange = isYT
    ? (data as YouTubePlatformData).subscribersChange
    : (data as SocialPlatformData).followersChange;
  const reach = isYT
    ? (data as YouTubePlatformData).views
    : (data as SocialPlatformData).reach;

  const cards = [
    { label: isYT ? "Subscribers" : "Followers", value: fmt(followers), delta: followersChange },
    { label: "Likes",                             value: fmt(data.likes) },
    { label: isYT ? "Views" : "Reach",            value: fmt(reach) },
    { label: "Impressions",                        value: fmt(data.impressions) },
  ];

  const GAP  = 8;
  const CARD_W = (BW - GAP * 3) / 4;
  const CARD_H = 50;

  cards.forEach((c, i) => {
    statCard(doc, MARGIN + i * (CARD_W + GAP), cy, CARD_W, CARD_H, c.label, c.value, c.delta);
  });

  return cy + CARD_H + 12;
}

function websiteBlock(doc: Doc, cy: number, x: number, w: number, data: WebsiteMetrics): number {
  // Header bar
  doc.roundedRect(x, cy, w, 26, 3).fillColor(TEAL).fill();
  doc.fillColor(WHITE).font("Helvetica-Bold").fontSize(9)
     .text("Website Analytics", x + 10, cy + 8, { lineBreak: false });
  cy += 30;

  const GAP    = 7;
  const CARD_W = (w - GAP) / 2;
  const CARD_H = 48;

  statCard(doc, x,           cy, CARD_W, CARD_H, "Sessions",    fmt(data.sessions));
  statCard(doc, x + CARD_W + GAP, cy, CARD_W, CARD_H, "Users", fmt(data.users));
  cy += CARD_H + GAP;

  statCard(doc, x,           cy, CARD_W, CARD_H, "Pageviews",   fmt(data.pageviews));
  statCard(doc, x + CARD_W + GAP, cy, CARD_W, CARD_H, "Conversions", fmt(data.conversions));
  cy += CARD_H + GAP;

  statCard(doc, x,           cy, CARD_W, CARD_H, "Bounce Rate", pct(data.bounceRate), undefined, SLATE_700);
  statCard(doc, x + CARD_W + GAP, cy, CARD_W, CARD_H, "Conversion Rate", pct(data.conversionRate), undefined, TEAL);
  cy += CARD_H;

  return cy;
}

function gmbBlock(doc: Doc, cy: number, x: number, w: number, data: GMBMetrics): number {
  // Header bar
  doc.roundedRect(x, cy, w, 26, 3).fillColor(ORANGE).fill();
  doc.fillColor(WHITE).font("Helvetica-Bold").fontSize(9)
     .text("Google My Business", x + 10, cy + 8, { lineBreak: false });
  cy += 30;

  const GAP    = 7;
  const CARD_W = (w - GAP) / 2;
  const CARD_H = 48;

  statCard(doc, x,           cy, CARD_W, CARD_H, "Profile Views",    fmt(data.profileViews));
  statCard(doc, x + CARD_W + GAP, cy, CARD_W, CARD_H, "Search Impr.",  fmt(data.searchImpressions));
  cy += CARD_H + GAP;

  statCard(doc, x,           cy, CARD_W, CARD_H, "Interactions", fmt(data.businessInteractions));
  statCard(doc, x + CARD_W + GAP, cy, CARD_W, CARD_H, "Clicks",   fmt(data.clicks));
  cy += CARD_H + GAP;

  statCard(doc, x,           cy, CARD_W, CARD_H, "Calls",  fmt(data.calls), undefined, ORANGE);
  statCard(doc, x + CARD_W + GAP, cy, CARD_W, CARD_H, "Direction Requests", fmt(data.directionRequests), undefined, ORANGE);
  cy += CARD_H;

  return cy;
}

// ── Main builder ──────────────────────────────────────────────────────────────

function buildPdf(doc: Doc, report: FullReport) {
  const period = periodLabel(report.period);
  const generatedAt = new Date().toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  // ── Header band ────────────────────────────────────────────────
  doc.rect(0, 0, PW, 68).fillColor(BRAND).fill();

  // Left: brand
  doc.fillColor(WHITE).font("Helvetica-Bold").fontSize(18)
     .text("NDG Reports", MARGIN, 16, { lineBreak: false });
  doc.fillColor("#c7d2fe").font("Helvetica").fontSize(7.5)
     .text("Nashville Digital Group · Analytics Platform", MARGIN, 40, { lineBreak: false });

  // Right: period + client
  doc.fillColor(WHITE).font("Helvetica-Bold").fontSize(11)
     .text(`${period} Report`, MARGIN, 18, { width: BW, align: "right", lineBreak: false });
  doc.fillColor("#c7d2fe").font("Helvetica").fontSize(8)
     .text(report.client.name, MARGIN, 36, { width: BW, align: "right", lineBreak: false });

  // ── Sub-header band ─────────────────────────────────────────────
  doc.rect(0, 68, PW, 26).fillColor(BRAND_DARK).fill();
  doc.fillColor("#a5b4fc").font("Helvetica").fontSize(7.5)
     .text("Monthly Marketing Performance Report", MARGIN, 77, { lineBreak: false });
  doc.fillColor("#a5b4fc").font("Helvetica").fontSize(7.5)
     .text(`Generated: ${generatedAt}`, MARGIN, 77, { width: BW, align: "right", lineBreak: false });

  // ── Footer band (drawn now so it's always at bottom) ───────────
  doc.rect(0, FOOTER_Y, PW, PH - FOOTER_Y).fillColor(SLATE_900).fill();
  doc.fillColor("#818cf8").font("Helvetica-Bold").fontSize(7.5)
     .text("NDG Reports", MARGIN, FOOTER_Y + 11, { lineBreak: false });
  doc.fillColor("#94a3b8").font("Helvetica").fontSize(7.5)
     .text(`  ·  Confidential — for ${report.client.name} only`, MARGIN + 68, FOOTER_Y + 11, { lineBreak: false });
  doc.fillColor("#94a3b8").font("Helvetica").fontSize(7.5)
     .text(`${period} · Nashville Digital Group`, MARGIN, FOOTER_Y + 11, { width: BW, align: "right", lineBreak: false });

  // ── Body ────────────────────────────────────────────────────────
  let cy = 108;

  // Notes callout
  if (report.notes) {
    const estimatedLines = Math.ceil(report.notes.length / 80);
    const boxH = 36 + estimatedLines * 12;
    doc.roundedRect(MARGIN, cy, BW, boxH, 4).fillColor(BRAND_LIGHT).fill();
    doc.rect(MARGIN, cy, 3, boxH).fillColor(BRAND).fill();
    doc.fillColor(BRAND).font("Helvetica-Bold").fontSize(6.5)
       .text("NOTE FROM YOUR TEAM", MARGIN + 12, cy + 8, { lineBreak: false });
    doc.fillColor("#3730a3").font("Helvetica").fontSize(8.5)
       .text(report.notes, MARGIN + 12, cy + 20, { width: BW - 24, lineBreak: true });
    cy += boxH + 14;
  }

  // Social Media
  const hasSocial = !!(report.socialMedia &&
    (report.socialMedia.instagram || report.socialMedia.facebook ||
     report.socialMedia.youtube   || report.socialMedia.tiktok));

  if (hasSocial) {
    cy = sectionHeading(doc, cy, "Social Media", "Performance across all platforms", BRAND);

    if (report.socialMedia?.instagram) {
      cy = platformBlock(doc, cy, "Instagram", "#c13584", report.socialMedia.instagram, false);
    }
    if (report.socialMedia?.facebook) {
      cy = platformBlock(doc, cy, "Facebook", "#1877f2", report.socialMedia.facebook, false);
    }
    if (report.socialMedia?.youtube) {
      cy = platformBlock(doc, cy, "YouTube", "#ff0000", report.socialMedia.youtube, true);
    }
    if (report.socialMedia?.tiktok) {
      cy = platformBlock(doc, cy, "TikTok", "#010101", report.socialMedia.tiktok, false);
    }

    cy += 6;
  }

  // Website + GMB
  const hasWebsite = !!report.websiteData;
  const hasGMB     = !!report.gmbData;

  if (hasWebsite || hasGMB) {
    if (cy > FOOTER_Y - 200) {
      doc.addPage();
      cy = 40;
    }

    cy = sectionHeading(doc, cy, "Website & Local", "Analytics & Google My Business", TEAL);

    if (hasWebsite && hasGMB) {
      const colW = (BW - 12) / 2;
      const endWebsite = websiteBlock(doc, cy, MARGIN,           colW, report.websiteData!);
      const endGmb     = gmbBlock(doc,     cy, MARGIN + colW + 12, colW, report.gmbData!);
      cy = Math.max(endWebsite, endGmb);
    } else if (hasWebsite) {
      cy = websiteBlock(doc, cy, MARGIN, BW, report.websiteData!);
    } else if (hasGMB) {
      cy = gmbBlock(doc, cy, MARGIN, BW, report.gmbData!);
    }
  }

  // No data fallback
  if (!hasSocial && !hasWebsite && !hasGMB) {
    doc.fillColor(SLATE_500).font("Helvetica").fontSize(10)
       .text("No data recorded for this period.", MARGIN, cy + 20, { width: BW, align: "center" });
  }
}

// ── Public API ─────────────────────────────────────────────────────────────────

export function generateReportPdf(report: FullReport): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const doc = new PDFDocument({ size: "A4", margin: 0, bufferPages: true }) as Doc;
    const chunks: Buffer[] = [];

    doc.on("data",  (chunk: Buffer) => chunks.push(chunk));
    doc.on("end",   () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    try {
      buildPdf(doc, report);
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
