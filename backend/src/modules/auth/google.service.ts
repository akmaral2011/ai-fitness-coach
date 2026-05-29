import { env } from '../../config/env.js';

type GoogleTokenInfo = {
  sub: string;
  email: string;
  email_verified?: boolean | string;
  name?: string;
  picture?: string;
  aud: string;
};

export async function verifyGoogleCredential(credential: string): Promise<GoogleTokenInfo | null> {
  if (!env.googleClientId) return null;

  const response = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
  );
  if (!response.ok) return null;

  const data = (await response.json()) as Partial<GoogleTokenInfo>;
  const emailVerified = data.email_verified === true || data.email_verified === 'true';

  if (!data.sub || !data.email || data.aud !== env.googleClientId || !emailVerified) {
    return null;
  }

  return {
    sub: data.sub,
    email: data.email.toLowerCase(),
    email_verified: emailVerified,
    name: data.name,
    picture: data.picture,
    aud: data.aud,
  };
}
