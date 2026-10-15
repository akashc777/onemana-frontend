import { LegalPageView } from "@/components/site/LegalPageView";
import { legalMetadata } from "@/lib/legalPages";

export const metadata = legalMetadata("refund-policy");

export default function Page() {
  return <LegalPageView slug="refund-policy" />;
}
