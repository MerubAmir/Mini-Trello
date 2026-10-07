"use client";

import { useEffect, useMemo, useState } from "react";
import { MessageSquare, Plus, Trash2 } from "lucide-react";

type Comment = {
  id: string;
  body: string;
  createdAt: string | Date;
  author: { id: string; name: string };
};

type Card = {
  id: string;
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  position: number;
  dueDate: string | Date | null;
  comments: Comment[];
};

type Column = {
  id: string;
  title: string;
  position: number;
  cards: Card[];
};

type Activity = {
  id: string;
  action: string;
  detail: string;
  createdAt: string | Date;
  actor: { id: string; name: string };
};

type Board = {
  id: string;
  name: string;
  description: string;
  columns: Column[];
  activities: Activity[];
};

const priorityClasses = {
  LOW: "bg-sky/10 text-sky",
  MEDIUM: "bg-amber/15 text-amber",
  HIGH: "bg-coral/10 text-coral"
};

export function KanbanBoard({ initialBoard }: { initialBoard: Board }) {
  const [board, setBoard] = useState(initialBoard);
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [syncLabel, setSyncLabel] = useState("Live");

  const refreshBoard = async (quiet = false) => {
    const response = await fetch(`/api/boards/${board.id}`, {
      cache: "no-store"
    });
    if (response.ok) {
      const data = await response.json();
      setBoard(data.board);
      if (!quiet) {
        setSyncLabel("Synced");
        window.setTimeout(() => setSyncLabel("Live"), 1200);
      }
    }
  };

  useEffect(() => {
    const channel = new BroadcastChannel(`board:${board.id}`);
    channel.onmessage = () => refreshBoard(true);
    const interval = window.setInterval(() => refreshBoard(true), 5000);
    return () => {
      channel.close();
      window.clearInterval(interval);
    };
  }, [board.id]);

  const broadcast = () => {
    new BroadcastChannel(`board:${board.id}`).postMessage({ type: "changed" });
  };

  const createCard = async (columnId: string, form: HTMLFormElement) => {
    const data = new FormData(form);
    const response = await fetch(`/api/boards/${board.id}/cards`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        columnId,
        title: String(data.get("title") || ""),
        description: String(data.get("description") || ""),
        priority: String(data.get("priority") || "MEDIUM")
      })
    });
    if (response.ok) {
      form.reset();
      await refreshBoard();
      broadcast();
    }
  };

  const moveCard = async (cardId: string, columnId: string) => {
    const column = board.columns.find((item) => item.id === columnId);
    const response = await fetch(`/api/cards/${cardId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        columnId,
        position: column?.cards.length ?? 0
      })
    });
    if (response.ok) {
      await refreshBoard();
      broadcast();
    }
  };

  const updateCard = async (cardId: string, payload: Partial<Card>) => {
    const response = await fetch(`/api/cards/${cardId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (response.ok) {
      await refreshBoard();
      broadcast();
    }
  };

  const deleteCard = async (cardId: string) => {
    const response = await fetch(`/api/cards/${cardId}`, {
      method: "DELETE"
    });
    if (response.ok) {
      setActiveCard(null);
      await refreshBoard();
      broadcast();
    }
  };

  const addComment = async (cardId: string, body: string) => {
    const response = await fetch(`/api/cards/${cardId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body })
    });
    if (response.ok) {
      await refreshBoard();
      broadcast();
    }
  };

  const selectedCard = useMemo(() => {
    if (!activeCard) {
      return null;
    }
    return (
      board.columns.flatMap((column) => column.cards).find((card) => card.id === activeCard.id) ??
      activeCard
    );
  }, [activeCard, board.columns]);

  return (
    <section className="mx-auto max-w-7xl px-5 py-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm font-medium text-ink/60">
          Drag cards between columns. Changes sync across open tabs.
        </div>
        <span className="rounded-md bg-moss/10 px-3 py-1 text-sm font-semibold text-moss">
          {syncLabel}
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="grid min-h-[640px] gap-4 md:grid-cols-3">
          {board.columns.map((column) => (
            <section
              key={column.id}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                const cardId = event.dataTransfer.getData("text/card-id");
                if (cardId) {
                  moveCard(cardId, column.id);
                }
              }}
              className="rounded-lg border border-line bg-white p-3"
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-semibold text-ink">{column.title}</h2>
                <span className="rounded-md bg-field px-2 py-1 text-xs font-semibold text-ink/60">
                  {column.cards.length}
                </span>
              </div>

              <div className="space-y-3">
                {column.cards.map((card) => (
                  <article
                    key={card.id}
                    draggable
                    onDragStart={(event) => {
                      event.dataTransfer.setData("text/card-id", card.id);
                    }}
                    onClick={() => setActiveCard(card)}
                    className="cursor-pointer rounded-lg border border-line bg-field p-3 transition hover:border-moss hover:bg-white"
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <h3 className="font-semibold leading-5 text-ink">
                        {card.title}
                      </h3>
                      <span
                        className={`rounded px-2 py-1 text-xs font-bold ${priorityClasses[card.priority]}`}
                      >
                        {card.priority}
                      </span>
                    </div>
                    {card.description && (
                      <p className="line-clamp-3 text-sm leading-6 text-ink/65">
                        {card.description}
                      </p>
                    )}
                    <div className="mt-3 flex items-center gap-2 text-xs font-medium text-ink/55">
                      <MessageSquare size={14} />
                      {card.comments.length}
                    </div>
                  </article>
                ))}
              </div>

              <form
                className="mt-4 rounded-lg border border-dashed border-line p-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  createCard(column.id, event.currentTarget);
                }}
              >
                <input
                  name="title"
                  required
                  placeholder="New card title"
                  className="w-full rounded-md border border-line bg-white px-3 py-2 text-sm outline-none focus:border-moss"
                />
                <textarea
                  name="description"
                  rows={2}
                  placeholder="Details"
                  className="mt-2 w-full resize-none rounded-md border border-line bg-white px-3 py-2 text-sm outline-none focus:border-moss"
                />
                <div className="mt-2 flex gap-2">
                  <select
                    name="priority"
                    className="min-w-0 flex-1 rounded-md border border-line bg-white px-2 py-2 text-sm"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                  <button className="flex items-center justify-center rounded-md bg-moss px-3 py-2 text-white">
                    <Plus size={16} />
                  </button>
                </div>
              </form>
            </section>
          ))}
        </div>

        <aside className="rounded-lg border border-line bg-white p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-moss">
            Activity
          </h2>
          <div className="mt-4 space-y-3">
            {board.activities.map((activity) => (
              <div key={activity.id} className="border-b border-line pb-3">
                <p className="text-sm leading-5 text-ink">
                  <span className="font-semibold">{activity.actor.name}</span>{" "}
                  {activity.detail}
                </p>
                <p className="mt-1 text-xs text-ink/50">
                  {new Date(activity.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {selectedCard && (
        <CardPanel
          card={selectedCard}
          onClose={() => setActiveCard(null)}
          onUpdate={updateCard}
          onDelete={deleteCard}
          onComment={addComment}
        />
      )}
    </section>
  );
}

function CardPanel({
  card,
  onClose,
  onUpdate,
  onDelete,
  onComment
}: {
  card: Card;
  onClose: () => void;
  onUpdate: (cardId: string, payload: Partial<Card>) => Promise<void>;
  onDelete: (cardId: string) => Promise<void>;
  onComment: (cardId: string, body: string) => Promise<void>;
}) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description);
  const [priority, setPriority] = useState<Card["priority"]>(card.priority);
  const [comment, setComment] = useState("");

  useEffect(() => {
    setTitle(card.title);
    setDescription(card.description);
    setPriority(card.priority);
  }, [card]);

  return (
    <div className="fixed inset-0 z-20 bg-ink/25 p-4" onClick={onClose}>
      <section
        className="ml-auto h-full w-full max-w-xl overflow-auto rounded-lg bg-white p-5 shadow-soft"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-ink">Card details</h2>
          <button
            onClick={() => onDelete(card.id)}
            className="rounded-md border border-coral/30 p-2 text-coral hover:bg-coral/10"
            aria-label="Delete card"
          >
            <Trash2 size={18} />
          </button>
        </div>

        <label className="mt-5 block">
          <span className="text-sm font-semibold text-ink">Title</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onBlur={() => onUpdate(card.id, { title })}
            className="mt-2 w-full rounded-md border border-line bg-field px-3 py-2 outline-none focus:border-moss"
          />
        </label>

        <label className="mt-4 block">
          <span className="text-sm font-semibold text-ink">Description</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            onBlur={() => onUpdate(card.id, { description })}
            rows={5}
            className="mt-2 w-full resize-none rounded-md border border-line bg-field px-3 py-2 outline-none focus:border-moss"
          />
        </label>

        <label className="mt-4 block">
          <span className="text-sm font-semibold text-ink">Priority</span>
          <select
            value={priority}
            onChange={(event) => {
              const value = event.target.value as Card["priority"];
              setPriority(value);
              onUpdate(card.id, { priority: value });
            }}
            className="mt-2 w-full rounded-md border border-line bg-field px-3 py-2"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </label>

        <div className="mt-6">
          <h3 className="font-semibold text-ink">Comments</h3>
          <form
            className="mt-3"
            onSubmit={async (event) => {
              event.preventDefault();
              if (!comment.trim()) {
                return;
              }
              await onComment(card.id, comment);
              setComment("");
            }}
          >
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              rows={3}
              placeholder="Add a comment"
              className="w-full resize-none rounded-md border border-line bg-field px-3 py-2 outline-none focus:border-moss"
            />
            <button className="mt-2 rounded-md bg-moss px-4 py-2 text-sm font-semibold text-white">
              Comment
            </button>
          </form>
          <div className="mt-4 space-y-3">
            {card.comments.map((item) => (
              <div key={item.id} className="rounded-md bg-field p-3">
                <p className="text-sm leading-6 text-ink">{item.body}</p>
                <p className="mt-2 text-xs font-medium text-ink/55">
                  {item.author.name} - {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
