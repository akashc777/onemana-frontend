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
