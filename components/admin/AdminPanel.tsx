"use client";

import type { ReactNode } from "react";
import { MetricsPanel } from "@/components/admin/MetricsPanel";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { EmailsTable } from "@/components/admin/EmailsTable";
import { CustomersTable } from "@/components/admin/CustomersTable";
import { InvoicesTable } from "@/components/admin/InvoicesTable";
import { SubscriptionsTable } from "@/components/admin/SubscriptionsTable";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { BlogManager } from "@/components/admin/BlogManager";
import { DocsManager } from "@/components/admin/DocsManager";
import { VisitorsPanel } from "@/components/admin/VisitorsPanel";
import { EarningsPanel } from "@/components/admin/EarningsPanel";
import { AnnouncementsManager } from "@/components/admin/AnnouncementsManager";
import { GiftForm } from "@/components/admin/GiftForm";
import { WorkspacesPanel } from "@/components/admin/WorkspacesPanel";
import { PanelBoundary } from "@/components/admin/PanelBoundary";

// "emails" sits next to orders because that is the pairing that matters: an
// order is only fulfilled once its email actually left the building.
export const ADMIN_TABS = ["metrics", "orders", "emails", "workspaces", "earnings", "subscriptions", "customers", "invoices", "visitors", "announcements", "blog", "docs", "settings"] as const;
export type AdminTab = (typeof ADMIN_TABS)[number];

/** Every tab's section. A Record, so a new tab cannot ship without one. */
const PANELS: Record<AdminTab, () => ReactNode> = {
  metrics: () => <MetricsPanel />,
  orders: () => <OrdersTable />,
  emails: () => <EmailsTable />,
  workspaces: () => <WorkspacesPanel />,
  earnings: () => <EarningsPanel />,
  subscriptions: () => <SubscriptionsTable />,
  customers: () => (
    <div>
      <GiftForm />
      <CustomersTable />
    </div>
  ),
  invoices: () => <InvoicesTable />,
  visitors: () => <VisitorsPanel />,
  announcements: () => <AnnouncementsManager />,
  blog: () => <BlogManager />,
  docs: () => <DocsManager />,
  settings: () => <SettingsForm />,
};

/**
 * The open tab's section, inside its own error boundary. Keyed by the tab, so
 * a section that failed starts clean when it is opened again.
 */
export function AdminPanel({ tab }: { tab: AdminTab }) {
  return (
    <PanelBoundary key={tab} name={tab}>
      {PANELS[tab]()}
    </PanelBoundary>
  );
}
