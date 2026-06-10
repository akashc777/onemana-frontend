import type { Metadata } from "next";
import { LegalPageView } from "@/components/site/LegalPageView";

export const metadata: Metadata = { title: "About Us" };

export default function Page() {
  return <LegalPageView slug="about" />;
}
