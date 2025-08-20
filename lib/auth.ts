import { SignJWT, jwtVerify } from "jose";
const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret");
const alg = "HS256";
export async function signJwt(payload: Record<string, any>, expSeconds = 60 * 60) {
  return await new SignJWT(payload).setProtectedHeader({ alg }).setIssuedAt().setExpirationTime(`${expSeconds}s`).sign(secret);
}
export async function verifyJwt<T = any>(token: string) {
  const { payload } = await jwtVerify(token, secret);
  return payload as T;
}
