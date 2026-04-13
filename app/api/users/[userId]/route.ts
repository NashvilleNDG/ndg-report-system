import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateUserSchema } from "@/lib/validators";
import bcrypt from "bcryptjs";

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    select: { id: true, name: true, email: true, role: true, clientId: true, createdAt: true },
  });

  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(user);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const user = await prisma.user.findUnique({ where: { id: params.userId } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = updateUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { password, ...rest } = parsed.data;
  const data: Record<string, unknown> = { ...rest };

  if (password) {
    data.passwordHash = await bcrypt.hash(password, 12);
  }

  const updated = await prisma.user.update({
    where: { id: params.userId },
    data,
    select: { id: true, name: true, email: true, role: true, clientId: true, createdAt: true },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (session.user.id === params.userId) {
    return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: params.userId } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.user.delete({ where: { id: params.userId } });

  return NextResponse.json({ success: true });
}
