import type { Metadata } from "next";
import { LegalPageView } from "@/components/site/LegalPageView";

export const metadata: Metadata = { title: "Refund Policy" };

export default function Page() {
  return <LegalPageView slug="refund-policy" />;
}
