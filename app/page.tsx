import { headers } from "next/headers"
import Link from "next/link"

import { Plus } from "lucide-react"

import { auth } from "@/lib/auth"
import { PROJECT_LIMITS_VARIABLES } from "@/lib/constants"
import { DrBadge } from "@/components/home/dr-badge"
import { HeroSection } from "@/components/home/hero-section"
import { ProjectSection } from "@/components/home/project-section"
import { SponsorCards } from "@/components/shared/sponsor-cards"
import { getMonthBestProjects, getTodayProjects, getYesterdayProjects } from "@/app/actions/home"

export default async function Home() {
  // Données mock en parallèle — 1 seul round-trip au lieu de 7 séquentiels
  const reqHeaders = await headers()
  // Perf: session is fetched once here and its user id is passed down so the
  // data actions skip their own redundant session lookups (audit H2).
  const session = (await auth.api.getSession({ headers: reqHeaders }).catch(() => null)) as {
    user?: { id?: string }
  } | null
  const userId = session?.user?.id ?? null
  const [todayProjects, yesterdayProjects, monthProjects] = await Promise.all([
    getTodayProjects(PROJECT_LIMITS_VARIABLES.TODAY_LIMIT, userId),
    getYesterdayProjects(PROJECT_LIMITS_VARIABLES.YESTERDAY_LIMIT, userId),
    getMonthBestProjects(PROJECT_LIMITS_VARIABLES.MONTH_LIMIT, userId),
  ])

  // Stable-ish "online now" figure that rotates daily (no fake live socket needed)
  const now = new Date()
  const onlineNow = 64 + ((now.getDate() * 7 + (now.getMonth() + 1) * 13) % 72)

  return (
    <main className="bg-muted/30 min-h-screen">
      <div className="w-full px-4 pt-6 pb-12 md:px-8 md:pt-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:items-start">
          {/* Contenu principal */}
          <div className="space-y-6 sm:space-y-8 lg:col-span-2">
            {/* Hero */}
            <HeroSection visitorsThisMonth={null} onlineNow={onlineNow} />

            <ProjectSection
              title="Top Projects Launching Today"
              projects={todayProjects}
              sortByUpvotes={true}
              isAuthenticated={!!session?.user}
              eagerFirstImage={true}
            />

            <ProjectSection
              title="Yesterday's Launches"
              projects={yesterdayProjects}
              moreHref="/trending?filter=yesterday"
              sortByUpvotes={true}
              isAuthenticated={!!session?.user}
            />

            <ProjectSection
              title="This Month's Best"
              projects={monthProjects}
              moreHref="/trending?filter=month"
              sortByUpvotes={true}
              isAuthenticated={!!session?.user}
            />
          </div>

          {/* Sidebar */}
          <div className="top-24">
            {/* Domain rating badge */}
            <div className="pt-0 pb-4">
              <DrBadge domain="saasflock.com" score={58} />
            </div>
            {/* Ad Spot */}
            <div className="space-y-3 py-4">
              <h3 className="flex items-center font-semibold">Ad Spot</h3>
              <SponsorCards />
            </div>

            {/* Ad banner */}
            <div className="space-y-3 py-4">
              <Link
                href="/sponsors"
                className="border-copper/50 bg-copper-soft/40 hover:bg-copper-soft/70 group flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors"
              >
                <span className="bg-copper flex h-10 w-10 items-center justify-center rounded-full text-white transition-transform group-hover:scale-110">
                  <Plus className="h-5 w-5" />
                </span>
                <span className="text-foreground text-sm font-semibold">Add your Ad here</span>
                <span className="text-muted-foreground text-xs">
                  Reach thousands of SaaS makers
                </span>
              </Link>
            </div>
            {/* Podium
            {yesterdayProjects.length > 0 && (
              <div className="p-5 pt-0 space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  Yesterday&apos;s Top Launches
                </h3>
                <TopLaunchesPodium topProjects={yesterdayProjects} />
              </div>
            )} */}

            {/* Quick Links */}
            <div className="space-y-3 py-4">
              <h3 className="flex items-center gap-2 font-semibold">Quick Access</h3>
              <div className="space-y-2">
                {session?.user && (
                  <Link
                    href="/dashboard"
                    className="-mx-2 flex items-center gap-2 rounded-md p-2 text-sm transition-colors hover:underline"
                  >
                    Dashboard
                  </Link>
                )}
                <Link
                  href="/trending"
                  className="-mx-2 flex items-center gap-2 rounded-md p-2 text-sm transition-colors hover:underline"
                >
                  Trending Now
                </Link>
                <Link
                  href="/winners"
                  className="-mx-2 flex items-center gap-2 rounded-md p-2 text-sm transition-colors hover:underline"
                >
                  Daily Winners
                </Link>
                <Link
                  href="/trending?filter=month"
                  className="-mx-2 flex items-center gap-2 rounded-md p-2 text-sm transition-colors hover:underline"
                >
                  Best of Month
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
