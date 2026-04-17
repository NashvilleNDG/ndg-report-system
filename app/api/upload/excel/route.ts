import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseExcelBuffer } from "@/lib/excel-parser";
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

  if (row.emailMarketing) {
    await prisma.emailMarketingData.upsert({
      where: { reportId: report.id },
      update: row.emailMarketing,
      create: { reportId: report.id, ...row.emailMarketing },
    });
  }

  return row.period;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { role } = session.user;
  if (role !== "ADMIN" && role !== "TEAM") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const clientId = formData.get("clientId") as string | null;

  if (!file || !clientId) {
    return NextResponse.json({ error: "file and clientId are required" }, { status: 400 });
  }

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const rows = parseExcelBuffer(buffer);

  const periods: string[] = [];
  for (const row of rows) {
    const period = await upsertReportRow(clientId, row);
    periods.push(period);
  }

  return NextResponse.json({ imported: periods.length, periods });
}
