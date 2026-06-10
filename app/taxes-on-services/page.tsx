import type { Metadata } from "next";
import { LegalPageView } from "@/components/site/LegalPageView";

export const metadata: Metadata = { title: "Taxes on Services" };

export default function Page() {
  return <LegalPageView slug="taxes-on-services" />;
}
