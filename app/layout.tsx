import type { Metadata } from "next"
import { Inter as FontSans } from "next/font/google"

import PlausibleProvider from "next-plausible"
import { Toaster } from "sonner"

import Footer from "@/components/layout/footer"
import Nav from "@/components/layout/nav"
import { ThemeProvider } from "@/components/theme/theme-provider"

import "./globals.css"

// Single Inter load shared by body + headings (was loaded twice before)
const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  preload: true,
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL!),
  title: "SaaS Flock - Discover the Best SaaS Tools",
  description:
    "SaaS Flock is a platform to discover and upvote the best SaaS tools. Find top SaaS products launching daily.",
  openGraph: {
    title: "SaaS Flock - Discover the Best SaaS Tools",
    description:
      "SaaS Flock is a platform to discover and upvote the best SaaS tools. Find top SaaS products launching daily.",
    url: process.env.NEXT_PUBLIC_URL,
    siteName: "SaaS Flock",
    images: [
      {
        url: "og.png",
        width: 1200,
        height: 630,
        alt: "SaaS Flock - Discover the Best SaaS Tools",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SaaS Flock - Discover the Best SaaS Tools",
    description:
      "SaaS Flock is a platform to discover and upvote the best SaaS tools. Find top SaaS products launching daily.",
    images: ["og.png"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <PlausibleProvider
          domain="open-launch.com"
          customDomain="https://plausible.dailypings.com"
          selfHosted={true}
          trackOutboundLinks={true}
          scriptProps={{
            src: "https://plausible.dailypings.com/js/script.js",
          }}
          enabled={process.env.NODE_ENV === "production"}
        />
      </head>
      <body
        className={`font-sans antialiased ${fontSans.variable} sm:overflow-y-scroll`}
        style={{ ["--font-heading" as string]: "var(--font-sans)" }}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-dvh flex-col">
            <Nav />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  )
}
