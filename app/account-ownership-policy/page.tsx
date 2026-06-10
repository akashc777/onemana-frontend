import type { Metadata } from "next";
import { LegalPageView } from "@/components/site/LegalPageView";

export const metadata: Metadata = { title: "Account Ownership Policy" };

export default function Page() {
  return <LegalPageView slug="account-ownership-policy" />;
}
