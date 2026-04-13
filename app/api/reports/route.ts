import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { role, clientId: sessionClientId } = session.user;
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId") ?? undefined;
  const period = searchParams.get("period") ?? undefined;

  if (role === "CLIENT") {
    const reports = await prisma.report.findMany({
      where: {
        clientId: sessionClientId ?? undefined,
        status: "PUBLISHED",
        ...(period ? { period } : {}),
      },
      include: { client: { select: { name: true } } },
      orderBy: { period: "desc" },
    });
    return NextResponse.json(reports);
  }

  if (role !== "ADMIN" && role !== "TEAM") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const reports = await prisma.report.findMany({
    where: {
      ...(clientId ? { clientId } : {}),
      ...(period ? { period } : {}),
    },
    include: { client: { select: { name: true } } },
    orderBy: { period: "desc" },
  });

  return NextResponse.json(reports);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { role } = session.user;
  if (role !== "ADMIN" && role !== "TEAM") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { clientId, period, notes } = body;

  if (!clientId || !period) {
    return NextResponse.json({ error: "clientId and period are required" }, { status: 400 });
  }

  const existing = await prisma.report.findUnique({
    where: { clientId_period: { clientId, period } },
  });
  if (existing) {
    return NextResponse.json({ error: "Report for this client and period already exists" }, { status: 409 });
  }

  const report = await prisma.report.create({
    data: { clientId, period, notes, status: "DRAFT" },
    include: { client: { select: { name: true } } },
  });

  return NextResponse.json(report, { status: 201 });
}
