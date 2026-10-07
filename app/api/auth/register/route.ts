import { NextResponse } from "next/server";

import {
  createSessionToken,
  hashPassword,
  setSessionCookie
} from "@/lib/auth";
import { databaseError } from "@/lib/api-errors";
import { prisma } from "@/lib/db";
import { registerSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const parsed = registerSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid registration data" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email: parsed.data.email }
    });

    if (existing) {
      return NextResponse.json(
        { error: "Email is already registered" },
        { status: 409 }
      );
    }

    const user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash: await hashPassword(parsed.data.password)
      },
      select: { id: true, name: true, email: true }
    });

    const workspace = await prisma.workspace.create({
      data: { name: `${parsed.data.name}'s Workspace` }
    });

    await prisma.membership.create({
      data: {
        role: "OWNER",
        userId: user.id,
        workspaceId: workspace.id
      }
    });

    const token = await createSessionToken(user.id);
    const response = NextResponse.json({ user });
    setSessionCookie(response, token);
    return response;
  } catch (error) {
    return databaseError(error);
  }
}
