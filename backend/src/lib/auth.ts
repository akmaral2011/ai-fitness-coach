import type { FastifyReply, FastifyRequest } from 'fastify';

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  pictureUrl: string | null;
  emailVerifiedAt: Date | null;
  createdAt: Date;
};

export function publicUser(user: AuthUser) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    pictureUrl: user.pictureUrl,
    emailVerified: user.emailVerifiedAt !== null,
    createdAt: user.createdAt.toISOString(),
  };
}

export async function getBearerUserId(request: FastifyRequest): Promise<string | null> {
  try {
    const payload = await request.jwtVerify<{ sub: string }>();
    return payload.sub;
  } catch {
    return null;
  }
}

export async function requireUserId(request: FastifyRequest, reply: FastifyReply) {
  const userId = await getBearerUserId(request);
  if (!userId) {
    reply.status(401).send({ message: 'Unauthorized' });
    return null;
  }

  return userId;
}
