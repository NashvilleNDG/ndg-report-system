import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { currentPeriod } from "@/lib/report-utils";
import ReportHeader from "@/components/reports/ReportHeader";
import SocialMediaSection from "@/components/reports/SocialMediaSection";
import WebsiteSection from "@/components/reports/WebsiteSection";
import GMBSection from "@/components/reports/GMBSection";
import type { FullReport } from "@/types/report";

export default async function ClientDashboardPage() {
  const session = await auth();
  if (!session || session.user.role !== "CLIENT") redirect("/login");

  const clientId = session.user.clientId;
  if (!clientId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-gray-400">
          <p className="text-lg font-medium">Account not linked</p>
          <p className="text-sm mt-1">Your account is not linked to a client profile. Contact your administrator.</p>
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
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="text-4xl mb-3">📊</div>
          <h2 className="text-lg font-semibold text-gray-800">No report available yet</h2>
          <p className="text-sm text-gray-500 mt-1">
            Your report for this period is being prepared. Check back soon.
          </p>
        </div>
      </div>
    );
  }

  const fullReport = report as unknown as FullReport;

  return (
    <div className="space-y-7">
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
    </div>
  );
}
