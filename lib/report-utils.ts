export function formatNumber(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

export function formatPercent(n: number | null | undefined): string {
  if (n == null) return "—";
  return n.toFixed(1) + "%";
}

export function formatDelta(n: number | null | undefined): {
  text: string;
  positive: boolean;
} {
  if (n == null) return { text: "—", positive: true };
  const sign = n >= 0 ? "+" : "";
  return { text: `${sign}${formatNumber(n)}`, positive: n >= 0 };
}

export function periodLabel(period: string): string {
  const [year, month] = period.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function currentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function previousPeriods(count = 6): string[] {
  const periods: string[] = [];
  const now = new Date();
  for (let i = count; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    periods.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    );
  }
  return periods;
}
