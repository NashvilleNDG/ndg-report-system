import StatCard from "@/components/ui/StatCard";
import { formatNumber } from "@/lib/report-utils";
import type { WebsiteMetrics } from "@/types/report";

interface WebsiteSectionProps {
  data: WebsiteMetrics;
  prev?: Partial<WebsiteMetrics> | null;
}

export default function WebsiteSection({ data, prev }: WebsiteSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-sm">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-900 leading-tight">Website Performance</h2>
          <p className="text-xs text-gray-400">Traffic &amp; engagement analytics</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover-lift">
        <div className="bg-gradient-to-r from-teal-600 to-cyan-500 px-5 py-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-white">Website Analytics</h3>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Total Users" value={formatNumber(data.totalUsers)} rawValue={data.totalUsers} prevValue={prev?.totalUsers} accent="teal" />
            <StatCard label="New Users"   value={formatNumber(data.newUsers)}   rawValue={data.newUsers}   prevValue={prev?.newUsers}   accent="teal" />
            <StatCard label="Visits"      value={formatNumber(data.views)}      rawValue={data.views}      prevValue={prev?.views}      accent="teal" />
            <StatCard label="Event Count" value={formatNumber(data.eventCount)} rawValue={data.eventCount} prevValue={prev?.eventCount} accent="teal" />
          </div>
        </div>
      </div>
    </div>
  );
}
