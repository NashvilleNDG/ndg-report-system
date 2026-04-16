import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { currentPeriod, periodLabel } from "@/lib/report-utils";
import ReportHeader from "@/components/reports/ReportHeader";
import SocialMediaSection from "@/components/reports/SocialMediaSection";
import WebsiteSection from "@/components/reports/WebsiteSection";
import GMBSection from "@/components/reports/GMBSection";
import PrintButton from "@/components/ui/PrintButton";
import type { FullReport } from "@/types/report";

export default async function ClientDashboardPage() {
  const session = await auth();
  if (!session || session.user.role !== "CLIENT") redirect("/login");

  const clientId = session.user.clientId;
  if (!clientId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-gray-800">Account not linked</p>
          <p className="text-sm text-gray-500 mt-1">Your account is not linked to a client profile. Please contact your administrator.</p>
        </div>
      </div>
    );
  }

  const period = currentPeriod();

  const report = await prisma.report.findUnique({
    where: { clientId_period: { clientId, period } },
    include: {
      client: { select: { name: true, slug: true, logoUrl: true } },
      socialMedia: { include: { instagram: true, facebook: true, youtube: true, tiktok: true } },
      websiteData: true,
      gmbData: true,
    },
  });

  if (!report || report.status !== "PUBLISHED") {
    // Check if there are any past reports
    const latestReport = await prisma.report.findFirst({
      where: { clientId, status: "PUBLISHED" },
      orderBy: { period: "desc" },
      select: { period: true },
    });

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
          <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <svg className="w-10 h-10 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800">Report not available yet</h2>
          <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
            Your <span className="font-medium">{periodLabel(period)}</span> report is being prepared by our team. You'll receive an email notification when it's ready.
          </p>
          {latestReport && (
            <a
              href={`/client/reports/${latestReport.period}`}
              className="inline-flex items-center gap-2 mt-6 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
            >
              View {periodLabel(latestReport.period)} Report
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          )}
        </div>
      </div>
    );
  }

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

      {report.notes && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-wide">Note from your team</p>
          </div>
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
    </div>
  );
}
