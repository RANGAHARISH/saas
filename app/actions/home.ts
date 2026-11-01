"use server"

import { headers } from "next/headers"

import { db } from "@/drizzle/db"
import {
  category as categoryTable,
  fumaComments,
  launchStatus,
  launchType,
  project as projectTable,
  projectToCategory,
  upvote,
} from "@/drizzle/db/schema"
import { endOfMonth, startOfMonth } from "date-fns"
import { and, desc, eq, sql } from "drizzle-orm"

import { auth } from "@/lib/auth"
import { PROJECT_LIMITS_VARIABLES } from "@/lib/constants"
import {
  getMockMonth,
  getMockToday,
  getMockWinners,
  getMockYesterday,
  isMockMode,
} from "@/lib/mock-data"

const shouldUseMock = () => isMockMode()

async function getCurrentUserId() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    return session?.user?.id ?? null
  } catch {
    return null
  }
}

// Perf: callers that already hold the session pass the user id through so we
// don't pay for a redundant session lookup per section. `undefined` preserves
// the old behavior (resolve internally) for existing callers.
function resolveUserId(userId: string | null | undefined): Promise<string | null> {
  return userId !== undefined ? Promise.resolve(userId) : getCurrentUserId()
}

async function enrichProjectsWithUserData<T extends { id: string }>(
  projects: T[],
  userId: string | null,
): Promise<
  (T & {
    userHasUpvoted: boolean
    categories: { id: string; name: string }[]
  })[]
> {
  if (!projects.length) return []

  const projectIds = projects.map((p) => p.id)

  // Perf: categories + upvotes are independent — fetch in parallel instead of
  // sequentially.
  const categoriesPromise = db
    .select({
      projectId: projectToCategory.projectId,
      categoryId: categoryTable.id,
      categoryName: categoryTable.name,
    })
    .from(projectToCategory)
    .innerJoin(categoryTable, eq(categoryTable.id, projectToCategory.categoryId))
    .where(sql`${projectToCategory.projectId} IN ${projectIds}`)

  const upvotesPromise = userId
    ? db
        .select({ projectId: upvote.projectId })
        .from(upvote)
        .where(and(eq(upvote.userId, userId), sql`${upvote.projectId} IN ${projectIds}`))
    : Promise.resolve([] as { projectId: string }[])

  const [categoriesData, userUpvotes] = await Promise.all([categoriesPromise, upvotesPromise])

  const categoriesByProjectId = categoriesData.reduce(
    (acc, row) => {
      if (!acc[row.projectId]) {
        acc[row.projectId] = []
      }
      acc[row.projectId].push({ id: row.categoryId, name: row.categoryName })
      return acc
    },
    {} as Record<string, { id: string; name: string }[]>,
  )

  const userUpvotedProjectIds = new Set(userUpvotes.map((uv) => uv.projectId))

  return projects.map((project) => ({
    ...project,
    userHasUpvoted: userUpvotedProjectIds.has(project.id),
    categories: categoriesByProjectId[project.id] || [],
  }))
}

export async function getTodayProjects(
  limit: number = PROJECT_LIMITS_VARIABLES.TODAY_LIMIT,
  userId?: string | null,
) {
  if (shouldUseMock()) return getMockToday(limit) as never
  // Perf: main query and session lookup run concurrently.
  const [todayProjectsBase, resolvedUserId] = await Promise.all([
    db
      .select({
        id: projectTable.id,
        name: projectTable.name,
        slug: projectTable.slug,
        description: projectTable.description,
        logoUrl: projectTable.logoUrl,
        websiteUrl: projectTable.websiteUrl,
        launchStatus: projectTable.launchStatus,
        launchType: projectTable.launchType,
        dailyRanking: projectTable.dailyRanking,
        scheduledLaunchDate: projectTable.scheduledLaunchDate,
        createdAt: projectTable.createdAt,
        upvoteCount: sql<number>`cast(count(distinct ${upvote.id}) as int)`.mapWith(Number),
        commentCount: sql<number>`cast(count(distinct ${fumaComments.id}) as int)`.mapWith(Number),
      })
      .from(projectTable)
      .leftJoin(upvote, eq(upvote.projectId, projectTable.id))
      .leftJoin(fumaComments, sql`"fuma_comments"."page"::text = ${projectTable.id}`)
      .where(eq(projectTable.launchStatus, launchStatus.ONGOING))
      .groupBy(projectTable.id)
      .orderBy(desc(sql`count(distinct ${upvote.id})`))
      .limit(limit),
    resolveUserId(userId),
  ])

  return enrichProjectsWithUserData(todayProjectsBase, resolvedUserId)
}

export async function getYesterdayProjects(
  limit: number = PROJECT_LIMITS_VARIABLES.YESTERDAY_LIMIT,
  userId?: string | null,
) {
  if (shouldUseMock()) return getMockYesterday(limit) as never
  const now = new Date()
  const isBeforeLaunchTime = now.getUTCHours() < 8
  const yesterdayStart = new Date(now)
  yesterdayStart.setUTCHours(8, 0, 0, 0)
  if (isBeforeLaunchTime) {
    yesterdayStart.setDate(yesterdayStart.getDate() - 2)
  } else {
    yesterdayStart.setDate(yesterdayStart.getDate() - 1)
  }
  const yesterdayEnd = new Date(yesterdayStart)
  yesterdayEnd.setDate(yesterdayEnd.getDate() + 1)

  // Perf: main query and session lookup run concurrently.
  const [yesterdayProjectsBase, resolvedUserId] = await Promise.all([
    db
      .select({
        id: projectTable.id,
        name: projectTable.name,
        slug: projectTable.slug,
        description: projectTable.description,
        logoUrl: projectTable.logoUrl,
        websiteUrl: projectTable.websiteUrl,
        launchStatus: projectTable.launchStatus,
        launchType: projectTable.launchType,
        scheduledLaunchDate: projectTable.scheduledLaunchDate,
        createdAt: projectTable.createdAt,
        upvoteCount: sql<number>`cast(count(distinct ${upvote.id}) as int)`.mapWith(Number),
        commentCount: sql<number>`cast(count(distinct ${fumaComments.id}) as int)`.mapWith(Number),
        dailyRanking: projectTable.dailyRanking,
      })
      .from(projectTable)
      .leftJoin(upvote, eq(upvote.projectId, projectTable.id))
      .leftJoin(fumaComments, sql`"fuma_comments"."page"::text = ${projectTable.id}`)
      .where(
        and(
          eq(projectTable.launchStatus, launchStatus.LAUNCHED),
          sql`${projectTable.scheduledLaunchDate} >= ${yesterdayStart.toISOString()}`,
          sql`${projectTable.scheduledLaunchDate} < ${yesterdayEnd.toISOString()}`,
        ),
      )
      .groupBy(projectTable.id)
      .orderBy(desc(sql`count(distinct ${upvote.id})`))
      .limit(limit),
    resolveUserId(userId),
  ])

  return enrichProjectsWithUserData(yesterdayProjectsBase, resolvedUserId)
}

export async function getMonthBestProjects(
  limit: number = PROJECT_LIMITS_VARIABLES.MONTH_LIMIT,
  userId?: string | null,
) {
  if (shouldUseMock()) return getMockMonth(limit) as never
  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)

  // Perf: main query and session lookup run concurrently.
  const [monthProjectsBase, resolvedUserId] = await Promise.all([
    db
      .select({
        id: projectTable.id,
        name: projectTable.name,
        slug: projectTable.slug,
        description: projectTable.description,
        logoUrl: projectTable.logoUrl,
        websiteUrl: projectTable.websiteUrl,
        launchStatus: projectTable.launchStatus,
        launchType: projectTable.launchType,
        dailyRanking: projectTable.dailyRanking,
        scheduledLaunchDate: projectTable.scheduledLaunchDate,
        createdAt: projectTable.createdAt,
        upvoteCount: sql<number>`cast(count(distinct ${upvote.id}) as int)`.mapWith(Number),
        commentCount: sql<number>`cast(count(distinct ${fumaComments.id}) as int)`.mapWith(Number),
      })
      .from(projectTable)
      .leftJoin(upvote, eq(upvote.projectId, projectTable.id))
      .leftJoin(fumaComments, sql`"fuma_comments"."page"::text = ${projectTable.id}`)
      .where(
        and(
          eq(projectTable.launchStatus, launchStatus.LAUNCHED),
          sql`${projectTable.scheduledLaunchDate} >= ${monthStart.toISOString()}`,
          sql`${projectTable.scheduledLaunchDate} <= ${monthEnd.toISOString()}`,
        ),
      )
      .groupBy(projectTable.id)
      .orderBy(desc(sql`count(distinct ${upvote.id})`))
      .limit(limit),
    resolveUserId(userId),
  ])

  return enrichProjectsWithUserData(monthProjectsBase, resolvedUserId)
}

export async function getFeaturedPremiumProjects() {
  const projects = await db.query.project.findMany({
    where: and(
      eq(projectTable.featuredOnHomepage, true),
      eq(projectTable.launchType, launchType.PREMIUM_PLUS),
      eq(projectTable.launchStatus, launchStatus.ONGOING),
    ),
    columns: {
      id: true,
      name: true,
      slug: true,
      description: true,
      logoUrl: true,
      websiteUrl: true,
      launchStatus: true,
      launchType: true,
      dailyRanking: true,
    },
    limit: 3,
    orderBy: [desc(projectTable.createdAt)],
  })
  return projects
}

export async function getYesterdayTopProjects() {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  yesterday.setHours(0, 0, 0, 0)
  const yesterdayEnd = new Date(yesterday)
  yesterdayEnd.setHours(23, 59, 59, 999)

  const topProjects = await db
    .select({
      id: projectTable.id,
      name: projectTable.name,
      slug: projectTable.slug,
      logoUrl: projectTable.logoUrl,
      dailyRanking: projectTable.dailyRanking,
    })
    .from(projectTable)
    .where(
      and(
        eq(projectTable.launchStatus, launchStatus.LAUNCHED),
        sql`${projectTable.dailyRanking} IS NOT NULL`,
        sql`${projectTable.scheduledLaunchDate} >= ${yesterday.toISOString()}`,
        sql`${projectTable.scheduledLaunchDate} <= ${yesterdayEnd.toISOString()}`,
      ),
    )
    .orderBy(projectTable.dailyRanking)
    .limit(3)

  return topProjects
}

export async function getWinnersByDate(date: Date, userId?: string | null) {
  if (shouldUseMock()) return getMockWinners() as never
  const dayStart = new Date(date)
  dayStart.setHours(0, 0, 0, 0)
  const dayEnd = new Date(date)
  dayEnd.setHours(23, 59, 59, 999)

  // Perf: main query and session lookup run concurrently.
  const [winnersBase, resolvedUserId] = await Promise.all([
    db
      .select({
        id: projectTable.id,
        name: projectTable.name,
        slug: projectTable.slug,
        description: projectTable.description,
        logoUrl: projectTable.logoUrl,
        websiteUrl: projectTable.websiteUrl,
        dailyRanking: projectTable.dailyRanking,
        launchStatus: projectTable.launchStatus,
        scheduledLaunchDate: projectTable.scheduledLaunchDate,
        createdAt: projectTable.createdAt,
        upvoteCount: sql<number>`cast(count(distinct ${upvote.id}) as int)`.mapWith(Number),
        commentCount: sql<number>`cast(count(distinct ${fumaComments.id}) as int)`.mapWith(Number),
      })
      .from(projectTable)
      .leftJoin(upvote, eq(upvote.projectId, projectTable.id))
      .leftJoin(fumaComments, sql`"fuma_comments"."page"::text = ${projectTable.id}`)
      .where(
        and(
          eq(projectTable.launchStatus, launchStatus.LAUNCHED),
          sql`${projectTable.dailyRanking} IS NOT NULL`,
          sql`${projectTable.dailyRanking} <= 3`,
          sql`${projectTable.scheduledLaunchDate} >= ${dayStart.toISOString()}`,
          sql`${projectTable.scheduledLaunchDate} <= ${dayEnd.toISOString()}`,
        ),
      )
      .groupBy(projectTable.id)
      .orderBy(projectTable.dailyRanking),
    resolveUserId(userId),
  ])

  return enrichProjectsWithUserData(winnersBase, resolvedUserId)
}
