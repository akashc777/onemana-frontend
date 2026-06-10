import type { Metadata } from "next";
import { LegalPageView } from "@/components/site/LegalPageView";

export const metadata: Metadata = { title: "Setup & Docs" };

export default function Page() {
  return <LegalPageView slug="onecamp-doc" />;
}
