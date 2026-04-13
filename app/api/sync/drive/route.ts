import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseExcelBuffer } from "@/lib/excel-parser";
import { downloadDriveFile } from "@/lib/google-drive";
import type { ParsedReportRow } from "@/types/report";

async function upsertReportRow(clientId: string, row: ParsedReportRow) {
  const report = await prisma.report.upsert({
    where: { clientId_period: { clientId, period: row.period } },
    update: {},
    create: { clientId, period: row.period, status: "DRAFT" },
  });

  const social = await prisma.socialMediaData.upsert({
    where: { reportId: report.id },
    update: {},
    create: { reportId: report.id },
  });

  if (row.instagram) {
    await prisma.instagramData.upsert({
      where: { socialMediaDataId: social.id },
      update: row.instagram,
      create: { socialMediaDataId: social.id, ...row.instagram },
    });
  }

  if (row.facebook) {
    await prisma.facebookData.upsert({
      where: { socialMediaDataId: social.id },
      update: row.facebook,
      create: { socialMediaDataId: social.id, ...row.facebook },
    });
  }

  if (row.youtube) {
    await prisma.youTubeData.upsert({
      where: { socialMediaDataId: social.id },
      update: row.youtube,
      create: { socialMediaDataId: social.id, ...row.youtube },
    });
  }

  if (row.tiktok) {
    await prisma.tikTokData.upsert({
      where: { socialMediaDataId: social.id },
      update: row.tiktok,
      create: { socialMediaDataId: social.id, ...row.tiktok },
    });
  }

  if (row.website) {
    await prisma.websiteData.upsert({
      where: { reportId: report.id },
      update: row.website,
      create: { reportId: report.id, ...row.website },
    });
  }

  if (row.gmb) {
    await prisma.gMBData.upsert({
      where: { reportId: report.id },
      update: row.gmb,
      create: { reportId: report.id, ...row.gmb },
    });
  }

  return row.period;
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { role } = session.user;
  if (role !== "ADMIN" && role !== "TEAM") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");
  if (!clientId) {
    return NextResponse.json({ error: "clientId is required" }, { status: 400 });
  }

  const config = await prisma.driveConfig.findUnique({ where: { clientId } });
  if (!config) return NextResponse.json({ error: "Drive config not found" }, { status: 404 });

  return NextResponse.json(config);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { role } = session.user;
  if (role !== "ADMIN" && role !== "TEAM") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { clientId } = body;

  if (!clientId) {
    return NextResponse.json({ error: "clientId is required" }, { status: 400 });
  }

  const config = await prisma.driveConfig.findUnique({ where: { clientId } });
  if (!config) {
    return NextResponse.json({ error: "Drive config not found for this client" }, { status: 404 });
  }

  let rows: ParsedReportRow[];
  try {
    const buffer = await downloadDriveFile(config.driveFileId);
    rows = parseExcelBuffer(buffer, config.sheetName ?? undefined);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to download or parse file";
    await prisma.driveConfig.update({
      where: { clientId },
      data: { syncStatus: "ERROR", syncError: message },
    });
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const periods: string[] = [];
  for (const row of rows) {
    const period = await upsertReportRow(clientId, row);
    periods.push(period);
  }

  const lastSyncedAt = new Date();
  await prisma.driveConfig.update({
    where: { clientId },
    data: { syncStatus: "OK", syncError: null, lastSyncedAt },
  });

  return NextResponse.json({ imported: periods.length, periods, lastSyncedAt });
}
