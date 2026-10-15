import { LegalPageView } from "@/components/site/LegalPageView";
import { legalMetadata } from "@/lib/legalPages";

export const metadata = legalMetadata("privacy-policy");

export default function Page() {
  return <LegalPageView slug="privacy-policy" />;
}
