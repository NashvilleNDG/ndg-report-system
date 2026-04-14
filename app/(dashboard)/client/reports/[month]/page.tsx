import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ReportHeader from "@/components/reports/ReportHeader";
import SocialMediaSection from "@/components/reports/SocialMediaSection";
import WebsiteSection from "@/components/reports/WebsiteSection";
import GMBSection from "@/components/reports/GMBSection";
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

  const report = await prisma.report.findUnique({
    where: { clientId_period: { clientId, period: month } },
    include: {
      client: { select: { name: true, slug: true, logoUrl: true } },
      socialMedia: { include: { instagram: true, facebook: true, youtube: true, tiktok: true } },
      websiteData: true,
      gmbData: true,
    },
  });

  if (!report || report.status !== "PUBLISHED") notFound();

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

      <div className="flex justify-end">
        <a
          href={`/client/reports`}
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
        >
          ← Back to all reports
        </a>
      </div>
    </div>
  );
}
