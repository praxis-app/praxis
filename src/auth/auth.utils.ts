import { config } from 'dotenv';
import { JwtPayload, verify } from 'jsonwebtoken';
import { RequestWithCookies } from './auth.types';

config();

export const decodeToken = (token: string) => {
  try {
    const jwtKey = process.env.JWT_KEY as string;
    return verify(token, jwtKey) as JwtPayload;
  } catch {
    return null;
  }
};

/**
 * Get sub claim - identifies the user or subject of the JWT
 * https://www.rfc-editor.org/rfc/rfc7519#section-4.1.2
 */
export const getSub = (claims: JwtPayload | null) => {
  if (!claims?.sub) {
    return null;
  }
  return parseInt(claims.sub);
};

/**
 * Get jti claim - provides a unique identifier for the JWT
 * https://www.rfc-editor.org/rfc/rfc7519#section-4.1.7
 */
export const getJti = (claims: JwtPayload | null) => {
  if (!claims?.jti) {
    return null;
  }
  return parseInt(claims.jti);
};

export const getClaims = (req: RequestWithCookies) => {
  const { cookies } = req;
  const accessTokenClaims = cookies?.auth
    ? decodeToken(cookies.auth.access_token)
    : null;
  const refreshTokenClaims = cookies?.auth
    ? decodeToken(cookies.auth.refresh_token)
    : null;
  return { accessTokenClaims, refreshTokenClaims };
};
