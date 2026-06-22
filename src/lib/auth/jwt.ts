import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-insecure-secret-change-me');
const ACCESS_TTL = `${process.env.JWT_ACCESS_TTL_MIN || 30}m`;

export interface AccessPayload {
  sub: string; // user id
  email: string;
  role: string;
}

export async function signAccessToken(p: AccessPayload): Promise<string> {
  return new SignJWT({ email: p.email, role: p.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(p.sub)
    .setIssuedAt()
    .setExpirationTime(ACCESS_TTL)
    .sign(secret);
}

export async function verifyAccessToken(token: string): Promise<AccessPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      sub: String(payload.sub),
      email: String(payload.email ?? ''),
      role: String(payload.role ?? 'free'),
    };
  } catch {
    return null;
  }
}

// Şifre sıfırlama token'ı (kısa ömürlü, tek amaçlı).
export async function signResetToken(userId: string): Promise<string> {
  return new SignJWT({ typ: 'pwreset' })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime('30m')
    .sign(secret);
}

export async function verifyResetToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    if (payload.typ !== 'pwreset') return null;
    return String(payload.sub);
  } catch {
    return null;
  }
}
