import { NextRequest, NextResponse } from "next/server";

import { getSessionUserIdFromRequest, unauthorized } from "@/lib/auth";
import { getCardBoardForUser } from "@/lib/boards";
import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { cardUpdateSchema } from "@/lib/validation";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { cardId: string } }
) {
  const userId = await getSessionUserIdFromRequest(request);
  if (!userId) {
    return unauthorized();
  }

  const existing = await getCardBoardForUser(params.cardId, userId);
  if (!existing) {
    return unauthorized();
  }

  const parsed = cardUpdateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid card data" }, { status: 400 });
  }

  let targetColumnId = parsed.data.columnId ?? existing.columnId;
  if (parsed.data.columnId) {
    const targetColumn = await prisma.column.findFirst({
      where: {
        id: parsed.data.columnId,
        boardId: existing.column.boardId
      }
    });
    if (!targetColumn) {
      return NextResponse.json({ error: "Column not found" }, { status: 404 });
    }
    targetColumnId = targetColumn.id;
  }

  const card = await prisma.card.update({
    where: { id: params.cardId },
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      priority: parsed.data.priority,
      dueDate:
        parsed.data.dueDate === undefined
          ? undefined
          : parsed.data.dueDate
            ? new Date(parsed.data.dueDate)
            : null,
      columnId: targetColumnId,
      position: parsed.data.position
    }
  });

  const moved = targetColumnId !== existing.columnId;
  await logActivity({
    boardId: existing.column.boardId,
    actorId: userId,
    cardId: card.id,
    action: moved ? "CARD_MOVED" : "CARD_UPDATED",
    detail: moved ? `moved "${card.title}"` : `updated "${card.title}"`
  });

  return NextResponse.json({ card });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { cardId: string } }
) {
  const userId = await getSessionUserIdFromRequest(request);
  if (!userId) {
    return unauthorized();
  }

  const existing = await getCardBoardForUser(params.cardId, userId);
  if (!existing) {
    return unauthorized();
  }

  await prisma.card.delete({ where: { id: params.cardId } });
  await logActivity({
    boardId: existing.column.boardId,
    actorId: userId,
    action: "CARD_DELETED",
    detail: `deleted "${existing.title}"`
  });

  return NextResponse.json({ ok: true });
}
