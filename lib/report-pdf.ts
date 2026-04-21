/**
 * lib/report-pdf.ts
 * Server-side PDF generator for NDG monthly marketing reports.
 * Uses pdfkit — pure Node.js, no browser or bundler issues.
 */

import PDFDocument from "pdfkit";
import path from "path";

import { periodLabel } from "./report-utils";
import type {
  FullReport,
  InstagramMetrics,
  FacebookMetrics,
  YouTubeMetrics,
  TikTokMetrics,
  WebsiteMetrics,
  GMBMetrics,
  EmailMarketingMetrics,
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

function socialBlock(
  doc: Doc,
  cy: number,
  name: string,
  color: string,
  cards: { label: string; value: string }[]
): number {
  doc.roundedRect(MARGIN, cy, BW, 26, 3).fillColor(color).fill();
  doc.fillColor(WHITE).font("Helvetica-Bold").fontSize(9.5)
     .text(name, MARGIN + 12, cy + 8, { lineBreak: false });
  cy += 30;

  const GAP    = 8;
  const CARD_W = (BW - GAP * (cards.length - 1)) / cards.length;
  const CARD_H = 50;

  cards.forEach((c, i) => {
    statCard(doc, MARGIN + i * (CARD_W + GAP), cy, CARD_W, CARD_H, c.label, c.value);
  });

  return cy + CARD_H + 12;
}

function instagramBlock(doc: Doc, cy: number, d: InstagramMetrics): number {
  return socialBlock(doc, cy, "Instagram", "#c13584", [
    { label: "Views",               value: fmt(d.views) },
    { label: "Content Interactions",value: fmt(d.contentInteractions) },
    { label: "Follows",             value: fmt(d.follows) },
    { label: "No. of Posts",        value: fmt(d.numberOfPosts) },
  ]);
}

function facebookBlock(doc: Doc, cy: number, d: FacebookMetrics): number {
  return socialBlock(doc, cy, "Facebook", "#1877f2", [
    { label: "Views",               value: fmt(d.views) },
    { label: "Content Interactions",value: fmt(d.contentInteractions) },
    { label: "Follows",             value: fmt(d.follows) },
    { label: "No. of Posts",        value: fmt(d.numberOfPosts) },
  ]);
}

function youtubeBlock(doc: Doc, cy: number, d: YouTubeMetrics): number {
  return socialBlock(doc, cy, "YouTube", "#ff0000", [
    { label: "Views",         value: fmt(d.views) },
    { label: "Subscribers",   value: fmt(d.subscribers) },
    { label: "No. of Videos", value: fmt(d.numberOfVideos) },
  ]);
}

function tiktokBlock(doc: Doc, cy: number, d: TikTokMetrics): number {
  return socialBlock(doc, cy, "TikTok", "#010101", [
    { label: "Views",               value: fmt(d.views) },
    { label: "Content Interactions",value: fmt(d.contentInteractions) },
    { label: "Follows",             value: fmt(d.follows) },
    { label: "No. of Reels",        value: fmt(d.numberOfReels) },
  ]);
}

function websiteBlock(doc: Doc, cy: number, x: number, w: number, data: WebsiteMetrics): number {
  doc.roundedRect(x, cy, w, 26, 3).fillColor(TEAL).fill();
  doc.fillColor(WHITE).font("Helvetica-Bold").fontSize(9)
     .text("Website Analytics", x + 10, cy + 8, { lineBreak: false });
  cy += 30;

  const GAP    = 7;
  const CARD_W = (w - GAP) / 2;
  const CARD_H = 48;

  statCard(doc, x,                cy, CARD_W, CARD_H, "Total Users", fmt(data.totalUsers));
  statCard(doc, x + CARD_W + GAP, cy, CARD_W, CARD_H, "New Users",  fmt(data.newUsers));
  cy += CARD_H + GAP;

  statCard(doc, x,                cy, CARD_W, CARD_H, "Views",       fmt(data.views));
  statCard(doc, x + CARD_W + GAP, cy, CARD_W, CARD_H, "Event Count", fmt(data.eventCount));
  cy += CARD_H;

  return cy;
}

function gmbBlock(doc: Doc, cy: number, x: number, w: number, data: GMBMetrics): number {
  doc.roundedRect(x, cy, w, 26, 3).fillColor(ORANGE).fill();
  doc.fillColor(WHITE).font("Helvetica-Bold").fontSize(9)
     .text("Google My Business", x + 10, cy + 8, { lineBreak: false });
  cy += 30;

  const GAP    = 7;
  const CARD_W = (w - GAP) / 2;
  const CARD_H = 48;

  statCard(doc, x,                cy, CARD_W, CARD_H, "Profile Interactions", fmt(data.profileInteractions));
  statCard(doc, x + CARD_W + GAP, cy, CARD_W, CARD_H, "Views",               fmt(data.views));
  cy += CARD_H + GAP;

  statCard(doc, x,                cy, CARD_W, CARD_H, "Searches",         fmt(data.searches));
  statCard(doc, x + CARD_W + GAP, cy, CARD_W, CARD_H, "Number of Reviews",fmt(data.numberOfReviews));
  cy += CARD_H;

  return cy;
}

function emailBlock(doc: Doc, cy: number, data: EmailMarketingMetrics): number {
  const PURPLE = "#7c3aed";
  doc.roundedRect(MARGIN, cy, BW, 26, 3).fillColor(PURPLE).fill();
  doc.fillColor(WHITE).font("Helvetica-Bold").fontSize(9.5)
     .text("Email Marketing", MARGIN + 12, cy + 8, { lineBreak: false });
  cy += 30;

  const GAP    = 8;
  const CARD_W = (BW - GAP * 2) / 3;
  const CARD_H = 50;

  statCard(doc, MARGIN,                   cy, CARD_W, CARD_H, "No. of Emails", fmt(data.numberOfEmails));
  statCard(doc, MARGIN + CARD_W + GAP,    cy, CARD_W, CARD_H, "Total Sends",   fmt(data.totalSends));
  statCard(doc, MARGIN + (CARD_W + GAP)*2, cy, CARD_W, CARD_H, "Open Rate",    pct(data.openRate), undefined, PURPLE);

  return cy + CARD_H + 12;
}

// ── Main builder ──────────────────────────────────────────────────────────────

function buildPdf(doc: Doc, report: FullReport) {
  const period = periodLabel(report.period);
  const generatedAt = new Date().toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  // ── Header band ────────────────────────────────────────────────
  doc.rect(0, 0, PW, 68).fillColor(BRAND).fill();

  // Left: logo image (transparent PNG sits over the brand colour band)
  const logoPath = path.join(process.cwd(), "public", "ndg-logo-transparent.png");
  try {
    doc.image(logoPath, MARGIN, 10, { height: 48, fit: [220, 48] });
  } catch {
    // Fallback to text if image can't be loaded
    doc.fillColor(WHITE).font("Helvetica-Bold").fontSize(18)
       .text("NDG Reports", MARGIN, 16, { lineBreak: false });
    doc.fillColor("#c7d2fe").font("Helvetica").fontSize(7.5)
       .text("Nashville Digital Group · Analytics Platform", MARGIN, 40, { lineBreak: false });
  }

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

  // ── Social Media ────────────────────────────────────────────────
  const hasSocial = !!(report.socialMedia &&
    (report.socialMedia.instagram || report.socialMedia.facebook ||
     report.socialMedia.youtube   || report.socialMedia.tiktok));

  if (hasSocial) {
    cy = sectionHeading(doc, cy, "Social Media", "Performance across all platforms", BRAND);
    if (report.socialMedia?.instagram) cy = instagramBlock(doc, cy, report.socialMedia.instagram);
    if (report.socialMedia?.facebook)  cy = facebookBlock(doc,  cy, report.socialMedia.facebook);
    if (report.socialMedia?.youtube)   cy = youtubeBlock(doc,   cy, report.socialMedia.youtube);
    if (report.socialMedia?.tiktok)    cy = tiktokBlock(doc,    cy, report.socialMedia.tiktok);
    cy += 6;
  }

  // ── Website + GMB ────────────────────────────────────────────────
  const hasWebsite = !!report.websiteData;
  const hasGMB     = !!report.gmbData;

  if (hasWebsite || hasGMB) {
    if (cy > FOOTER_Y - 200) { doc.addPage(); cy = 40; }
    cy = sectionHeading(doc, cy, "Website & Local", "Analytics & Google My Business", TEAL);

    if (hasWebsite && hasGMB) {
      const colW = (BW - 12) / 2;
      const endWebsite = websiteBlock(doc, cy, MARGIN,             colW, report.websiteData!);
      const endGmb     = gmbBlock(doc,     cy, MARGIN + colW + 12, colW, report.gmbData!);
      cy = Math.max(endWebsite, endGmb);
    } else if (hasWebsite) {
      cy = websiteBlock(doc, cy, MARGIN, BW, report.websiteData!);
    } else if (hasGMB) {
      cy = gmbBlock(doc, cy, MARGIN, BW, report.gmbData!);
    }
    cy += 6;
  }

  // ── Email Marketing ──────────────────────────────────────────────
  if (report.emailMarketing) {
    if (cy > FOOTER_Y - 120) { doc.addPage(); cy = 40; }
    cy = sectionHeading(doc, cy, "Email Marketing", "Campaign performance", "#7c3aed");
    cy = emailBlock(doc, cy, report.emailMarketing);
  }

  // ── No data fallback ─────────────────────────────────────────────
  if (!hasSocial && !hasWebsite && !hasGMB && !report.emailMarketing) {
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
