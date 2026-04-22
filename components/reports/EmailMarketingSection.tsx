import StatCard from "@/components/ui/StatCard";
import { formatNumber } from "@/lib/report-utils";
import type { EmailMarketingMetrics } from "@/types/report";

interface EmailMarketingSectionProps {
  data: EmailMarketingMetrics;
  prev?: Partial<EmailMarketingMetrics> | null;
}

export default function EmailMarketingSection({ data, prev }: EmailMarketingSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-900 leading-tight">Email Marketing</h2>
          <p className="text-xs text-gray-400">Campaign sends &amp; engagement</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover-lift">
        <div className="bg-gradient-to-r from-violet-600 to-purple-500 px-5 py-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-white">Email Campaigns</h3>
          {data.openRate != null && (
            <div className="ml-auto glass px-3 py-1 rounded-full">
              <span className="text-white text-xs font-semibold">{data.openRate.toFixed(1)}% Open Rate</span>
            </div>
          )}
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Number of Emails" value={formatNumber(data.numberOfEmails)} rawValue={data.numberOfEmails} prevValue={prev?.numberOfEmails} accent="violet" />
            <StatCard label="Total Sends"       value={formatNumber(data.totalSends)}     rawValue={data.totalSends}     prevValue={prev?.totalSends}     accent="violet" />
            {data.openRate != null && (
              <StatCard label="Open Rate" value={`${data.openRate.toFixed(1)}%`} accent="violet" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
