"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * The address somebody asked for, as the 404 page writes it down.
 *
 * Written in once the page has hydrated: the 404 is built once, ahead of
 * time, where the path is the build's own ("/_not-found"), so drawing the
 * visitor's path on the first render made the server's text and the
 * browser's differ. React threw that render away (error #425) and drew the
 * whole page again in the browser. The row keeps its line meanwhile, so
 * nothing moves when the path arrives.
 */
export function MissingPath() {
  const path = usePathname();
  const [shown, setShown] = useState<string | null>(null);
  useEffect(() => setShown(path || "/"), [path]);
  return (
    <span translate="no" className="break-all">
      {shown ?? "\u00a0"}
    </span>
  );
}
