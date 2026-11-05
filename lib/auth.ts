import { db } from "@/drizzle/db"
import { stripe } from "@better-auth/stripe"
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { admin, captcha, oneTap } from "better-auth/plugins"
import Stripe from "stripe"

import { sendEmail } from "@/lib/email"

const isValid = (v: string | undefined) =>
  !!v && !v.includes("...") && !v.startsWith("your_") && v.length > 8

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY
const STRIPE_WEBHOOK = process.env.STRIPE_WEBHOOK_SECRET
const hasStripe = isValid(STRIPE_KEY) && isValid(STRIPE_WEBHOOK)

const stripeClient = new Stripe(
  hasStripe ? STRIPE_KEY! : "sk_test_51MockForLocalDevOnly00000000000000",
  { apiVersion: "2025-02-24.acacia" },
)

const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY
const hasTurnstile = isValid(TURNSTILE_SECRET)

const ONE_TAP_ID =
  process.env.NEXT_PUBLIC_ONE_TAP_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
const hasOneTap = isValid(ONE_TAP_ID)

const GOOGLE_ID = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
const GOOGLE_SECRET = process.env.GOOGLE_CLIENT_SECRET
const hasGoogle = isValid(GOOGLE_ID) && isValid(GOOGLE_SECRET)

const GITHUB_ID = process.env.GITHUB_CLIENT_ID
const GITHUB_SECRET = process.env.GITHUB_CLIENT_SECRET
const hasGithub = isValid(GITHUB_ID) && isValid(GITHUB_SECRET)

// En local sans email vérifié, on désactive la vérification pour pouvoir tester
const isLocal = process.env.NODE_ENV !== "production"
export const USE_MOCK = process.env.USE_MOCK_DATA === "true"

const realAuth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: !isLocal,
    sendResetPassword: async ({ user, url }) => {
      const html = `
        <p>Hello ${user.name},</p>
        <p>Click the link below to reset your password:</p>
        <a href="${url}" style="padding: 10px 20px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
        <p>Or copy and paste this URL into your browser:</p>
        <p>${url}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `

      await sendEmail({
        to: user.email,
        subject: "Reset your password",
        html,
      })
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      const html = `
        <p>Hello ${user.name},</p>
        <p>Click the link below to verify your email address:</p>
        <a href="${url}" style="padding: 10px 20px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px;">
          Verify Email
        </a>
        <p>Or copy and paste this URL into your browser:</p>
        <p>${url}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, please ignore this email.</p>
      `

      await sendEmail({
        to: user.email,
        subject: "Verify your email address",
        html,
      })
    },
    expiresIn: 86400,
  },
  socialProviders: {
    ...(hasGoogle
      ? {
          google: {
            clientId: GOOGLE_ID as string,
            clientSecret: GOOGLE_SECRET as string,
          },
        }
      : {}),
    ...(hasGithub
      ? {
          github: {
            clientId: GITHUB_ID as string,
            clientSecret: GITHUB_SECRET as string,
          },
        }
      : {}),
  },
  trustedOrigins: [
    process.env.NODE_ENV !== "development"
      ? process.env.NEXT_PUBLIC_URL || "https://saasflock.com"
      : "http://localhost:3000",
  ],
  plugins: [
    ...(hasStripe
      ? [
          stripe({
            stripeClient,
            stripeWebhookSecret: STRIPE_WEBHOOK!,
            createCustomerOnSignUp: true,
          }),
        ]
      : []),
    ...(hasTurnstile
      ? [
          captcha({
            provider: "cloudflare-turnstile",
            secretKey: TURNSTILE_SECRET!,
            endpoints: ["/sign-up/email", "/sign-in/email", "/forget-password"],
          }),
        ]
      : []),
    ...(hasOneTap
      ? [
          oneTap({
            clientId: ONE_TAP_ID!,
          }),
        ]
      : []),
    admin({}),
  ],
})

// Wrapper résilient : en mode mock ou si la DB est absente, getSession retourne null
// au lieu de crasher les pages publiques (/, /trending, /projects/[slug]...)
export const auth = new Proxy(realAuth, {
  get(target, prop, receiver) {
    if (prop === "api") {
      const api = Reflect.get(target, prop, receiver) as Record<string, unknown>
      return new Proxy(api, {
        get(apiTarget, apiProp) {
          if (apiProp === "getSession") {
            return async (...args: unknown[]) => {
              if (USE_MOCK) return null
              try {
                const fn = Reflect.get(apiTarget, apiProp) as (...a: unknown[]) => Promise<unknown>
                return await fn(...args)
              } catch {
                console.log("[auth:mock] getSession fallback null (DB unavailable)")
                return null
              }
            }
          }
          return Reflect.get(apiTarget, apiProp)
        },
      })
    }
    return Reflect.get(target, prop, receiver)
  },
})
