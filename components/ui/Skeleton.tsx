interface SkeletonProps {
  className?: string;
  lines?: number;
  circle?: boolean;
  width?: string;
  height?: string;
}

/** Single skeleton block */
export function Skeleton({ className = "", width, height }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height }}
    />
  );
}

/** Skeleton row with optional label width */
export function SkeletonText({ width = "100%", className = "" }: { width?: string; className?: string }) {
  return <div className={`skeleton skeleton-text ${className}`} style={{ width }} />;
}

/** Skeleton card for table rows */
export function SkeletonRow({ cols = 4 }: { cols?: number }) {
  const widths = ["40%", "25%", "20%", "15%", "10%", "30%"];
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="skeleton skeleton-text" style={{ width: widths[i % widths.length] }} />
        </td>
      ))}
    </tr>
  );
}

/** Full table skeleton — renders rows only (no tbody wrapper; parent supplies it) */
export function SkeletonTable({ rows = 4, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} cols={cols} />
      ))}
    </>
  );
}

/** Skeleton stat card */
export function SkeletonStatCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="skeleton skeleton-text" style={{ width: "45%" }} />
        <div className="skeleton skeleton-circle" style={{ width: 40, height: 40 }} />
      </div>
      <div className="skeleton skeleton-text lg" style={{ width: "30%" }} />
    </div>
  );
}

/** Skeleton client card */
export function SkeletonClientCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
      <div className="flex items-start gap-3">
        <div className="skeleton skeleton-circle flex-shrink-0" style={{ width: 40, height: 40 }} />
        <div className="flex-1 space-y-2">
          <div className="skeleton skeleton-text" style={{ width: "60%" }} />
          <div className="skeleton skeleton-text sm" style={{ width: "40%" }} />
        </div>
      </div>
      <div className="skeleton skeleton-text sm" style={{ width: "50%" }} />
      <div className="flex gap-2 pt-1 border-t border-gray-50">
        <div className="skeleton flex-1 rounded-xl" style={{ height: 38 }} />
        <div className="skeleton flex-1 rounded-xl" style={{ height: 38 }} />
      </div>
    </div>
  );
}
