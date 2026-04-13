"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { periodLabel } from "@/lib/report-utils";

const TABS = ["Instagram", "Facebook", "YouTube", "TikTok", "Website", "GMB"] as const;
type Tab = typeof TABS[number];

const SOCIAL_FIELDS = [
  { key: "followers", label: "Followers" },
  { key: "followersChange", label: "Followers Change" },
  { key: "likes", label: "Likes" },
  { key: "reach", label: "Reach" },
  { key: "impressions", label: "Impressions" },
  { key: "engagement", label: "Engagement (%)", isFloat: true },
];

const YOUTUBE_FIELDS = [
  { key: "subscribers", label: "Subscribers" },
  { key: "subscribersChange", label: "Subscribers Change" },
  { key: "likes", label: "Likes" },
  { key: "views", label: "Views" },
  { key: "impressions", label: "Impressions" },
  { key: "engagement", label: "Engagement (%)", isFloat: true },
];

const WEBSITE_FIELDS = [
  { key: "sessions", label: "Sessions" },
  { key: "users", label: "Users" },
  { key: "pageviews", label: "Pageviews" },
  { key: "bounceRate", label: "Bounce Rate (%)", isFloat: true },
  { key: "conversions", label: "Conversions" },
  { key: "conversionRate", label: "Conversion Rate (%)", isFloat: true },
];

const GMB_FIELDS = [
  { key: "profileViews", label: "Profile Views" },
  { key: "searchImpressions", label: "Search Impressions" },
  { key: "businessInteractions", label: "Business Interactions" },
  { key: "clicks", label: "Clicks" },
  { key: "calls", label: "Calls" },
  { key: "directionRequests", label: "Direction Requests" },
];

type FormValues = Record<string, string>;

function FieldGroup({
  fields,
  values,
  onChange,
}: {
  fields: { key: string; label: string; isFloat?: boolean }[];
  values: FormValues;
  onChange: (key: string, val: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {fields.map(({ key, label }) => (
        <div key={key}>
          <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
          <input
            type="number"
            step="any"
            value={values[key] ?? ""}
            onChange={(e) => onChange(key, e.target.value)}
            placeholder="—"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      ))}
    </div>
  );
}

function parseFormToNumbers(values: FormValues): Record<string, number | null> {
  return Object.fromEntries(
    Object.entries(values).map(([k, v]) => [k, v === "" ? null : Number(v)])
  );
}

export default function TeamEntryPage() {
  const params = useParams<{ clientId: string; month: string }>();
  const { clientId, month } = params;

  const [activeTab, setActiveTab] = useState<Tab>("Instagram");
  const [reportId, setReportId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [clientName, setClientName] = useState("");

  // Per-tab form state
  const [instagram, setInstagram] = useState<FormValues>({});
  const [facebook, setFacebook] = useState<FormValues>({});
  const [youtube, setYoutube] = useState<FormValues>({});
  const [tiktok, setTiktok] = useState<FormValues>({});
  const [website, setWebsite] = useState<FormValues>({});
  const [gmb, setGmb] = useState<FormValues>({});

  useEffect(() => {
    const init = async () => {
      // Fetch client name
      const clientRes = await fetch("/api/clients");
      if (clientRes.ok) {
        const clients: { id: string; name: string }[] = await clientRes.json();
        const c = clients.find((x) => x.id === clientId);
        if (c) setClientName(c.name);
      }

      // Fetch or create report
      const reportsRes = await fetch(`/api/reports?clientId=${clientId}&period=${month}`);
      if (reportsRes.ok) {
        const reports: { id: string; period: string }[] = await reportsRes.json();
        const existing = reports.find((r) => r.period === month);
        if (existing) {
          setReportId(existing.id);
          // Load existing data
          const dataRes = await fetch(`/api/reports/${existing.id}/data`);
          if (dataRes.ok) {
            const data = await dataRes.json();
            const toStr = (obj: Record<string, unknown> | null | undefined): FormValues =>
              obj
                ? Object.fromEntries(Object.entries(obj).filter(([, v]) => v != null).map(([k, v]) => [k, String(v)]))
                : {};
            if (data.socialMedia) {
              setInstagram(toStr(data.socialMedia.instagram));
              setFacebook(toStr(data.socialMedia.facebook));
              setYoutube(toStr(data.socialMedia.youtube));
              setTiktok(toStr(data.socialMedia.tiktok));
            }
            setWebsite(toStr(data.websiteData));
            setGmb(toStr(data.gmbData));
          }
        }
      }
      setLoading(false);
    };
    init();
  }, [clientId, month]);

  const ensureReport = async (): Promise<string | null> => {
    if (reportId) return reportId;
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, period: month }),
    });
    if (!res.ok) {
      const data = await res.json();
      // If already exists, try to find it
      if (res.status === 409) {
        const r2 = await fetch(`/api/reports?clientId=${clientId}&period=${month}`);
        if (r2.ok) {
          const reports: { id: string; period: string }[] = await r2.json();
          const existing = reports.find((r) => r.period === month);
          if (existing) { setReportId(existing.id); return existing.id; }
        }
      }
      throw new Error(data.error ?? "Failed to create report");
    }
    const report = await res.json();
    setReportId(report.id);
    return report.id;
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg("");
    try {
      const id = await ensureReport();
      if (!id) throw new Error("No report ID");
      const body: Record<string, unknown> = {
        instagram: parseFormToNumbers(instagram),
        facebook: parseFormToNumbers(facebook),
        youtube: parseFormToNumbers(youtube),
        tiktok: parseFormToNumbers(tiktok),
        website: parseFormToNumbers(website),
        gmb: parseFormToNumbers(gmb),
      };
      const res = await fetch(`/api/reports/${id}/data`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Save failed");
      }
      setSaveMsg("Saved successfully!");
    } catch (err) {
      setSaveMsg(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const TAB_CONTENT: Record<Tab, React.ReactNode> = {
    Instagram: <FieldGroup fields={SOCIAL_FIELDS} values={instagram} onChange={(k, v) => setInstagram((f) => ({ ...f, [k]: v }))} />,
    Facebook: <FieldGroup fields={SOCIAL_FIELDS} values={facebook} onChange={(k, v) => setFacebook((f) => ({ ...f, [k]: v }))} />,
    YouTube: <FieldGroup fields={YOUTUBE_FIELDS} values={youtube} onChange={(k, v) => setYoutube((f) => ({ ...f, [k]: v }))} />,
    TikTok: <FieldGroup fields={SOCIAL_FIELDS} values={tiktok} onChange={(k, v) => setTiktok((f) => ({ ...f, [k]: v }))} />,
    Website: <FieldGroup fields={WEBSITE_FIELDS} values={website} onChange={(k, v) => setWebsite((f) => ({ ...f, [k]: v }))} />,
    GMB: <FieldGroup fields={GMB_FIELDS} values={gmb} onChange={(k, v) => setGmb((f) => ({ ...f, [k]: v }))} />,
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-400">Loading…</div>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {clientName || "Client"} — {periodLabel(month)}
        </h1>
        <p className="text-sm text-gray-500 mt-1">Enter report metrics for each platform.</p>
      </div>

      {/* Tab Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex overflow-x-auto border-b border-gray-100">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? "border-indigo-600 text-indigo-700 bg-indigo-50/50"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="p-6">{TAB_CONTENT[activeTab]}</div>
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors"
        >
          {saving ? "Saving…" : "Save All Data"}
        </button>
        {saveMsg && (
          <span className={`text-sm font-medium ${
            saveMsg.startsWith("Saved") ? "text-green-600" : "text-red-600"
          }`}>
            {saveMsg}
          </span>
        )}
      </div>
    </div>
  );
}
