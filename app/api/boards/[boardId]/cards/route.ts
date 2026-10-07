import { NextRequest, NextResponse } from "next/server";

import { getSessionUserIdFromRequest, unauthorized } from "@/lib/auth";
import { getBoardForUser } from "@/lib/boards";
import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { cardCreateSchema } from "@/lib/validation";

export async function POST(
  request: NextRequest,
  { params }: { params: { boardId: string } }
) {
  const userId = await getSessionUserIdFromRequest(request);
  if (!userId) {
    return unauthorized();
  }

  const board = await getBoardForUser(params.boardId, userId);
  if (!board) {
    return unauthorized();
  }

  const parsed = cardCreateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid card data" }, { status: 400 });
  }

  const column = await prisma.column.findFirst({
    where: { id: parsed.data.columnId, boardId: params.boardId },
    include: { cards: true }
  });

  if (!column) {
    return NextResponse.json({ error: "Column not found" }, { status: 404 });
  }

  const card = await prisma.card.create({
    data: {
      columnId: column.id,
      title: parsed.data.title,
      description: parsed.data.description,
      priority: parsed.data.priority,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      position: column.cards.length
    }
  });

  await logActivity({
    boardId: params.boardId,
    actorId: userId,
    cardId: card.id,
    action: "CARD_CREATED",
    detail: `created "${card.title}"`
  });

  return NextResponse.json({ card }, { status: 201 });
}
