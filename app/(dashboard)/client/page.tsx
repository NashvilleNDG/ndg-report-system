import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { periodLabel } from "@/lib/report-utils";
import ReportHeader from "@/components/reports/ReportHeader";
import SocialMediaSection from "@/components/reports/SocialMediaSection";
import WebsiteSection from "@/components/reports/WebsiteSection";
import GMBSection from "@/components/reports/GMBSection";
import EmailMarketingSection from "@/components/reports/EmailMarketingSection";
import Link from "next/link";
import type { FullReport } from "@/types/report";

/** Prisma select shape for previous-period comparison data */
const PREV_SELECT = {
  socialMedia: {
    select: {
      instagram: { select: { views: true, contentInteractions: true, follows: true, numberOfPosts: true } },
      facebook:  { select: { views: true, contentInteractions: true, follows: true, numberOfPosts: true } },
      youtube:   { select: { views: true, numberOfVideos: true } },
      tiktok:    { select: { views: true, contentInteractions: true, follows: true, numberOfReels: true } },
    },
  },
  websiteData:    { select: { totalUsers: true, newUsers: true, views: true, eventCount: true } },
  gmbData:        { select: { profileInteractions: true, views: true, searches: true, numberOfReviews: true } },
  emailMarketing: { select: { numberOfEmails: true, totalSends: true, openRate: true } },
} as const;

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

  // Fetch the most recent published report
  const latestReport = await prisma.report.findFirst({
    where: { clientId, status: "PUBLISHED" },
    orderBy: { period: "desc" },
    include: {
      client: { select: { name: true, slug: true, logoUrl: true } },
      socialMedia: { include: { instagram: true, facebook: true, youtube: true, tiktok: true } },
      websiteData: true,
      gmbData: true,
      emailMarketing: true,
    },
  });

  // Total published reports count
  const totalReports = await prisma.report.count({
    where: { clientId, status: "PUBLISHED" },
  });

  if (!latestReport) {
    return (
      <div className="space-y-6">
        {/* Welcome hero — no reports yet */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 rounded-2xl p-8 text-white shadow-lg">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
          </div>
          <div className="relative">
            <p className="text-indigo-200 text-sm font-medium mb-1">Welcome back</p>
            <h1 className="text-2xl font-bold text-white mb-2">Your dashboard is ready</h1>
            <p className="text-indigo-200 text-sm max-w-md">
              Your monthly marketing performance reports will appear here once they&apos;re published by your team.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
          <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <svg className="w-10 h-10 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800">No reports published yet</h2>
          <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
            Your team is preparing your first report. You&apos;ll be notified when it&apos;s ready.
          </p>
        </div>
      </div>
    );
  }

  // Fetch previous report for % change comparison
  const prevReport = await prisma.report.findFirst({
    where: { clientId, status: "PUBLISHED", period: { lt: latestReport.period } },
    orderBy: { period: "desc" },
    select: PREV_SELECT,
  });

  const fullReport = latestReport as unknown as FullReport;

  return (
    <div className="space-y-7">
      {/* ── Welcome Hero ──────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg shadow-indigo-200/40">
        {/* Decorative orbs */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-indigo-200 text-sm font-medium">Welcome back</p>
            <h1 className="text-2xl font-bold text-white mt-0.5">{latestReport.client.name}</h1>
            <p className="text-indigo-200 text-sm mt-1">
              Latest report: <span className="text-white font-semibold">{periodLabel(latestReport.period)}</span>
              {totalReports > 1 && (
                <span className="text-indigo-300"> · {totalReports} reports total</span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href="/client/reports"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/15 hover:bg-white/25 text-white text-sm font-semibold rounded-xl border border-white/20 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              All Reports
            </Link>
          </div>
        </div>
      </div>

      <ReportHeader
        clientName={latestReport.client.name}
        period={latestReport.period}
        status={latestReport.status}
        updatedAt={latestReport.updatedAt}
        clientView
      />

      {/* Notes from team */}
      {latestReport.notes && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-wide">Note from your team</p>
          </div>
          <p className="text-sm text-indigo-900 whitespace-pre-wrap">{latestReport.notes}</p>
        </div>
      )}

      {fullReport.socialMedia && (
        <SocialMediaSection
          instagram={fullReport.socialMedia.instagram}
          facebook={fullReport.socialMedia.facebook}
          youtube={fullReport.socialMedia.youtube}
          tiktok={fullReport.socialMedia.tiktok}
          prev={prevReport?.socialMedia ?? null}
        />
      )}

      {fullReport.websiteData && (
        <WebsiteSection data={fullReport.websiteData} prev={prevReport?.websiteData ?? null} />
      )}
      {fullReport.gmbData && (
        <GMBSection data={fullReport.gmbData} prev={prevReport?.gmbData ?? null} />
      )}
      {fullReport.emailMarketing && (
        <EmailMarketingSection data={fullReport.emailMarketing} prev={prevReport?.emailMarketing ?? null} />
      )}

      {/* View full report link */}
      <div className="flex justify-center pt-2">
        <Link
          href={`/client/reports/${latestReport.period}`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-indigo-200"
        >
          View Full Report with Trends
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
