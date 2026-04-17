import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

function createPrismaClient() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
    ssl: { rejectUnauthorized: false },
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

const prisma = createPrismaClient();

// Dummy data per period — realistic-looking monthly metrics
const monthlyData = [
  {
    period: "2026-01",
    instagram: { views: 12400, contentInteractions: 870, follows: 34, numberOfPosts: 12 },
    facebook:  { views: 8200,  contentInteractions: 410, follows: 18, numberOfPosts: 10 },
    tiktok:    { views: 31000, contentInteractions: 2100, follows: 89, numberOfReels: 8 },
    youtube:   { views: 5400,  subscribers: 12, numberOfVideos: 3 },
    website:   { totalUsers: 1840, newUsers: 620, views: 4100, eventCount: 7300 },
    gmb:       { profileInteractions: 390, views: 2800, searches: 1100, numberOfReviews: 4 },
    email:     { numberOfEmails: 2, totalSends: 1860, openRate: 28.4 },
  },
  {
    period: "2026-02",
    instagram: { views: 14100, contentInteractions: 940, follows: 41, numberOfPosts: 14 },
    facebook:  { views: 9100,  contentInteractions: 490, follows: 22, numberOfPosts: 11 },
    tiktok:    { views: 38500, contentInteractions: 2750, follows: 112, numberOfReels: 10 },
    youtube:   { views: 6200,  subscribers: 18, numberOfVideos: 4 },
    website:   { totalUsers: 2050, newUsers: 710, views: 4700, eventCount: 8200 },
    gmb:       { profileInteractions: 420, views: 3100, searches: 1250, numberOfReviews: 6 },
    email:     { numberOfEmails: 3, totalSends: 2100, openRate: 31.2 },
  },
  {
    period: "2026-03",
    instagram: { views: 16800, contentInteractions: 1120, follows: 58, numberOfPosts: 16 },
    facebook:  { views: 10400, contentInteractions: 560, follows: 29, numberOfPosts: 13 },
    tiktok:    { views: 47200, contentInteractions: 3400, follows: 145, numberOfReels: 12 },
    youtube:   { views: 7800,  subscribers: 24, numberOfVideos: 5 },
    website:   { totalUsers: 2380, newUsers: 830, views: 5500, eventCount: 9800 },
    gmb:       { profileInteractions: 510, views: 3700, searches: 1480, numberOfReviews: 9 },
    email:     { numberOfEmails: 3, totalSends: 2450, openRate: 33.7 },
  },
];

async function main() {
  // Find all clients and their reports
  const reports = await prisma.report.findMany({
    select: { id: true, period: true, client: { select: { name: true } } },
  });

  for (const report of reports) {
    const data = monthlyData.find((d) => d.period === report.period);
    if (!data) continue;

    console.log(`Seeding ${report.client.name} — ${report.period}`);

    // SocialMedia container
    const social = await prisma.socialMediaData.upsert({
      where: { reportId: report.id },
      update: {},
      create: { reportId: report.id },
    });

    await prisma.instagramData.upsert({
      where: { socialMediaDataId: social.id },
      update: data.instagram,
      create: { socialMediaDataId: social.id, ...data.instagram },
    });

    await prisma.facebookData.upsert({
      where: { socialMediaDataId: social.id },
      update: data.facebook,
      create: { socialMediaDataId: social.id, ...data.facebook },
    });

    await prisma.tikTokData.upsert({
      where: { socialMediaDataId: social.id },
      update: data.tiktok,
      create: { socialMediaDataId: social.id, ...data.tiktok },
    });

    await prisma.youTubeData.upsert({
      where: { socialMediaDataId: social.id },
      update: data.youtube,
      create: { socialMediaDataId: social.id, ...data.youtube },
    });

    await prisma.websiteData.upsert({
      where: { reportId: report.id },
      update: data.website,
      create: { reportId: report.id, ...data.website },
    });

    await prisma.gMBData.upsert({
      where: { reportId: report.id },
      update: data.gmb,
      create: { reportId: report.id, ...data.gmb },
    });

    await prisma.emailMarketingData.upsert({
      where: { reportId: report.id },
      update: data.email,
      create: { reportId: report.id, ...data.email },
    });
  }

  console.log("✅ Dummy data seeded for all reports!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
