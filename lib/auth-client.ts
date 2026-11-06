import { stripeClient } from "@better-auth/stripe/client"
import { adminClient, oneTapClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

const ONE_TAP_CLIENT_ID =
  process.env.NEXT_PUBLIC_ONE_TAP_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

const isValidClient = (v: string | undefined) =>
  !!v && !v.includes("...") && !v.startsWith("your_") && v.length > 8

export const isTurnstileEnabled =
  !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY &&
  !process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY.includes("...") &&
  !process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY.startsWith("your_")

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_URL || process.env.BETTER_AUTH_URL || "http://localhost:3000",
  trustedOrigins: [
    process.env.NODE_ENV !== "development"
      ? process.env.NEXT_PUBLIC_URL || "https://saasflock.com"
      : "http://localhost:3000",
  ],
  plugins: [
    stripeClient({
      subscription: true,
    }),
    ...(isValidClient(ONE_TAP_CLIENT_ID)
      ? [
          oneTapClient({
            clientId: ONE_TAP_CLIENT_ID!,
            promptOptions: {
              maxAttempts: 1,
            },
          }),
        ]
      : []),
    adminClient(),
  ],
})

const ONE_TAP_ENABLED = isValidClient(ONE_TAP_CLIENT_ID)

// Whether the Google One Tap plugin is registered. When false, `oneTap` on the
// client is just the dynamic-path proxy (calling it would fire a stray request),
// so callers must guard with this flag.
export const isOneTapEnabled = ONE_TAP_ENABLED

type AuthClient = typeof authClient & {
  forgetPassword: (data: Record<string, unknown>) => Promise<unknown>
  resetPassword: (data: Record<string, unknown>) => Promise<unknown>
  changePassword: (data: Record<string, unknown>) => Promise<unknown>
}

const typedClient = authClient as unknown as AuthClient

// NOTE: never use `.bind(authClient)` here — the client is a dynamic-path Proxy,
// so `.bind` resolves to a bogus `/xxx/bind` route and fires a stray request.
// Arrow closures preserve the correct endpoint path.
export const forgetPassword = (data: Record<string, unknown>) => typedClient.forgetPassword(data)
export const resetPassword = (data: Record<string, unknown>) => typedClient.resetPassword(data)
export const changePassword = (data: Record<string, unknown>) => typedClient.changePassword(data)

export const { signIn, signUp, useSession, signOut, getSession, updateUser, oneTap, admin } =
  authClient
