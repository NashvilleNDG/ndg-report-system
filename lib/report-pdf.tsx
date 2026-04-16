/**
 * lib/report-pdf.tsx
 * Server-side PDF generator for NDG monthly marketing reports.
 * Uses @react-pdf/renderer — no browser required.
 */

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  renderToBuffer,
} from "@react-pdf/renderer";
import { periodLabel } from "./report-utils";
import type { FullReport, SocialPlatformData, YouTubePlatformData, WebsiteMetrics, GMBMetrics } from "@/types/report";

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

function pct(n: number | null | undefined): string {
  if (n == null) return "—";
  return n.toFixed(1) + "%";
}

function delta(n: number | null | undefined): string {
  if (n == null) return "—";
  return (n >= 0 ? "+" : "") + fmt(n);
}

// ── Colour palette ────────────────────────────────────────────────────────────

const C = {
  brand:       "#4f46e5",   // indigo
  brandLight:  "#ede9fe",
  brandMid:    "#7c3aed",
  teal:        "#0d9488",
  tealLight:   "#ccfbf1",
  orange:      "#ea580c",
  orangeLight: "#ffedd5",
  emerald:     "#059669",
  emeraldLight:"#d1fae5",
  amber:       "#d97706",
  amberLight:  "#fef3c7",
  slate900:    "#0f172a",
  slate700:    "#334155",
  slate500:    "#64748b",
  slate300:    "#cbd5e1",
  slate100:    "#f1f5f9",
  white:       "#ffffff",
  red:         "#dc2626",
  redLight:    "#fee2e2",
};

// ── StyleSheet ────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: C.slate700,
    backgroundColor: "#f8fafc",
    paddingBottom: 60,
  },

  // Header band
  header: {
    backgroundColor: C.brand,
    paddingTop: 28,
    paddingBottom: 24,
    paddingHorizontal: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: { flexDirection: "column" },
  headerLogo: { color: C.white, fontSize: 18, fontFamily: "Helvetica-Bold", letterSpacing: 0.5 },
  headerSub: { color: "#c7d2fe", fontSize: 8, marginTop: 2 },
  headerRight: { alignItems: "flex-end" },
  headerPeriod: { color: C.white, fontSize: 11, fontFamily: "Helvetica-Bold" },
  headerClient: { color: "#c7d2fe", fontSize: 8, marginTop: 3 },

  // Sub-header / generated line
  subHeader: {
    backgroundColor: "#312e81",
    paddingHorizontal: 36,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  subHeaderText: { color: "#a5b4fc", fontSize: 7.5 },

  // Body wrapper
  body: { paddingHorizontal: 28, paddingTop: 22 },

  // Notes callout
  notesBox: {
    backgroundColor: C.brandLight,
    borderLeftWidth: 3,
    borderLeftColor: C.brand,
    borderRadius: 4,
    padding: 12,
    marginBottom: 18,
  },
  notesLabel: { color: C.brand, fontSize: 7, fontFamily: "Helvetica-Bold", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 },
  notesText: { color: "#3730a3", fontSize: 8.5, lineHeight: 1.5 },

  // Section
  section: { marginBottom: 18 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: C.slate300,
  },
  sectionDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  sectionTitle: { fontSize: 11, fontFamily: "Helvetica-Bold", color: C.slate900 },
  sectionSubtitle: { fontSize: 7.5, color: C.slate500, marginLeft: 6, marginTop: 1 },

  // Platform header
  platformRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  platformName: { color: C.white, fontSize: 9.5, fontFamily: "Helvetica-Bold" },

  // Stats grid
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 4 },
  statCard: {
    backgroundColor: C.white,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: C.slate300,
    padding: 10,
    width: "22.5%",
    flexDirection: "column",
  },
  statLabel: { fontSize: 7, color: C.slate500, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  statValue: { fontSize: 14, fontFamily: "Helvetica-Bold", color: C.slate900, marginBottom: 2 },
  statDelta: { fontSize: 7, fontFamily: "Helvetica-Bold" },
  statDeltaPos: { color: C.emerald },
  statDeltaNeg: { color: C.red },

  // Engagement pill
  engRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  engPill: {
    backgroundColor: C.brandLight,
    borderRadius: 99,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 6,
  },
  engText: { color: C.brand, fontSize: 7.5, fontFamily: "Helvetica-Bold" },
  engLabel: { color: C.slate500, fontSize: 7.5 },

  // Two-column layout for Website + GMB
  twoCol: { flexDirection: "row", gap: 12, marginBottom: 18 },
  col: { flex: 1 },

  // Divider
  divider: { height: 1, backgroundColor: C.slate100, marginVertical: 12 },

  // Footer
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: C.slate900,
    paddingHorizontal: 36,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerLeft: { color: "#94a3b8", fontSize: 7.5 },
  footerRight: { color: "#94a3b8", fontSize: 7.5 },
  footerBrand: { color: "#818cf8", fontSize: 7.5, fontFamily: "Helvetica-Bold" },
});

// ── Sub-components ────────────────────────────────────────────────────────────

function StatBox({ label, value, deltaVal, isChange = false }: { label: string; value: string; deltaVal?: string; isChange?: boolean }) {
  const isPos = deltaVal && !deltaVal.startsWith("-");
  return (
    <View style={s.statCard}>
      <Text style={s.statLabel}>{label}</Text>
      <Text style={s.statValue}>{value}</Text>
      {deltaVal && deltaVal !== "—" && (
        <Text style={[s.statDelta, isPos ? s.statDeltaPos : s.statDeltaNeg]}>
          {isPos ? "▲ " : "▼ "}{deltaVal.replace("+", "").replace("-", "")}
        </Text>
      )}
    </View>
  );
}

function PlatformSection({
  name,
  color,
  data,
  isYouTube = false,
}: {
  name: string;
  color: string;
  data: SocialPlatformData | YouTubePlatformData;
  isYouTube?: boolean;
}) {
  const followersLabel = isYouTube ? "Subscribers" : "Followers";
  const followersVal = isYouTube
    ? fmt((data as YouTubePlatformData).subscribers)
    : fmt((data as SocialPlatformData).followers);
  const followersChange = isYouTube
    ? delta((data as YouTubePlatformData).subscribersChange)
    : delta((data as SocialPlatformData).followersChange);
  const rawFollowersChange = isYouTube
    ? (data as YouTubePlatformData).subscribersChange
    : (data as SocialPlatformData).followersChange;
  const reachLabel = isYouTube ? "Views" : "Reach";
  const reachVal = isYouTube
    ? fmt((data as YouTubePlatformData).views)
    : fmt((data as SocialPlatformData).reach);

  return (
    <View style={{ marginBottom: 12 }}>
      <View style={[s.platformRow, { backgroundColor: color }]}>
        <Text style={s.platformName}>{name}</Text>
        {data.engagement != null && (
          <View style={[s.engPill, { marginLeft: "auto", backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <Text style={[s.engText, { color: C.white }]}>{pct(data.engagement)} engagement</Text>
          </View>
        )}
      </View>
      <View style={s.statsGrid}>
        <StatBox
          label={followersLabel}
          value={followersVal}
          deltaVal={rawFollowersChange != null ? followersChange : undefined}
        />
        <StatBox label="Likes" value={fmt(data.likes)} />
        <StatBox label={reachLabel} value={reachVal} />
        <StatBox label="Impressions" value={fmt(data.impressions)} />
      </View>
    </View>
  );
}

function WebsiteBlock({ data }: { data: WebsiteMetrics }) {
  return (
    <View style={s.col}>
      <View style={[s.platformRow, { backgroundColor: C.teal, marginBottom: 8 }]}>
        <Text style={s.platformName}>Website Analytics</Text>
      </View>
      <View style={s.statsGrid}>
        <StatBox label="Sessions" value={fmt(data.sessions)} />
        <StatBox label="Users" value={fmt(data.users)} />
        <StatBox label="Pageviews" value={fmt(data.pageviews)} />
        <StatBox label="Conversions" value={fmt(data.conversions)} />
      </View>
      <View style={{ flexDirection: "row", gap: 12, marginTop: 6 }}>
        <View style={[s.statCard, { width: "auto", flex: 1 }]}>
          <Text style={s.statLabel}>Bounce Rate</Text>
          <Text style={s.statValue}>{pct(data.bounceRate)}</Text>
        </View>
        <View style={[s.statCard, { width: "auto", flex: 1 }]}>
          <Text style={s.statLabel}>Conversion Rate</Text>
          <Text style={[s.statValue, { color: C.teal }]}>{pct(data.conversionRate)}</Text>
        </View>
      </View>
    </View>
  );
}

function GMBBlock({ data }: { data: GMBMetrics }) {
  return (
    <View style={s.col}>
      <View style={[s.platformRow, { backgroundColor: C.orange, marginBottom: 8 }]}>
        <Text style={s.platformName}>Google My Business</Text>
      </View>
      <View style={s.statsGrid}>
        <StatBox label="Profile Views" value={fmt(data.profileViews)} />
        <StatBox label="Search Impr." value={fmt(data.searchImpressions)} />
        <StatBox label="Interactions" value={fmt(data.businessInteractions)} />
        <StatBox label="Clicks" value={fmt(data.clicks)} />
      </View>
      <View style={{ flexDirection: "row", gap: 12, marginTop: 6 }}>
        <View style={[s.statCard, { width: "auto", flex: 1 }]}>
          <Text style={s.statLabel}>Calls</Text>
          <Text style={s.statValue}>{fmt(data.calls)}</Text>
        </View>
        <View style={[s.statCard, { width: "auto", flex: 1 }]}>
          <Text style={s.statLabel}>Direction Requests</Text>
          <Text style={[s.statValue, { color: C.orange }]}>{fmt(data.directionRequests)}</Text>
        </View>
      </View>
    </View>
  );
}

// ── Main Document ─────────────────────────────────────────────────────────────

function ReportDocument({ report }: { report: FullReport }) {
  const period = periodLabel(report.period);
  const generatedAt = new Date().toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  const hasSocial = report.socialMedia &&
    (report.socialMedia.instagram || report.socialMedia.facebook ||
     report.socialMedia.youtube || report.socialMedia.tiktok);
  const hasWebsite = !!report.websiteData;
  const hasGMB = !!report.gmbData;

  return (
    <Document
      title={`${report.client.name} — ${period} Marketing Report`}
      author="NDG Reports — Nashville Digital Group"
      subject="Monthly Marketing Performance Report"
      creator="NDG Reports"
    >
      <Page size="A4" style={s.page}>

        {/* ── Header ── */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <Text style={s.headerLogo}>NDG Reports</Text>
            <Text style={s.headerSub}>Nashville Digital Group · Analytics Platform</Text>
          </View>
          <View style={s.headerRight}>
            <Text style={s.headerPeriod}>{period} Report</Text>
            <Text style={s.headerClient}>{report.client.name}</Text>
          </View>
        </View>

        {/* ── Sub-header ── */}
        <View style={s.subHeader}>
          <Text style={s.subHeaderText}>Monthly Marketing Performance Report</Text>
          <Text style={s.subHeaderText}>Generated: {generatedAt}</Text>
        </View>

        {/* ── Body ── */}
        <View style={s.body}>

          {/* Notes */}
          {report.notes && (
            <View style={s.notesBox}>
              <Text style={s.notesLabel}>Note from your team</Text>
              <Text style={s.notesText}>{report.notes}</Text>
            </View>
          )}

          {/* Social Media */}
          {hasSocial && (
            <View style={s.section}>
              <View style={s.sectionHeader}>
                <View style={[s.sectionDot, { backgroundColor: C.brand }]} />
                <Text style={s.sectionTitle}>Social Media</Text>
                <Text style={s.sectionSubtitle}>Performance across all platforms</Text>
              </View>

              {report.socialMedia?.instagram && (
                <PlatformSection
                  name="Instagram"
                  color="linear-gradient(135deg, #ec4899, #8b5cf6)" // react-pdf doesn't support gradients; use flat fallback
                  data={report.socialMedia.instagram}
                />
              )}
              {report.socialMedia?.facebook && (
                <PlatformSection
                  name="Facebook"
                  color="#1877f2"
                  data={report.socialMedia.facebook}
                />
              )}
              {report.socialMedia?.youtube && (
                <PlatformSection
                  name="YouTube"
                  color="#ff0000"
                  data={report.socialMedia.youtube}
                  isYouTube
                />
              )}
              {report.socialMedia?.tiktok && (
                <PlatformSection
                  name="TikTok"
                  color="#010101"
                  data={report.socialMedia.tiktok}
                />
              )}
            </View>
          )}

          {/* Website + GMB side by side */}
          {(hasWebsite || hasGMB) && (
            <View style={s.section}>
              <View style={s.sectionHeader}>
                <View style={[s.sectionDot, { backgroundColor: C.teal }]} />
                <Text style={s.sectionTitle}>Website & Local</Text>
                <Text style={s.sectionSubtitle}>Analytics & Google My Business</Text>
              </View>
              <View style={s.twoCol}>
                {hasWebsite && <WebsiteBlock data={report.websiteData!} />}
                {hasGMB && <GMBBlock data={report.gmbData!} />}
              </View>
            </View>
          )}

          {/* No data fallback */}
          {!hasSocial && !hasWebsite && !hasGMB && (
            <View style={{ padding: 24, alignItems: "center" }}>
              <Text style={{ color: C.slate500, fontSize: 10 }}>No data recorded for this period.</Text>
            </View>
          )}

        </View>

        {/* ── Footer ── */}
        <View style={s.footer} fixed>
          <Text style={s.footerLeft}>
            <Text style={s.footerBrand}>NDG Reports</Text>
            {"  ·  "}Confidential — for {report.client.name} only
          </Text>
          <Text style={s.footerRight}>{period} · Nashville Digital Group</Text>
        </View>

      </Page>
    </Document>
  );
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function generateReportPdf(report: FullReport): Promise<Buffer> {
  const buffer = await renderToBuffer(<ReportDocument report={report} />);
  return Buffer.from(buffer);
}
