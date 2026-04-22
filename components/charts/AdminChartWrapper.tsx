"use client";

import dynamic from "next/dynamic";

const PublishedTrendChart = dynamic(
  () => import("@/components/charts/PublishedTrendChart"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[200px] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    ),
  }
);

export default function AdminChartWrapper({
  data,
}: {
  data: { month: string; count: number }[];
}) {
  return <PublishedTrendChart data={data} />;
}
