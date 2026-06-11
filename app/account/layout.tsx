import type { Metadata } from "next";

// The account portal is private (per-customer, behind sign-in), so keep it out
// of search indexes.
export const metadata: Metadata = {
  title: "My Account",
  robots: { index: false, follow: false },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
