import { PrismaClient, Role } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";
import path from "path";

const dbPath = path.resolve(process.cwd(), "prisma/dev.db");
const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10);
  const teamPassword = await bcrypt.hash("team123", 10);
  const clientPassword = await bcrypt.hash("client123", 10);

  // Admin user
  await prisma.user.upsert({
    where: { email: "admin@ndg.com" },
    update: {},
    create: {
      name: "NDG Admin",
      email: "admin@ndg.com",
      passwordHash: adminPassword,
      role: Role.ADMIN,
    },
  });

  // Team user
  await prisma.user.upsert({
    where: { email: "team@ndg.com" },
    update: {},
    create: {
      name: "NDG Team",
      email: "team@ndg.com",
      passwordHash: teamPassword,
      role: Role.TEAM,
    },
  });

  // Sample client
  const sampleClient = await prisma.client.upsert({
    where: { slug: "acme-corp" },
    update: {},
    create: {
      name: "Acme Corp",
      slug: "acme-corp",
      industry: "Technology",
      contactEmail: "contact@acme.com",
      isActive: true,
    },
  });

  // Client user linked to sample client
  await prisma.user.upsert({
    where: { email: "client@acme.com" },
    update: {},
    create: {
      name: "Acme Client",
      email: "client@acme.com",
      passwordHash: clientPassword,
      role: Role.CLIENT,
      clientId: sampleClient.id,
    },
  });

  // Sample report for current month
  const now = new Date();
  const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const report = await prisma.report.upsert({
    where: { clientId_period: { clientId: sampleClient.id, period } },
    update: {},
    create: {
      clientId: sampleClient.id,
      period,
      status: "PUBLISHED",
      notes: "Sample report for demo purposes.",
    },
  });

  // Social media data
  const social = await prisma.socialMediaData.upsert({
    where: { reportId: report.id },
    update: {},
    create: { reportId: report.id },
  });

  await prisma.instagramData.upsert({
    where: { socialMediaDataId: social.id },
    update: {},
    create: {
      socialMediaDataId: social.id,
      followers: 12500,
      followersChange: 340,
      likes: 8200,
      reach: 45000,
      impressions: 62000,
      engagement: 4.2,
    },
  });

  await prisma.facebookData.upsert({
    where: { socialMediaDataId: social.id },
    update: {},
    create: {
      socialMediaDataId: social.id,
      followers: 8900,
      followersChange: 120,
      likes: 3400,
      reach: 28000,
      impressions: 41000,
      engagement: 2.8,
    },
  });

  await prisma.youTubeData.upsert({
    where: { socialMediaDataId: social.id },
    update: {},
    create: {
      socialMediaDataId: social.id,
      subscribers: 5200,
      subscribersChange: 95,
      likes: 1800,
      views: 32000,
      impressions: 58000,
      engagement: 3.5,
    },
  });

  await prisma.tikTokData.upsert({
    where: { socialMediaDataId: social.id },
    update: {},
    create: {
      socialMediaDataId: social.id,
      followers: 18700,
      followersChange: 820,
      likes: 24500,
      reach: 95000,
      impressions: 140000,
      engagement: 8.1,
    },
  });

  // Website data
  await prisma.websiteData.upsert({
    where: { reportId: report.id },
    update: {},
    create: {
      reportId: report.id,
      sessions: 14200,
      users: 11800,
      pageviews: 38500,
      bounceRate: 42.3,
      conversions: 186,
      conversionRate: 1.31,
    },
  });

  // GMB data
  await prisma.gMBData.upsert({
    where: { reportId: report.id },
    update: {},
    create: {
      reportId: report.id,
      profileViews: 3200,
      searchImpressions: 8700,
      businessInteractions: 540,
      clicks: 280,
      calls: 95,
      directionRequests: 165,
    },
  });

  console.log("Seed complete.");
  console.log("Admin:  admin@ndg.com / admin123");
  console.log("Team:   team@ndg.com  / team123");
  console.log("Client: client@acme.com / client123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
