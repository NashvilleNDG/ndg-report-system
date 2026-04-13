import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { reportDataSchema } from "@/lib/validators";

async function getReportWithAccess(reportId: string, session: Awaited<ReturnType<typeof auth>>) {
  if (!session) return null;

  const report = await prisma.report.findUnique({
    where: { id: reportId },
    include: {
      socialMedia: {
        include: { instagram: true, facebook: true, youtube: true, tiktok: true },
      },
      websiteData: true,
      gmbData: true,
    },
  });

  if (!report) return null;

  const { role, clientId: sessionClientId } = session.user;

  if (role === "CLIENT") {
    if (report.clientId !== sessionClientId || report.status !== "PUBLISHED") return null;
  } else if (role !== "ADMIN" && role !== "TEAM") {
    return null;
  }

  return report;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { reportId: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const report = await getReportWithAccess(params.reportId, session);
  if (!report) return NextResponse.json({ error: "Not found or forbidden" }, { status: 404 });

  return NextResponse.json({
    socialMedia: report.socialMedia,
    websiteData: report.websiteData,
    gmbData: report.gmbData,
  });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { reportId: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { role } = session.user;
  if (role !== "ADMIN" && role !== "TEAM") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const report = await prisma.report.findUnique({ where: { id: params.reportId } });
  if (!report) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = reportDataSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { instagram, facebook, youtube, tiktok, website, gmb } = parsed.data;

  if (instagram || facebook || youtube || tiktok) {
    const social = await prisma.socialMediaData.upsert({
      where: { reportId: report.id },
      update: {},
      create: { reportId: report.id },
    });

    if (instagram) {
      await prisma.instagramData.upsert({
        where: { socialMediaDataId: social.id },
        update: instagram,
        create: { socialMediaDataId: social.id, ...instagram },
      });
    }

    if (facebook) {
      await prisma.facebookData.upsert({
        where: { socialMediaDataId: social.id },
        update: facebook,
        create: { socialMediaDataId: social.id, ...facebook },
      });
    }

    if (youtube) {
      await prisma.youTubeData.upsert({
        where: { socialMediaDataId: social.id },
        update: youtube,
        create: { socialMediaDataId: social.id, ...youtube },
      });
    }

    if (tiktok) {
      await prisma.tikTokData.upsert({
        where: { socialMediaDataId: social.id },
        update: tiktok,
        create: { socialMediaDataId: social.id, ...tiktok },
      });
    }
  }

  if (website) {
    await prisma.websiteData.upsert({
      where: { reportId: report.id },
      update: website,
      create: { reportId: report.id, ...website },
    });
  }

  if (gmb) {
    await prisma.gMBData.upsert({
      where: { reportId: report.id },
      update: gmb,
      create: { reportId: report.id, ...gmb },
    });
  }

  const updated = await prisma.report.findUnique({
    where: { id: report.id },
    include: {
      socialMedia: {
        include: { instagram: true, facebook: true, youtube: true, tiktok: true },
      },
      websiteData: true,
      gmbData: true,
    },
  });

  return NextResponse.json(updated);
}
