import * as dotenv from "dotenv";
import * as path from "path";

// Load env files before importing Prisma (ts-node doesn't auto-load .env.local)
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { PrismaClient, Role } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

function createPrismaClient() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
    ssl: { rejectUnauthorized: false },
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
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
