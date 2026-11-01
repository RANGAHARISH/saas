import { ProjectListSkeleton } from "@/components/home/project-list-skeleton"

export default function CategoriesLoading() {
  return (
    <main className="bg-secondary/20">
      <div className="min-h-screen w-full px-4 pt-8 pb-12 md:px-8">
        <ProjectListSkeleton />
      </div>
    </main>
  )
}
