import { cn } from "@/lib/utils"

// Shared rich-text typography (no editor dependency — safe to import anywhere,
// including server components and light client bundles).
export const RICH_TEXT_STYLES =
  "prose prose-sm prose-zinc dark:prose-invert max-w-none w-full whitespace-pre-wrap [&_h1]:my-2 [&_h2]:my-1 [&_p]:my-2 [&_ul]:my-0.5 [&_ol]:my-0.5 [&_li]:my-0.5"

interface RichTextDisplayProps {
  content: string
  className?: string
}

// Formatted rich-text output (no tiptap runtime required).
export function RichTextDisplay({ content, className }: RichTextDisplayProps) {
  return (
    <div
      className={cn(RICH_TEXT_STYLES, className)}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}
