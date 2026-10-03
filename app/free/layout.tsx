import type { Metadata } from "next";
import { site } from "@/lib/site";
import { FREE_SEATS } from "@/lib/freePlan";

export const metadata: Metadata = {
  title: "Start OneCamp free",
  description: `Run OneCamp on your own server, free for up to ${FREE_SEATS} people, with chat, docs, tasks, calls and AI teammates. No card.`,
  alternates: { canonical: "/free" },
  openGraph: {
    title: `OneCamp is free for up to ${FREE_SEATS} people`,
    description: "Chat, tasks, docs, calls and AI teammates on your own server. One command to install. No card.",
    url: `${site.url}/free`,
    type: "website",
  },
};

export default function FreeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
