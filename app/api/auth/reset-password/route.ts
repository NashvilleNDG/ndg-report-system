import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { token, password } = await req.json();
  if (!token || !password) {
    return NextResponse.json({ error: "Token and password required" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }

  const record = await prisma.passwordResetToken.findUnique({ where: { token } });

  if (!record) {
    return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });
  }
  if (record.expiresAt < new Date()) {
    await prisma.passwordResetToken.delete({ where: { token } });
    return NextResponse.json({ error: "Reset link has expired. Please request a new one." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: record.email } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
  await prisma.passwordResetToken.delete({ where: { token } });

  return NextResponse.json({ success: true });
}
