import type { Metadata } from "next";
import { LegalPageView } from "@/components/site/LegalPageView";

export const metadata: Metadata = { title: "Taxes on services", alternates: { canonical: "/taxes-on-services" } };

export default function Page() {
  return <LegalPageView slug="taxes-on-services" />;
}
