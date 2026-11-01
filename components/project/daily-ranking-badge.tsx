import { cn } from "@/lib/utils"

interface DailyRankingBadgeProps {
  ranking: number | null
  className?: string
  size?: "sm" | "md" // md pour des affichages plus grands
}

export function DailyRankingBadge({ ranking, className, size = "sm" }: DailyRankingBadgeProps) {
  if (!ranking || ranking > 3) return null

  // Configurer les badges selon le classement
  const badges = {
    1: {
      bgColor: "bg-copper",
      textColor: "text-white",
    },
    2: {
      bgColor: "bg-pine",
      textColor: "text-white",
    },
    3: {
      bgColor: "bg-sand",
      textColor: "text-espresso",
    },
  }

  const badge = badges[ranking as 1 | 2 | 3]

  const sizeClasses = {
    sm: "w-5 h-5 -top-2 -right-2",
    md: "w-6 h-6 -top-2 -right-2",
  }

  return (
    <div
      className={cn(
        "absolute z-10 flex items-center justify-center rounded-full border-2 border-[#FDFDFD] dark:border-[#1D1D1D]",
        badge.bgColor,
        sizeClasses[size],
        className,
      )}
      title={`Top ${ranking}`}
    >
      <span className={cn("text-xs font-bold", badge.textColor)}>{ranking}</span>
    </div>
  )
}
