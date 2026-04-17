import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import PrintButton from "@/components/ui/PrintButton";
import ReportHeader from "@/components/reports/ReportHeader";
import SocialMediaSection from "@/components/reports/SocialMediaSection";
import WebsiteSection from "@/components/reports/WebsiteSection";
import GMBSection from "@/components/reports/GMBSection";
import TrendChartsSection from "@/components/reports/TrendChartsSection";
import EmailMarketingSection from "@/components/reports/EmailMarketingSection";
import { periodLabel } from "@/lib/report-utils";
import { buildTrendData } from "@/lib/build-trend-data";
import type { FullReport } from "@/types/report";

interface PageProps {
  params: Promise<{ month: string }>;
}

export default async function ClientMonthReportPage({ params }: PageProps) {
  const { month } = await params;
  const session = await auth();
  if (!session || session.user.role !== "CLIENT") redirect("/login");

  const clientId = session.user.clientId;
  if (!clientId) redirect("/client");

  // Fetch this report
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

  if (!report || report.status !== "PUBLISHED") notFound();

  // Fetch all published periods for prev/next navigation
  const allReports = await prisma.report.findMany({
    where: { clientId, status: "PUBLISHED" },
    orderBy: { period: "asc" },
    select: { period: true },
  });

  const currentIndex = allReports.findIndex((r) => r.period === month);
  const prevPeriod = currentIndex > 0 ? allReports[currentIndex - 1].period : null;
  const nextPeriod = currentIndex < allReports.length - 1 ? allReports[currentIndex + 1].period : null;

  // ── Historical trend data (last 6 published reports) ──────────────────────
  const historicalReports = await prisma.report.findMany({
    where: { clientId, status: "PUBLISHED" },
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

  const fullReport = report as unknown as FullReport;

  return (
    <div className="space-y-7">
      <div className="no-print flex justify-end">
        <PrintButton />
      </div>
      <ReportHeader
        clientName={report.client.name}
        period={report.period}
        status={report.status}
      />

      {/* Report Notes */}
      {report.notes && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5">
          <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide mb-1">Note from your team</p>
          <p className="text-sm text-indigo-900 whitespace-pre-wrap">{report.notes}</p>
        </div>
      )}

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

      {/* Prev / Next Navigation */}
      <div className="flex items-center justify-between pt-2">
        {prevPeriod ? (
          <Link
            href={`/client/reports/${prevPeriod}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 border border-indigo-200 bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            ← {periodLabel(prevPeriod)}
          </Link>
        ) : (
          <div />
        )}
        <Link
          href="/client/reports"
          className="text-sm text-gray-500 hover:text-gray-700 font-medium"
        >
          All Reports
        </Link>
        {nextPeriod ? (
          <Link
            href={`/client/reports/${nextPeriod}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 border border-indigo-200 bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            {periodLabel(nextPeriod)} →
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
