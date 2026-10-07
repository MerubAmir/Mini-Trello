import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mini-Trello",
  description: "A real-time inspired task and idea Kanban board."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
