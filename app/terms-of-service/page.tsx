import type { Metadata } from "next";
import { LegalPageView } from "@/components/site/LegalPageView";

export const metadata: Metadata = { title: "Terms of Service" };

export default function Page() {
  return <LegalPageView slug="terms-of-service" />;
}
