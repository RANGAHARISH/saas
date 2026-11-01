"use client"

import React, { useEffect, useOptimistic, useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import { RiThumbUpFill, RiThumbUpLine } from "@remixicon/react"
import { toast } from "sonner"

import { UPVOTE_LIMITS } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { toggleUpvote } from "@/app/actions/projects"

interface UpvoteButtonProps {
  projectId: string
  initialUpvoted: boolean
  upvoteCount: number
  isAuthenticated: boolean
  variant?: "default" | "compact"
  className?: string
}

export function UpvoteButton({
  projectId,
  initialUpvoted,
  upvoteCount,
  isAuthenticated,
  variant = "default",
  className,
}: UpvoteButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isDebouncing, setIsDebouncing] = useState(false)
  const [optimisticState, updateOptimisticState] = useOptimistic(
    { upvoted: initialUpvoted, count: upvoteCount },
    (state, newUpvoted: boolean) => ({
      upvoted: newUpvoted,
      count: state.count + (newUpvoted ? 1 : -1),
    }),
  )

  // Réinitialiser l'état de debounce après le temps défini dans les constantes
  useEffect(() => {
    if (isDebouncing) {
      const timer = setTimeout(() => {
        setIsDebouncing(false)
      }, UPVOTE_LIMITS.DEBOUNCE_TIME_MS)
      return () => clearTimeout(timer)
    }
  }, [isDebouncing])

  const handleUpvote = async (e: React.MouseEvent) => {
    e.stopPropagation()

    if (!isAuthenticated) {
      router.push("/sign-in")
      return
    }

    // Si déjà en cours de traitement ou en debounce, ignorer le clic
    if (isPending || isDebouncing) {
      return
    }

    // Activer le debounce
    setIsDebouncing(true)

    startTransition(async () => {
      updateOptimisticState(!optimisticState.upvoted)

      const response = await toggleUpvote(projectId)

      if (!response.success) {
        // Annuler la mise à jour optimiste en cas d'erreur
        updateOptimisticState(optimisticState.upvoted)
        toast.error(response.message)
      }
    })
  }

  if (variant === "compact") {
    return (
      <button
        onClick={handleUpvote}
        disabled={isPending}
        className={cn(
          "hover:border-copper flex h-12 w-12 cursor-pointer flex-col items-center justify-center rounded-xl border-2 transition-all duration-300",
          optimisticState.upvoted && "border-copper",
          className,
        )}
      >
        {optimisticState.upvoted ? (
          <RiThumbUpFill className="text-copper h-3.5 w-3.5" />
        ) : (
          <RiThumbUpLine className="text-muted-foreground h-3.5 w-3.5" />
        )}
        <span
          className={cn(
            "mt-1 text-sm leading-none font-semibold",
            optimisticState.upvoted ? "text-copper" : "text-muted-foreground",
          )}
        >
          {optimisticState.count}
        </span>
      </button>
    )
  }

  return (
    <button
      onClick={handleUpvote}
      disabled={isPending}
      className={cn(
        "inline-flex h-9 cursor-pointer items-center gap-2 rounded-full border px-3 transition-colors",
        optimisticState.upvoted
          ? "border-pine bg-pine hover:border-pine-deep hover:bg-pine-deep text-white"
          : "border-border bg-cream text-espresso hover:border-copper/60 hover:bg-copper-soft hover:text-copper-deep dark:bg-secondary dark:text-secondary-foreground",
        !isAuthenticated && "cursor-not-allowed opacity-75",
        className,
      )}
    >
      {optimisticState.upvoted ? (
        <RiThumbUpFill className="h-4 w-4" />
      ) : (
        <RiThumbUpLine className="h-4 w-4" />
      )}
      <span className="text-sm">
        {optimisticState.count} {optimisticState.count === 1 ? "upvote" : "upvotes"}
      </span>
    </button>
  )
}
