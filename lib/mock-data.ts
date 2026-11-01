export const isMockMode = () => process.env.USE_MOCK_DATA === "true"

export const MOCK_CATEGORIES = [
  { id: "saas", name: "SaaS", count: 12 },
  { id: "ai", name: "Artificial Intelligence", count: 10 },
  { id: "developer-tools", name: "Developer Tools", count: 9 },
  { id: "productivity", name: "Productivity", count: 8 },
  { id: "design-tools", name: "Design Tools", count: 6 },
  { id: "marketing-tools", name: "Marketing Tools", count: 5 },
  { id: "open-source", name: "Open Source", count: 5 },
  { id: "analytics", name: "Business Analytics", count: 4 },
  { id: "api", name: "APIs & Integrations", count: 4 },
  { id: "mobile-dev", name: "Mobile Development", count: 3 },
]

function p(
  id: string,
  name: string,
  description: string,
  upvotes: number,
  status: "ongoing" | "launched" | "scheduled" = "ongoing",
  i = 0,
) {
  const now = new Date()
  return {
    id,
    name,
    slug: id,
    description,
    logoUrl: `/logos/${id}.svg`,
    websiteUrl: "https://example.com",
    launchStatus: status,
    launchType: i % 3 === 0 ? "premium_plus" : i % 2 === 0 ? "premium" : "free",
    dailyRanking: i < 3 ? i + 1 : null,
    scheduledLaunchDate: now,
    createdAt: now,
    updatedAt: now,
    upvoteCount: upvotes,
    commentCount: (upvotes % 5) + 1,
    userHasUpvoted: false,
    pricing: "freemium",
    techStack: ["Next.js", "TypeScript", "Tailwind"],
    platforms: ["web"],
    categories: [
      { id: "saas", name: "SaaS" },
      { id: "ai", name: "Artificial Intelligence" },
    ],
    creator: { id: "mock-user", name: "Demo Maker", image: "" },
    createdBy: "mock-user",
    coverImageUrl: null,
    productImage: null,
    githubUrl: "https://github.com",
    twitterUrl: "https://x.com",
    featuredOnHomepage: i === 0,
  }
}

export const MOCK_PROJECTS = [
  p("flowboard", "Flowboard", "Kanban + docs + AI summaries for fast teams.", 248, "ongoing", 0),
  p(
    "promptbase-pro",
    "Promptbase Pro",
    "Version, test and ship LLM prompts with evals.",
    196,
    "ongoing",
    1,
  ),
  p(
    "shipfast-analytics",
    "Shipfast Analytics",
    "Privacy-friendly analytics in 1 line of code.",
    174,
    "ongoing",
    2,
  ),
  p("devsnap", "DevSnap", "Instant staging previews for every PR.", 152, "ongoing", 3),
  p("mailforge", "Mailforge", "Transactional email with React components.", 131, "ongoing", 4),
  p("taskly-ai", "Taskly AI", "AI daily planner that blocks your calendar.", 118, "launched", 5),
  p("uiboard", "UIBoard", "Copy-paste Tailwind sections, dark mode ready.", 104, "launched", 6),
  p("apihub", "APIHub", "Mock, document and monitor APIs in one place.", 92, "launched", 7),
  p("noti-fy", "Noti-fy", "One API for email, SMS, push and Discord.", 81, "scheduled", 8),
  p("vaultpass", "VaultPass", "Team password vault with passkeys.", 73, "scheduled", 9),
  p(
    "standup-bot",
    "Standup Bot",
    "Async standups in Slack, summary in Notion.",
    64,
    "scheduled",
    10,
  ),
  p(
    "changelog-pro",
    "Changelog Pro",
    "Beautiful changelogs from git commits.",
    52,
    "scheduled",
    11,
  ),
]

export const getMockToday = (n = 6) =>
  MOCK_PROJECTS.filter((x) => x.launchStatus === "ongoing").slice(0, n)
export const getMockYesterday = (n = 6) =>
  MOCK_PROJECTS.filter((x) => x.launchStatus === "launched").slice(0, n)
export const getMockMonth = (n = 6) =>
  [...MOCK_PROJECTS].sort((a, b) => b.upvoteCount - a.upvoteCount).slice(0, n)
export const getMockWinners = () =>
  MOCK_PROJECTS.filter((x) => x.dailyRanking != null)
    .sort((a, b) => (a.dailyRanking ?? 9) - (b.dailyRanking ?? 9))
    .slice(0, 3)
export const getMockTopCategories = (n = 5) => MOCK_CATEGORIES.slice(0, n)
export const getMockProjectBySlug = (slug: string) =>
  MOCK_PROJECTS.find((x) => x.slug === slug) ?? null
