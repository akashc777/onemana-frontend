import type { Metadata } from "next";
import { LegalPageView } from "@/components/site/LegalPageView";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function Page() {
  return <LegalPageView slug="privacy-policy" />;
}
