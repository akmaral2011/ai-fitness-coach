import { env } from '../config/env.js';

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

const resendUrl = 'https://api.resend.com/emails';

export function isEmailConfigured() {
  return Boolean(env.resendApiKey && env.emailFrom);
}

async function sendEmail({ to, subject, html, text }: EmailPayload) {
  if (!env.resendApiKey || !env.emailFrom) return false;

  const response = await fetch(resendUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.emailFrom,
      to,
      subject,
      html,
      text,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Email provider failed: ${response.status} ${body}`);
  }

  return true;
}

export async function sendVerificationEmail(to: string, name: string, token: string) {
  const verifyUrl = env.backendUrl
    ? `${env.backendUrl}/api/auth/verify-email/${encodeURIComponent(token)}`
    : null;

  return sendEmail({
    to,
    subject: 'Verify your AI Fitness Coach account',
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
        <h1>Welcome, ${name}!</h1>
        <p>Confirm your email to finish setting up AI Fitness Coach.</p>
        ${
          verifyUrl
            ? `<p><a href="${verifyUrl}" style="display:inline-block;padding:12px 18px;border-radius:10px;background:#10b981;color:white;text-decoration:none;font-weight:700">Verify email</a></p>`
            : ''
        }
        <p>If the button does not work, use this token:</p>
        <pre style="white-space:pre-wrap;background:#f3f4f6;padding:12px;border-radius:8px">${token}</pre>
      </div>
    `,
    text: `Welcome, ${name}!\n\nVerify your AI Fitness Coach account.\n${
      verifyUrl ? `Link: ${verifyUrl}\n` : ''
    }Token: ${token}`,
  });
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const appUrl = env.frontendUrl ?? 'http://localhost:5173';
  const resetUrl = `${appUrl}/?resetToken=${encodeURIComponent(token)}`;

  return sendEmail({
    to,
    subject: 'Reset your AI Fitness Coach password',
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
        <h1>Password reset</h1>
        <p>Use this secure one-time token to reset your password. It expires in 30 minutes.</p>
        <p><a href="${resetUrl}" style="display:inline-block;padding:12px 18px;border-radius:10px;background:#10b981;color:white;text-decoration:none;font-weight:700">Reset password</a></p>
        <p>If the button does not work, paste this token in the app:</p>
        <pre style="white-space:pre-wrap;background:#f3f4f6;padding:12px;border-radius:8px">${token}</pre>
      </div>
    `,
    text: `Reset your AI Fitness Coach password:\n${resetUrl}\n\nToken: ${token}\n\nThis token expires in 30 minutes.`,
  });
}
