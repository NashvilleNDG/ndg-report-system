import { defineConfig } from "prisma/config";
import path from "path";

const isDev = process.env.NODE_ENV !== "production";
const isPostgres = process.env.DATABASE_URL?.startsWith("postgres");

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: isPostgres
      ? process.env.DATABASE_URL!
      : `file:${path.resolve(process.cwd(), "prisma/dev.db")}`,
  },
});
