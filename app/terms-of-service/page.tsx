import type { Metadata } from "next";
import { LegalPageView } from "@/components/site/LegalPageView";

export const metadata: Metadata = { title: "Terms of Service", alternates: { canonical: "/terms-of-service" } };

export default function Page() {
  return <LegalPageView slug="terms-of-service" />;
}
