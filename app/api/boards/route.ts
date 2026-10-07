import { NextRequest, NextResponse } from "next/server";

import { getSessionUserIdFromRequest, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { boardSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const userId = await getSessionUserIdFromRequest(request);
  if (!userId) {
    return unauthorized();
  }

  const body = await request.json();
  const parsed = boardSchema.safeParse(body);
  if (!parsed.success || typeof body.workspaceId !== "string") {
    return NextResponse.json({ error: "Invalid board data" }, { status: 400 });
  }

  const membership = await prisma.membership.findFirst({
    where: { userId, workspaceId: body.workspaceId }
  });

  if (!membership) {
    return unauthorized();
  }

  const board = await prisma.board.create({
    data: {
      workspaceId: body.workspaceId,
      name: parsed.data.name,
      description: parsed.data.description,
      columns: {
        create: [
          { title: "To Do", position: 0 },
          { title: "In Progress", position: 1 },
          { title: "Done", position: 2 }
        ]
      },
      activities: {
        create: {
          actorId: userId,
          action: "BOARD_CREATED",
          detail: `created board "${parsed.data.name}"`
        }
      }
    }
  });

  return NextResponse.json({ board }, { status: 201 });
}
