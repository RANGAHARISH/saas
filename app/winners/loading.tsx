import { ProjectListSkeleton } from "@/components/home/project-list-skeleton"

export default function WinnersLoading() {
  return (
    <main className="bg-secondary/20 min-h-screen">
      <div className="w-full px-4 pt-8 pb-12 md:px-8">
        <ProjectListSkeleton />
      </div>
    </main>
  )
}
