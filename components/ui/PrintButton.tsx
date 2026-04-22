"use client";

interface PrintButtonProps {
  /** "default" = light card style; "ghost" = white/translucent for dark backgrounds */
  variant?: "default" | "ghost";
}

export default function PrintButton({ variant = "default" }: PrintButtonProps) {
  const styles =
    variant === "ghost"
      ? "bg-white/15 hover:bg-white/25 text-white border border-white/20"
      : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 shadow-sm";

  return (
    <button
      onClick={() => window.print()}
      className={`no-print inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-colors ${styles}`}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      Download PDF
    </button>
  );
}
