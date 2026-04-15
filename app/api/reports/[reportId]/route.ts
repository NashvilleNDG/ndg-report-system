import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendReportReadyEmail } from "@/lib/mailer";
import { periodLabel } from "@/lib/report-utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  const { reportId } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const report = await prisma.report.findUnique({
    where: { id: reportId },
    include: {
      client: { select: { name: true, slug: true, logoUrl: true } },
      socialMedia: {
        include: { instagram: true, facebook: true, youtube: true, tiktok: true },
      },
      websiteData: true,
      gmbData: true,
    },
  });

  if (!report) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { role, clientId: sessionClientId } = session.user;

  if (role === "CLIENT") {
    if (report.clientId !== sessionClientId || report.status !== "PUBLISHED") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  } else if (role !== "ADMIN" && role !== "TEAM") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(report);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  const { reportId } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { role } = session.user;
  if (role !== "ADMIN" && role !== "TEAM") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { status, notes } = body;

  if (status !== undefined && role !== "ADMIN") {
    return NextResponse.json({ error: "Only ADMIN can change report status" }, { status: 403 });
  }

  const data: Record<string, unknown> = {};
  if (notes !== undefined) data.notes = notes;
  if (status !== undefined) {
    data.status = status;
    if (status === "PUBLISHED" && report.status !== "PUBLISHED") {
      data.publishedAt = new Date();
    }
  }

  const updated = await prisma.report.update({
    where: { id: reportId },
    data,
    include: { client: { select: { name: true, slug: true, logoUrl: true } } },
  });

  // Send email notifications when a report is freshly published
  if (status === "PUBLISHED" && report.status !== "PUBLISHED") {
    try {
      const baseUrl = process.env.NEXTAUTH_URL ?? process.env.AUTH_TRUST_HOST ?? "https://ndg-report-system.onrender.com";
      const reportUrl = `${baseUrl}/client/reports/${report.period}`;
      const periodStr = periodLabel(report.period);

      // Find all CLIENT users linked to this client
      const clientUsers = await prisma.user.findMany({
        where: { clientId: report.clientId, role: "CLIENT" },
        select: { email: true },
      });

      await Promise.allSettled(
        clientUsers.map((u) =>
          sendReportReadyEmail({
            to: u.email,
            clientName: updated.client.name,
            period: periodStr,
            reportUrl,
          })
        )
      );
    } catch (err) {
      // Don't fail the publish if email fails — just log it
      console.error("Email send error:", err);
    }
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  const { reportId } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.report.delete({ where: { id: reportId } });

  return NextResponse.json({ success: true });
}
