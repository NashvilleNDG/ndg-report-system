import StatCard from "@/components/ui/StatCard";
import { formatNumber, formatPercent } from "@/lib/report-utils";
import type { WebsiteMetrics } from "@/types/report";

interface WebsiteSectionProps {
  data: WebsiteMetrics;
}

export default function WebsiteSection({ data }: WebsiteSectionProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">Website Performance</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-teal-600 to-cyan-500 px-5 py-4 flex items-center gap-3">
          <span className="text-2xl">🌐</span>
          <h3 className="text-lg font-bold text-white">Website</h3>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <StatCard label="Sessions" value={formatNumber(data.sessions)} />
            <StatCard label="Users" value={formatNumber(data.users)} />
            <StatCard label="Pageviews" value={formatNumber(data.pageviews)} />
            <StatCard label="Conversions" value={formatNumber(data.conversions)} />
          </div>
          <div className="flex gap-4 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Bounce Rate:</span>
              <span className="font-bold text-gray-900">{formatPercent(data.bounceRate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Conversion Rate:</span>
              <span className="font-bold text-indigo-600">{formatPercent(data.conversionRate)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
