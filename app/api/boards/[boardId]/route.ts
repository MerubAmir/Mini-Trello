import { NextRequest, NextResponse } from "next/server";

import { getSessionUserIdFromRequest, unauthorized } from "@/lib/auth";
import { getBoardForUser, serializeBoard } from "@/lib/boards";

export async function GET(
  request: NextRequest,
  { params }: { params: { boardId: string } }
) {
  const userId = await getSessionUserIdFromRequest(request);
  if (!userId) {
    return unauthorized();
  }

  const allowed = await getBoardForUser(params.boardId, userId);
  if (!allowed) {
    return unauthorized();
  }

  const board = await serializeBoard(params.boardId);
  return NextResponse.json({ board });
}
