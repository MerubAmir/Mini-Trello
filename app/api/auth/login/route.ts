import { NextResponse } from "next/server";

import {
  createSessionToken,
  setSessionCookie,
  verifyPassword
} from "@/lib/auth";
import { prisma } from "@/lib/db";
import { loginSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid login data" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email }
  });

  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const token = await createSessionToken(user.id);
  const response = NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email }
  });
  setSessionCookie(response, token);
  return response;
}
