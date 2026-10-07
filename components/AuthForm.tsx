"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Mode = "login" | "register";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const payload =
      mode === "register"
        ? {
            name: String(form.get("name") || ""),
            email: String(form.get("email") || ""),
            password: String(form.get("password") || "")
          }
        : {
            email: String(form.get("email") || ""),
            password: String(form.get("password") || "")
          };

    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setLoading(false);

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error || "Something went wrong");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <section className="w-full max-w-md rounded-lg border border-line bg-white p-8 shadow-soft">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-moss">
            Mini-Trello
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-ink">
            {mode === "register" ? "Create your workspace" : "Welcome back"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-ink/70">
            Plan ideas, move tasks, and keep a compact activity trail for every
            project board.
          </p>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          {mode === "register" && (
            <label className="block">
              <span className="text-sm font-medium text-ink">Name</span>
              <input
                name="name"
                required
                minLength={2}
                className="mt-2 w-full rounded-md border border-line bg-field px-3 py-2 outline-none focus:border-moss"
              />
            </label>
          )}
          <label className="block">
            <span className="text-sm font-medium text-ink">Email</span>
            <input
              name="email"
              type="email"
              required
              className="mt-2 w-full rounded-md border border-line bg-field px-3 py-2 outline-none focus:border-moss"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink">Password</span>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              className="mt-2 w-full rounded-md border border-line bg-field px-3 py-2 outline-none focus:border-moss"
            />
          </label>

          {error && (
            <p className="rounded-md border border-coral/30 bg-coral/10 px-3 py-2 text-sm text-coral">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-moss px-4 py-2.5 font-semibold text-white transition hover:bg-moss/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading
              ? "Working..."
              : mode === "register"
                ? "Create account"
                : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink/70">
          {mode === "register" ? "Already have an account?" : "New here?"}{" "}
          <Link
            href={mode === "register" ? "/login" : "/register"}
            className="font-semibold text-moss"
          >
            {mode === "register" ? "Sign in" : "Create one"}
          </Link>
        </p>
      </section>
    </main>
  );
}
