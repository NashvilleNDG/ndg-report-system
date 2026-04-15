import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/mailer";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  // Always return success to prevent email enumeration
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ success: true });

  // Delete any existing tokens for this email
  await prisma.passwordResetToken.deleteMany({ where: { email } });

  // Create a new token (expires in 1 hour)
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: { token, email, expiresAt },
  });

  const baseUrl = (process.env.NEXTAUTH_URL && process.env.NEXTAUTH_URL !== "true")
    ? process.env.NEXTAUTH_URL
    : "https://ndg-report-system.onrender.com";

  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  try {
    await sendPasswordResetEmail({ to: email, resetUrl });
  } catch (err) {
    console.error("[RESET EMAIL] Failed to send:", err);
  }

  return NextResponse.json({ success: true });
}
