import { PrismaClient } from "@prisma/client";

// Standard Prisma client — uses DATABASE_URL from environment.
// Works for both local development (set DATABASE_URL in .env.local)
// and production (Render injects DATABASE_URL automatically).
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
