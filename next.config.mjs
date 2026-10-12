// Kept in step with site.demoUrl (lib/site.ts), which this file cannot import.
const demoUrl = (process.env.NEXT_PUBLIC_DEMO_URL || "https://onecamp.onemana.dev").replace(/\/$/, "");

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    poweredByHeader: false,
    // No image goes through the optimiser: each resize is a transformation
    // on Vercel's free plan. Every picture on the site is drawn inline or is a
    // static file of its own size; blog covers (CMS content) are shown as
    // published, in a fixed 16:10 box (components/blog/PostCover.tsx).
    images: { unoptimized: true },
    // Addresses people type or search engines guess. /pricing is a page of its
    // own since 10 Oct 2026, so it no longer redirects to the home page.
    async redirects() {
        return [
            { source: "/governance", destination: "/#governance", permanent: false },
            { source: "/login", destination: "/account", permanent: false },
            { source: "/signin", destination: "/account", permanent: false },
            // The "choose a name" reminder linked here for a while, and this page
            // never existed; those emails are in inboxes still.
            { source: "/portal", destination: "/account", permanent: false },
            { source: "/portal/:path*", destination: "/account", permanent: false },
            // Addresses people type, or that posts and emails have linked to,
            // for pages that live elsewhere. The demo is on its own host; see
            // site.demoStartUrl for why it carries start_demo.
            { source: "/demo", destination: `${demoUrl}${demoUrl.includes("?") ? "&" : "?"}start_demo=1`, permanent: false },
            { source: "/contact", destination: "/about#contact", permanent: false },
            // The per-rival pages live under /alternatives/<rival>; the bare
            // address was a 404 that people typed and linked.
            { source: "/alternatives", destination: "/compare", permanent: false },
            { source: "/support", destination: "/about#contact", permanent: false },
        ];
    },
    async headers() {
        return [
            {
                source: "/:path*",
                headers: [
                    { key: "X-Content-Type-Options", value: "nosniff" },
                    { key: "X-Frame-Options", value: "SAMEORIGIN" },
                    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
                    // Only the parts of a content security policy that cannot block
                    // anything this site loads: no <base> tag can repoint its
                    // relative links, no plugin content, and no framing by other
                    // sites (what X-Frame-Options already says, in the newer form).
                    // Both HTML sinks (lib/markdown, lib/jsonLd) sanitise already;
                    // this is the floor under them if that ever slips.
                    //
                    // NOT script-src, connect-src, frame-src or img-src, on purpose.
                    // This app router build emits inline scripts, so a policy for
                    // them needs a nonce from middleware on every request (no more
                    // static pages) or 'unsafe-inline', which gives most of the
                    // protection back. And Razorpay Checkout loads its own scripts,
                    // frames and calls, plus whatever a bank's 3-D Secure page
                    // needs, none of which can be exercised here without paying.
                    // A policy that breaks checkout fails silently and costs every
                    // sale, so it is trialled as Content-Security-Policy-Report-Only
                    // in a browser first, not shipped blind.
                    { key: "Content-Security-Policy", value: "base-uri 'self'; object-src 'none'; frame-ancestors 'self'" },
                ],
            },
        ];
    },
};

export default nextConfig;
