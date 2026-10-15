import type { Metadata } from "next";
import { LegalPageView } from "@/components/site/LegalPageView";

export const metadata: Metadata = { title: "Refund policy", alternates: { canonical: "/refund-policy" } };

export default function Page() {
  return <LegalPageView slug="refund-policy" />;
}
