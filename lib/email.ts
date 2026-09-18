import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`

  return await resend.emails.send({
    from: "noreply@dupcheck.io",
    to: email,
    subject: "Verify your DupCheck email",
    html: `
      <h2>Verify Your Email</h2>
      <p>Click the link below to verify your email address:</p>
      <a href="${verificationUrl}" style="background-color: #FF8C00; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">
        Verify Email
      </a>
      <p>This link expires in 24 hours.</p>
    `,
  })
}

export async function sendDuplicatesFoundEmail(
  email: string,
  duplicateCount: number,
  totalAmount: number
) {
  return await resend.emails.send({
    from: "noreply@dupcheck.io",
    to: email,
    subject: `DupCheck found ${duplicateCount} duplicate payments!`,
    html: `
      <h2>Duplicate Payments Detected</h2>
      <p>We found <strong>${duplicateCount} duplicate payments</strong> totaling <strong>$${totalAmount.toFixed(2)}</strong>.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background-color: #FF8C00; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">View Details</a></p>
    `,
  })
}
