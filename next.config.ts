import type { NextConfig } from "next";

// next/image refuses remote images unless their host is listed here.
// Derived from the env var so it works locally and on Vercel with no
// second edit. Exactly one hostname — never a "**" wildcard, which
// would turn the image endpoint into an open proxy.
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseHost
      ? [
          {
            protocol: "https",
            hostname: supabaseHost,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
};

export default nextConfig;
