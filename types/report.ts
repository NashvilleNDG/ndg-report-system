export interface SocialPlatformData {
  followers?: number | null;
  followersChange?: number | null;
  likes?: number | null;
  reach?: number | null;
  impressions?: number | null;
  engagement?: number | null;
}

export interface YouTubePlatformData {
  subscribers?: number | null;
  subscribersChange?: number | null;
  likes?: number | null;
  views?: number | null;
  impressions?: number | null;
  engagement?: number | null;
}

export interface WebsiteMetrics {
  sessions?: number | null;
  users?: number | null;
  pageviews?: number | null;
  bounceRate?: number | null;
  conversions?: number | null;
  conversionRate?: number | null;
}

export interface GMBMetrics {
  profileViews?: number | null;
  searchImpressions?: number | null;
  businessInteractions?: number | null;
  clicks?: number | null;
  calls?: number | null;
  directionRequests?: number | null;
}

export interface ParsedReportRow {
  period: string;
  instagram: SocialPlatformData;
  facebook: SocialPlatformData;
  youtube: YouTubePlatformData;
  tiktok: SocialPlatformData;
  website: WebsiteMetrics;
  gmb: GMBMetrics;
}

export interface FullReport {
  id: string;
  clientId: string;
  period: string;
  status: "DRAFT" | "PUBLISHED";
  notes?: string | null;
  client: { name: string; slug: string; logoUrl?: string | null };
  socialMedia?: {
    instagram?: SocialPlatformData | null;
    facebook?: SocialPlatformData | null;
    youtube?: YouTubePlatformData | null;
    tiktok?: SocialPlatformData | null;
  } | null;
  websiteData?: WebsiteMetrics | null;
  gmbData?: GMBMetrics | null;
}
