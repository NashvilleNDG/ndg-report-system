import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

function createPrismaClient() {
  const isPostgres = process.env.DATABASE_URL?.startsWith("postgres");
  if (isPostgres) {
    const { PrismaPg } = require("@prisma/adapter-pg");
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
    return new PrismaClient({ adapter });
  } else {
    const { PrismaLibSql } = require("@prisma/adapter-libsql");
    const path = require("path");
    const dbPath = path.resolve(process.cwd(), "prisma/dev.db");
    const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
    return new PrismaClient({ adapter });
  }
}

const prisma = createPrismaClient();

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
  const acme = await prisma.client.upsert({
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

  // Client user linked to Acme Corp
  await prisma.user.upsert({
    where: { email: "client@acme.com" },
    update: {},
    create: {
      name: "Acme Client",
      email: "client@acme.com",
      passwordHash: clientPassword,
      role: Role.CLIENT,
      clientId: acme.id,
    },
  });

  console.log("✅ Seeded successfully:");
  console.log("   admin@ndg.com / admin123");
  console.log("   team@ndg.com  / team123");
  console.log("   client@acme.com / client123");
  console.log("   Client: Acme Corp (id:", acme.id, ")");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
