import { NextRequest, NextResponse } from "next/server";

import { getSessionUserIdFromRequest, unauthorized } from "@/lib/auth";
import { getCardBoardForUser } from "@/lib/boards";
import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { commentSchema } from "@/lib/validation";

export async function POST(
  request: NextRequest,
  { params }: { params: { cardId: string } }
) {
  const userId = await getSessionUserIdFromRequest(request);
  if (!userId) {
    return unauthorized();
  }

  const card = await getCardBoardForUser(params.cardId, userId);
  if (!card) {
    return unauthorized();
  }

  const parsed = commentSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid comment" }, { status: 400 });
  }

  const comment = await prisma.comment.create({
    data: {
      body: parsed.data.body,
      cardId: params.cardId,
      authorId: userId
    },
    include: {
      author: {
        select: { id: true, name: true }
      }
    }
  });

  await logActivity({
    boardId: card.column.boardId,
    actorId: userId,
    cardId: params.cardId,
    action: "COMMENT_CREATED",
    detail: `commented on "${card.title}"`
  });

  return NextResponse.json({ comment }, { status: 201 });
}
