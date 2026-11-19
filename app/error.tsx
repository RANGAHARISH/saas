"use client"

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="site-container py-16">
      <h1 className="text-2xl font-semibold">This page is temporarily unavailable</h1>
      <p className="text-muted-foreground mt-3">
        We couldn&apos;t load this page. Please try again shortly.
      </p>
      <button type="button" onClick={reset} className="mt-6 underline">
        Try again
      </button>
    </main>
  )
}
