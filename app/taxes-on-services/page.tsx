import { LegalPageView } from "@/components/site/LegalPageView";
import { legalMetadata } from "@/lib/legalPages";

export const metadata = legalMetadata("taxes-on-services");

export default function Page() {
  return <LegalPageView slug="taxes-on-services" />;
}
