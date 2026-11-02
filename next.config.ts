import type { NextConfig } from "next"

import createMDX from "@next/mdx"

const nextConfig: NextConfig = {
  /* config options here */
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,

  // Faster local dev + smaller production bundles
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "date-fns",
      "recharts",
      "@radix-ui/react-accordion",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-select",
      "@radix-ui/react-tabs",
      "@radix-ui/react-tooltip",
      "@tanstack/react-table",
      "motion",
    ],
  },

  // Configuration pour MDX
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "yt3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "yt3.ggpht.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "designmodo.com",
      },
      ...(process.env.NEXT_PUBLIC_UPLOADTHING_URL
        ? [
            {
              protocol: "https" as const,
              hostname: process.env.NEXT_PUBLIC_UPLOADTHING_URL,
            },
          ]
        : []),
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "nexty.dev",
      },
      {
        protocol: "https",
        hostname: "yxucdfr9f5.ufs.sh",
      },
      {
        protocol: "https",
        hostname: "assets.open-launch.com",
      },
      {
        protocol: "https",
        hostname: "frogdr.com",
      },
    ],
  },
}

const withMDX = createMDX({
  options: {
    remarkPlugins: ["remark-gfm"],
  },
})

// Combine MDX and Next.js config
export default withMDX(nextConfig)
