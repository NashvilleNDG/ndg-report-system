import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClientSchema } from "@/lib/validators";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { role } = session.user;
  if (role !== "ADMIN" && role !== "TEAM") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const clients = await prisma.client.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      industry: true,
      contactEmail: true,
      isActive: true,
      createdAt: true,
      _count: { select: { reports: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(clients);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createClientSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const existing = await prisma.client.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) {
    return NextResponse.json({ error: "Slug already taken" }, { status: 409 });
  }

  const client = await prisma.client.create({ data: parsed.data });
  return NextResponse.json(client, { status: 201 });
}
