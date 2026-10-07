import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard, LogOut, Plus } from "lucide-react";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NewBoardForm } from "@/components/NewBoardForm";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const workspaces = await prisma.workspace.findMany({
    where: { memberships: { some: { userId: user.id } } },
    include: {
      boards: {
        orderBy: { updatedAt: "desc" },
        include: {
          columns: {
            include: { cards: true }
          }
        }
      }
    },
    orderBy: { createdAt: "asc" }
  });

  const workspace = workspaces[0];

  return (
    <main className="min-h-screen">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-md bg-moss text-white">
              <LayoutDashboard size={20} />
            </span>
            <div>
              <h1 className="text-xl font-semibold text-ink">Boards</h1>
              <p className="text-sm text-ink/60">{workspace?.name}</p>
            </div>
          </div>
          <form action="/api/auth/logout" method="post">
            <button className="flex items-center gap-2 rounded-md border border-line px-3 py-2 text-sm font-medium text-ink hover:bg-field">
              <LogOut size={16} />
              Sign out
            </button>
          </form>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-moss">
              Workspace
            </p>
            <h2 className="mt-1 text-3xl font-semibold text-ink">
              {workspace?.name || "My workspace"}
            </h2>
          </div>
          {workspace && <NewBoardForm workspaceId={workspace.id} />}
        </div>

        {workspace?.boards.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {workspace.boards.map((board) => {
              const cardCount = board.columns.reduce(
                (total, column) => total + column.cards.length,
                0
              );
              return (
                <Link
                  key={board.id}
                  href={`/boards/${board.id}`}
                  className="rounded-lg border border-line bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-ink">
                        {board.name}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink/65">
                        {board.description || "No description yet."}
                      </p>
                    </div>
                    <span className="rounded-md bg-field px-2 py-1 text-xs font-semibold text-ink/70">
                      {cardCount} cards
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-line bg-white p-10 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-md bg-field text-moss">
              <Plus />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-ink">
              Create your first board
            </h3>
            <p className="mt-2 text-sm text-ink/60">
              Start with a project board, then add cards and comments.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
