import StatCard from "@/components/ui/StatCard";
import { formatNumber, formatPercent } from "@/lib/report-utils";
import type { WebsiteMetrics } from "@/types/report";

interface WebsiteSectionProps {
  data: WebsiteMetrics;
}

export default function WebsiteSection({ data }: WebsiteSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
        </div>
        <h2 className="text-base font-bold text-gray-800">Website Performance</h2>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover-lift">
        <div className="bg-gradient-to-r from-teal-600 to-cyan-500 px-5 py-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-white">Website Analytics</h3>
          <div className="ml-auto flex items-center gap-4">
            <div className="glass px-3 py-1 rounded-full">
              <span className="text-white text-xs font-semibold">Bounce: {formatPercent(data.bounceRate)}</span>
            </div>
            <div className="glass px-3 py-1 rounded-full">
              <span className="text-white text-xs font-semibold">Conv: {formatPercent(data.conversionRate)}</span>
            </div>
          </div>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Sessions" value={formatNumber(data.sessions)} />
            <StatCard label="Users" value={formatNumber(data.users)} />
            <StatCard label="Pageviews" value={formatNumber(data.pageviews)} />
            <StatCard label="Conversions" value={formatNumber(data.conversions)} />
          </div>
        </div>
      </div>
    </div>
  );
}
