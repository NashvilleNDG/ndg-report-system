import StatCard from "@/components/ui/StatCard";
import { formatNumber } from "@/lib/report-utils";
import type { GMBMetrics } from "@/types/report";

interface GMBSectionProps {
  data: GMBMetrics;
}

export default function GMBSection({ data }: GMBSectionProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">Google My Business</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-yellow-500 px-5 py-4 flex items-center gap-3">
          <span className="text-2xl">📍</span>
          <h3 className="text-lg font-bold text-white">GMB Profile</h3>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <StatCard
              label="Profile Views"
              value={formatNumber(data.profileViews)}
              icon="👁"
            />
            <StatCard
              label="Search Impressions"
              value={formatNumber(data.searchImpressions)}
              icon="🔍"
            />
            <StatCard
              label="Business Interactions"
              value={formatNumber(data.businessInteractions)}
              icon="🤝"
            />
            <StatCard
              label="Clicks"
              value={formatNumber(data.clicks)}
              icon="🖱"
            />
          </div>
          <div className="flex gap-6 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Calls:</span>
              <span className="font-bold text-gray-900">{formatNumber(data.calls)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Direction Requests:</span>
              <span className="font-bold text-gray-900">{formatNumber(data.directionRequests)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
