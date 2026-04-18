import StatCard from "@/components/ui/StatCard";
import { formatNumber } from "@/lib/report-utils";
import type { GMBMetrics } from "@/types/report";

export default function GMBSection({ data }: { data: GMBMetrics }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-sm">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-900 leading-tight">Google My Business</h2>
          <p className="text-xs text-gray-400">Local search &amp; profile performance</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover-lift">
        <div className="bg-gradient-to-r from-orange-500 to-amber-400 px-5 py-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/20">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C7.802 0 4 3.403 4 7.602C4 11.8 7.469 16.812 12 24C16.531 16.812 20 11.8 20 7.602C20 3.403 16.199 0 12 0ZM12 11C10.343 11 9 9.657 9 8C9 6.343 10.343 5 12 5C13.657 5 15 6.343 15 8C15 9.657 13.657 11 12 11Z"/>
            </svg>
          </div>
          <h3 className="text-base font-bold text-white">GMB Profile</h3>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Profile Interactions" value={formatNumber(data.profileInteractions)} accent="orange" />
            <StatCard label="Views"                value={formatNumber(data.views)} accent="orange" />
            <StatCard label="Searches"             value={formatNumber(data.searches)} accent="orange" />
            <StatCard label="Number of Reviews"    value={formatNumber(data.numberOfReviews)} accent="orange" />
          </div>
        </div>
      </div>
    </div>
  );
}
