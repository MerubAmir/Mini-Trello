import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getCurrentUser } from "@/lib/auth";
import { getBoardForUser, serializeBoard } from "@/lib/boards";
import { KanbanBoard } from "@/components/KanbanBoard";

export const dynamic = "force-dynamic";

export default async function BoardPage({
  params
}: {
  params: { boardId: string };
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const allowed = await getBoardForUser(params.boardId, user.id);
  if (!allowed) {
    notFound();
  }

  const board = await serializeBoard(params.boardId);
  if (!board) {
    notFound();
  }

  return (
    <main className="min-h-screen">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div>
            <Link
              href="/dashboard"
              className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-moss"
            >
              <ArrowLeft size={16} />
              Boards
            </Link>
            <h1 className="text-2xl font-semibold text-ink">{board.name}</h1>
            <p className="mt-1 text-sm text-ink/60">
              {board.description || "No description yet."}
            </p>
          </div>
          <div className="rounded-md bg-field px-3 py-2 text-sm font-medium text-ink/70">
            {user.name}
          </div>
        </div>
      </header>
      <KanbanBoard initialBoard={JSON.parse(JSON.stringify(board))} />
    </main>
  );
}
