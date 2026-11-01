import { Resend } from "resend"

// Initialize Resend with API key (optionnel en local)
const RESEND_KEY = process.env.RESEND_API_KEY
const hasResend = !!RESEND_KEY && RESEND_KEY.startsWith("re_") && !RESEND_KEY.includes("...")
const resend = hasResend ? new Resend(RESEND_KEY) : null

interface EmailPayload {
  to: string
  subject: string
  html: string
}

/**
 * Sends an email using Resend
 * @param payload - Email configuration object
 * @returns Promise that resolves when email is sent
 */
export async function sendEmail(payload: EmailPayload) {
  const { to, subject, html } = payload

  if (!resend) {
    console.log(`[email:mock] to=${to} subject=${subject} (RESEND_API_KEY missing, skipped)`)
    return { success: true, data: { mocked: true } }
  }

  try {
    const data = await resend.emails.send({
      from: "Open-Launch <noreply@open-launch.com>",
      to,
      subject,
      html,
    })

    return { success: true, data }
  } catch (error) {
    console.error("Failed to send email:", error)
    throw new Error("Failed to send email")
  }
}
