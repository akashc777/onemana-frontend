// Kept in step with site.demoUrl (lib/site.ts), which this file cannot import.
const demoUrl = (process.env.NEXT_PUBLIC_DEMO_URL || "https://onecamp.onemana.dev").replace(/\/$/, "");

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    poweredByHeader: false,
    // Addresses people type or search engines guess. /pricing was a 404, and
    // the pricing lives on the home page.
    async redirects() {
        return [
            { source: "/pricing", destination: "/#pricing", permanent: false },
            { source: "/governance", destination: "/#governance", permanent: false },
            { source: "/login", destination: "/account", permanent: false },
            { source: "/signin", destination: "/account", permanent: false },
            // Addresses people type, or that posts and emails have linked to,
            // for pages that live elsewhere. The demo is on its own host; see
            // site.demoStartUrl for why it carries start_demo.
            { source: "/demo", destination: `${demoUrl}${demoUrl.includes("?") ? "&" : "?"}start_demo=1`, permanent: false },
            { source: "/contact", destination: "/about#contact", permanent: false },
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
                ],
            },
        ];
    },
};

export default nextConfig;
