import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaPool?: Pool;
};

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }

  return databaseUrl;
}

export function getPrismaClient() {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prismaPool ??= new Pool({
      connectionString: getDatabaseUrl(),
    });

    globalForPrisma.prisma = new PrismaClient({
      adapter: new PrismaPg(globalForPrisma.prismaPool),
    });
  }

  return globalForPrisma.prisma;
}