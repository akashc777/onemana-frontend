"use client";

import { usePathname } from "next/navigation";

/** The address somebody asked for, as the 404 page writes it down. */
export function MissingPath() {
  const path = usePathname();
  return (
    <span translate="no" className="break-all">
      {path || "/"}
    </span>
  );
}
