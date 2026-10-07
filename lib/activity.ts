import { prisma } from "@/lib/db";

export const logActivity = async (params: {
  boardId: string;
  actorId: string;
  action: string;
  detail: string;
  cardId?: string | null;
}) => {
  return prisma.activity.create({
    data: {
      boardId: params.boardId,
      actorId: params.actorId,
      cardId: params.cardId ?? null,
      action: params.action,
      detail: params.detail
    }
  });
};
