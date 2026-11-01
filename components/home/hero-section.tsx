"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { ArrowRight, BadgeCheck, Bot, Globe, Link2, Search, Sparkles } from "lucide-react"

function GoogleG({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

interface HeroSectionProps {
  visitorsThisMonth: number | null
  onlineNow: number
}

export function HeroSection({ visitorsThisMonth, onlineNow }: HeroSectionProps) {
  const router = useRouter()
  const [website, setWebsite] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const value = website.trim()
    if (!value) {
      router.push("/projects/submit")
      return
    }
    const normalized = /^https?:\/\//i.test(value) ? value : `https://${value}`
    router.push(`/projects/submit?website=${encodeURIComponent(normalized)}`)
  }

  return (
    <section className="border-border/40 bg-secondary/70 relative z-10 overflow-hidden rounded-[20px] border">
      {/* Soft copper glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_90%_at_50%_0%,rgba(199,91,57,0.14),transparent)]"
      />
      <div className="relative px-5 py-8 md:px-8 md:py-10">
        {/* Live stats pill */}
        <div className="border-border bg-card inline-flex max-w-full flex-wrap items-center gap-x-2 gap-y-1 rounded-full border px-3.5 py-1.5 text-[13px] shadow-sm">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            {onlineNow} online
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">
            {(visitorsThisMonth ?? 1284).toLocaleString("en-US")} visitors this month
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-foreground mt-5 text-3xl font-bold tracking-tight text-balance md:text-[2.75rem] md:leading-[1.08]">
          Get your product in front of{" "}
          <span className="bg-gradient-to-r from-[#e07a4a] to-[#f2b25c] bg-clip-text text-transparent">
            AI Search
          </span>
        </h1>

        {/* Sub copy */}
        <p className="text-muted-foreground mt-4 max-w-xl text-sm leading-relaxed md:text-base">
          Publish on SaaSFlock for free. Get a lasting product page, a quality backlink, and get
          found across Google, AI search, and LLMs.
        </p>

        {/* Discovery row */}
        <p className="text-muted-foreground mt-4 flex flex-wrap items-center gap-x-2 gap-y-2 text-[13px] md:text-sm">
          Make your product easier to find on
          <span className="inline-flex items-center gap-2 pl-1">
            <GoogleG />
            <Sparkles className="text-copper h-4 w-4" />
            <Bot className="text-muted-foreground h-4 w-4" />
            <Globe className="text-muted-foreground h-4 w-4" />
          </span>
        </p>

        {/* URL + CTA bar */}
        <form
          onSubmit={handleSubmit}
          className="border-foreground/70 bg-background mt-5 flex flex-col gap-2 rounded-2xl border-2 p-2 shadow-[4px_4px_0_0_#1e2f27] sm:flex-row sm:items-center dark:shadow-[4px_4px_0_0_rgba(250,247,241,0.85)]"
        >
          <input
            type="text"
            inputMode="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://yourwebsite.com"
            aria-label="Your website URL"
            className="text-foreground placeholder:text-muted-foreground/70 w-full flex-1 bg-transparent px-3 py-2.5 text-sm outline-none md:text-[15px]"
          />
          <button
            type="submit"
            className="bg-copper hover:bg-copper-deep inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl px-5 py-3 text-sm font-semibold whitespace-nowrap text-white outline-2 outline-offset-[-5px] outline-white/50 transition-colors outline-dashed"
          >
            Submit your product for free
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Trust row */}
        <div className="text-muted-foreground mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] md:text-sm">
          <span className="inline-flex items-center gap-1.5">
            <BadgeCheck className="text-copper h-4 w-4" />
            Free submission
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Link2 className="text-copper h-4 w-4" />
            Quality backlink
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Search className="text-copper h-4 w-4" />
            Google + AI discovery
          </span>
        </div>
      </div>
    </section>
  )
}
