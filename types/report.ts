export interface InstagramMetrics {
  views?: number | null;
  contentInteractions?: number | null;
  follows?: number | null;
  numberOfPosts?: number | null;
}

export interface FacebookMetrics {
  views?: number | null;
  contentInteractions?: number | null;
  follows?: number | null;
  numberOfPosts?: number | null;
}

export interface YouTubeMetrics {
  views?: number | null;
  subscribers?: number | null;
  numberOfVideos?: number | null;
}

export interface TikTokMetrics {
  views?: number | null;
  contentInteractions?: number | null;
  follows?: number | null;
  numberOfReels?: number | null;
}

export interface WebsiteMetrics {
  totalUsers?: number | null;
  newUsers?: number | null;
  views?: number | null;
  eventCount?: number | null;
}

export interface GMBMetrics {
  profileInteractions?: number | null;
  views?: number | null;
  searches?: number | null;
  numberOfReviews?: number | null;
}

export interface EmailMarketingMetrics {
  numberOfEmails?: number | null;
  totalSends?: number | null;
  openRate?: number | null;
}

// Legacy aliases kept for build-trend-data (remove once fully migrated)
export type SocialPlatformData = InstagramMetrics | FacebookMetrics | TikTokMetrics;
export type YouTubePlatformData = YouTubeMetrics;

export interface ParsedReportRow {
  period: string;
  instagram: InstagramMetrics;
  facebook: FacebookMetrics;
  youtube: YouTubeMetrics;
  tiktok: TikTokMetrics;
  website: WebsiteMetrics;
  gmb: GMBMetrics;
  emailMarketing: EmailMarketingMetrics;
}

export interface FullReport {
  id: string;
  clientId: string;
  period: string;
  status: "DRAFT" | "PUBLISHED";
  notes?: string | null;
  client: { name: string; slug: string; logoUrl?: string | null };
  socialMedia?: {
    instagram?: InstagramMetrics | null;
    facebook?: FacebookMetrics | null;
    youtube?: YouTubeMetrics | null;
    tiktok?: TikTokMetrics | null;
  } | null;
  websiteData?: WebsiteMetrics | null;
  gmbData?: GMBMetrics | null;
  emailMarketing?: EmailMarketingMetrics | null;
}
