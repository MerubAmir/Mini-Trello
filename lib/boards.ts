import { prisma } from "@/lib/db";

export const isMongoObjectId = (value: string) => /^[a-f\d]{24}$/i.test(value);

export const getBoardForUser = async (boardId: string, userId: string) => {
  if (!isMongoObjectId(boardId) || !isMongoObjectId(userId)) {
    return null;
  }

  return prisma.board.findFirst({
    where: {
      id: boardId,
      workspace: {
        memberships: {
          some: { userId }
        }
      }
    }
  });
};

export const getCardBoardForUser = async (cardId: string, userId: string) => {
  if (!isMongoObjectId(cardId) || !isMongoObjectId(userId)) {
    return null;
  }

  return prisma.card.findFirst({
    where: {
      id: cardId,
      column: {
        board: {
          workspace: {
            memberships: {
              some: { userId }
            }
          }
        }
      }
    },
    include: {
      column: {
        include: {
          board: true
        }
      }
    }
  });
};

export const serializeBoard = async (boardId: string) => {
  if (!isMongoObjectId(boardId)) {
    return null;
  }

  return prisma.board.findUnique({
    where: { id: boardId },
    include: {
      columns: {
        orderBy: { position: "asc" },
        include: {
          cards: {
            orderBy: { position: "asc" },
            include: {
              comments: {
                orderBy: { createdAt: "desc" },
                include: {
                  author: {
                    select: { id: true, name: true }
                  }
                }
              }
            }
          }
        }
      },
      activities: {
        orderBy: { createdAt: "desc" },
        take: 30,
        include: {
          actor: {
            select: { id: true, name: true }
          }
        }
      }
    }
  });
};
