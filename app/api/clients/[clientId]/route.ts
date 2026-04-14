import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateClientSchema } from "@/lib/validators";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const { clientId } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { role, clientId: sessionClientId } = session.user;

  if (role === "CLIENT" && sessionClientId !== clientId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (role !== "ADMIN" && role !== "TEAM" && role !== "CLIENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: { driveConfig: true },
  });

  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(client);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const { clientId } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = updateClientSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (parsed.data.slug && parsed.data.slug !== client.slug) {
    const slugTaken = await prisma.client.findUnique({ where: { slug: parsed.data.slug } });
    if (slugTaken) return NextResponse.json({ error: "Slug already taken" }, { status: 409 });
  }

  const updated = await prisma.client.update({
    where: { id: clientId },
    data: parsed.data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const { clientId } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.client.update({
    where: { id: clientId },
    data: { isActive: false },
  });

  return NextResponse.json(updated);
}
