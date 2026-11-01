"use client"

import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"

import { cn } from "@/lib/utils"

// Client-only : le bundle fuma (useEffectEvent) n'existe pas dans le
// runtime react-server, donc on l'exclut du build SSR pour un `next build` OK.
const Comments = dynamic(() => import("@fuma-comment/react").then((m) => m.Comments), {
  ssr: false,
  loading: () => (
    <div className="mt-8 animate-pulse">
      <div className="mb-4 h-6 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
      <div className="mb-2.5 h-24 rounded bg-gray-200 dark:bg-gray-700"></div>
      <div className="h-10 w-20 rounded bg-gray-200 dark:bg-gray-700"></div>
    </div>
  ),
})

interface ProjectCommentsProps {
  projectId: string
  className?: string
}

export function ProjectComments({ projectId, className }: ProjectCommentsProps) {
  const router = useRouter()

  const signIn = () => {
    router.push("/sign-in")
  }

  return (
    <div
      className={cn("relative z-10 mt-8", className)}
      data-fuma-comment-container="true"
      data-fuma-comment-button="true"
    >
      <Comments
        page={projectId}
        className="bg-background w-full"
        auth={{
          type: "api",
          signIn,
        }}
      />
    </div>
  )
}
