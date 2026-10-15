import { LegalPageView } from "@/components/site/LegalPageView";
import { legalMetadata } from "@/lib/legalPages";

export const metadata = legalMetadata("terms-of-service");

export default function Page() {
  return <LegalPageView slug="terms-of-service" />;
}
