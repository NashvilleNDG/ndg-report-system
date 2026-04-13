import StatCard from "@/components/ui/StatCard";
import { formatNumber, formatPercent, formatDelta } from "@/lib/report-utils";
import type { SocialPlatformData, YouTubePlatformData } from "@/types/report";

interface SocialMediaSectionProps {
  instagram?: SocialPlatformData | null;
  facebook?: SocialPlatformData | null;
  youtube?: YouTubePlatformData | null;
  tiktok?: SocialPlatformData | null;
}

const PLATFORMS = [
  { key: "instagram", label: "Instagram", icon: "📸", color: "from-pink-500 to-purple-600" },
  { key: "facebook", label: "Facebook", icon: "📘", color: "from-blue-600 to-blue-400" },
  { key: "youtube", label: "YouTube", icon: "▶️", color: "from-red-600 to-red-400" },
  { key: "tiktok", label: "TikTok", icon: "🎵", color: "from-gray-900 to-gray-600" },
] as const;

function PlatformBlock({
  label,
  icon,
  color,
  isYouTube,
  data,
}: {
  label: string;
  icon: string;
  color: string;
  isYouTube: boolean;
  data: SocialPlatformData | YouTubePlatformData;
}) {
  const followersLabel = isYouTube ? "Subscribers" : "Followers";
  const followersVal = isYouTube
    ? (data as YouTubePlatformData).subscribers
    : (data as SocialPlatformData).followers;
  const followersChange = isYouTube
    ? (data as YouTubePlatformData).subscribersChange
    : (data as SocialPlatformData).followersChange;
  const reachOrViews = isYouTube
    ? (data as YouTubePlatformData).views
    : (data as SocialPlatformData).reach;
  const reachLabel = isYouTube ? "Views" : "Reach";

  const delta = formatDelta(followersChange);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className={`bg-gradient-to-r ${color} px-5 py-4 flex items-center gap-3`}>
        <span className="text-2xl">{icon}</span>
        <h3 className="text-lg font-bold text-white">{label}</h3>
      </div>
      <div className="p-5">
        {data.engagement != null && (
          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm text-gray-500 font-medium">Engagement Rate:</span>
            <span className="text-lg font-bold text-indigo-600">{formatPercent(data.engagement)}</span>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label={followersLabel}
            value={formatNumber(followersVal)}
            change={followersChange != null ? delta.text : undefined}
            positive={delta.positive}
          />
          <StatCard
            label="Likes"
            value={formatNumber(data.likes)}
          />
          <StatCard
            label={reachLabel}
            value={formatNumber(reachOrViews)}
          />
          <StatCard
            label="Impressions"
            value={formatNumber(data.impressions)}
          />
        </div>
      </div>
    </div>
  );
}

export default function SocialMediaSection({
  instagram,
  facebook,
  youtube,
  tiktok,
}: SocialMediaSectionProps) {
  const platformData = { instagram, facebook, youtube, tiktok };
  const hasPlatforms = PLATFORMS.some((p) => platformData[p.key] != null);

  if (!hasPlatforms) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-400">
        No social media data available.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">Social Media</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {PLATFORMS.map((p) => {
          const data = platformData[p.key];
          if (!data) return null;
          return (
            <PlatformBlock
              key={p.key}
              label={p.label}
              icon={p.icon}
              color={p.color}
              isYouTube={p.key === "youtube"}
              data={data}
            />
          );
        })}
      </div>
    </div>
  );
}
