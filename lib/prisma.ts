import { PrismaClient } from "@prisma/client";

const isPostgres = process.env.DATABASE_URL?.startsWith("postgres");

function createPrismaClient() {
  if (isPostgres) {
    // PostgreSQL adapter for production (Render)
    const { PrismaPg } = require("@prisma/adapter-pg");
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
    return new PrismaClient({ adapter });
  } else {
    // LibSQL adapter for local SQLite development
    const { PrismaLibSql } = require("@prisma/adapter-libsql");
    const path = require("path");
    const dbPath = path.resolve(process.cwd(), "prisma/dev.db");
    const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
    return new PrismaClient({ adapter });
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
