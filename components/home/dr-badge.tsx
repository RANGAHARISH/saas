import { TrendingUp } from "lucide-react"

interface DrBadgeProps {
  domain?: string
  score?: number
}

export function DrBadge({ domain = "saasflock.com", score = 58 }: DrBadgeProps) {
  const size = 52
  const stroke = 6
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - Math.min(Math.max(score, 0), 100) / 100)

  return (
    <div className="bg-card flex items-center gap-3 rounded-xl border px-4 py-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
      {/* Score ring */}
      <div className="relative h-[52px] w-[52px] shrink-0">
        <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full -rotate-90">
          <defs>
            <linearGradient id="drBadgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e2572c" />
              <stop offset="100%" stopColor="#f0a03c" />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--border)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#drBadgeGrad)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <span className="text-foreground absolute inset-0 flex items-center justify-center text-[17px] font-bold">
          {score}
        </span>
      </div>

      {/* Domain + label */}
      <div className="min-w-0">
        <div className="text-foreground truncate text-[15px] font-bold">{domain}</div>
        <div className="text-muted-foreground text-[10.5px] font-medium tracking-[0.08em]">
          CERTIFIED DOMAIN RATING
        </div>
      </div>

      <TrendingUp className="text-foreground ml-auto h-6 w-6 shrink-0" />
    </div>
  )
}
