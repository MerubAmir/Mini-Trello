import { NextResponse } from "next/server";

import {
  createSessionToken,
  hashPassword,
  setSessionCookie
} from "@/lib/auth";
import { prisma } from "@/lib/db";
import { registerSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const parsed = registerSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid registration data" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email }
  });

  if (existing) {
    return NextResponse.json({ error: "Email is already registered" }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash: await hashPassword(parsed.data.password),
      memberships: {
        create: {
          role: "OWNER",
          workspace: {
            create: {
              name: `${parsed.data.name}'s Workspace`
            }
          }
        }
      }
    },
    select: { id: true, name: true, email: true }
  });

  const token = await createSessionToken(user.id);
  const response = NextResponse.json({ user });
  setSessionCookie(response, token);
  return response;
}
