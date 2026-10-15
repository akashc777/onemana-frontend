import { LegalPageView } from "@/components/site/LegalPageView";
import { legalMetadata } from "@/lib/legalPages";

export const metadata = legalMetadata("account-ownership-policy");

export default function Page() {
  return <LegalPageView slug="account-ownership-policy" />;
}
