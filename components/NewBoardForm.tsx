"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

export function NewBoardForm({ workspaceId }: { workspaceId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);

    const response = await fetch("/api/boards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workspaceId,
        name: String(form.get("name") || ""),
        description: String(form.get("description") || "")
      })
    });

    setLoading(false);
    if (response.ok) {
      const data = await response.json();
      router.push(`/boards/${data.board.id}`);
      router.refresh();
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-md bg-moss px-4 py-2 font-semibold text-white hover:bg-moss/90"
      >
        <Plus size={18} />
        New board
      </button>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-sm rounded-lg border border-line bg-white p-4 shadow-soft"
    >
      <input
        name="name"
        required
        placeholder="Board name"
        className="w-full rounded-md border border-line bg-field px-3 py-2 outline-none focus:border-moss"
      />
      <textarea
        name="description"
        placeholder="Short description"
        rows={2}
        className="mt-3 w-full resize-none rounded-md border border-line bg-field px-3 py-2 outline-none focus:border-moss"
      />
      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md border border-line px-3 py-2 text-sm font-medium"
        >
          Cancel
        </button>
        <button
          disabled={loading}
          className="rounded-md bg-moss px-3 py-2 text-sm font-semibold text-white disabled:opacity-70"
        >
          {loading ? "Creating..." : "Create"}
        </button>
      </div>
    </form>
  );
}
