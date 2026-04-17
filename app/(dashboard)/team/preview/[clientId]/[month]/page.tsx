import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ReportHeader from "@/components/reports/ReportHeader";
import SocialMediaSection from "@/components/reports/SocialMediaSection";
import WebsiteSection from "@/components/reports/WebsiteSection";
import GMBSection from "@/components/reports/GMBSection";
import TrendChartsSection from "@/components/reports/TrendChartsSection";
import EmailMarketingSection from "@/components/reports/EmailMarketingSection";
import Link from "next/link";
import PrintButton from "@/components/ui/PrintButton";
import { buildTrendData } from "@/lib/build-trend-data";
import type { FullReport } from "@/types/report";

interface PageProps {
  params: Promise<{ clientId: string; month: string }>;
}

export default async function PreviewReportPage({ params }: PageProps) {
  const { clientId, month } = await params;
  const session = await auth();

  if (!session) redirect("/login");
  const { role } = session.user;
  if (role !== "ADMIN" && role !== "TEAM") redirect("/login");

  const report = await prisma.report.findUnique({
    where: { clientId_period: { clientId, period: month } },
    include: {
      client: { select: { name: true, slug: true, logoUrl: true } },
      socialMedia: { include: { instagram: true, facebook: true, youtube: true, tiktok: true } },
      websiteData: true,
      gmbData: true,
      emailMarketing: true,
    },
  });

  if (!report) notFound();

  const fullReport = report as unknown as FullReport;
  const backUrl = role === "ADMIN" ? `/admin/clients/${clientId}` : `/team/entry/${clientId}/${month}`;

  // ── Historical trend data (last 6 reports for this client) ────────────────
  const historicalReports = await prisma.report.findMany({
    where: { clientId },
    orderBy: { period: "desc" },
    take: 6,
    select: {
      period: true,
      socialMedia: {
        select: {
          instagram: { select: { follows: true } },
          facebook:  { select: { follows: true } },
          youtube:   { select: { subscribers: true } },
          tiktok:    { select: { follows: true } },
        },
      },
      websiteData: { select: { views: true } },
      gmbData:     { select: { views: true } },
    },
  });
  historicalReports.reverse(); // chronological order (oldest → newest)
  const trendCharts = buildTrendData(historicalReports);

  return (
    <div className="space-y-7">
      {/* Preview Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-amber-500 text-lg">👁</span>
          <div>
            <p className="text-sm font-semibold text-amber-800">Preview Mode</p>
            <p className="text-xs text-amber-600">This is exactly how the client sees their report. Status: <span className={`font-semibold ${report.status === "PUBLISHED" ? "text-green-700" : "text-yellow-700"}`}>{report.status}</span></p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <PrintButton />
          {role === "ADMIN" && (
            <Link
              href={`/team/entry/${clientId}/${month}`}
              className="text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition-colors"
            >
              ✏️ Edit Data
            </Link>
          )}
          <Link
            href={backUrl}
            className="text-xs font-medium text-amber-700 hover:text-amber-900 border border-amber-300 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors"
          >
            ← Back
          </Link>
        </div>
      </div>

      <ReportHeader
        clientName={report.client.name}
        period={report.period}
        status={report.status}
      />

      {fullReport.socialMedia && (
        <SocialMediaSection
          instagram={fullReport.socialMedia.instagram}
          facebook={fullReport.socialMedia.facebook}
          youtube={fullReport.socialMedia.youtube}
          tiktok={fullReport.socialMedia.tiktok}
        />
      )}

      {fullReport.websiteData && <WebsiteSection data={fullReport.websiteData} />}
      {fullReport.gmbData && <GMBSection data={fullReport.gmbData} />}
      {fullReport.emailMarketing && <EmailMarketingSection data={fullReport.emailMarketing} />}

      {/* Historical Trend Charts */}
      {trendCharts.length > 0 && <TrendChartsSection charts={trendCharts} />}
    </div>
  );
}
