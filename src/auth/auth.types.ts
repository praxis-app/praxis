import { JwtPayload } from 'jsonwebtoken';

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface AuthTokenClaims {
  accessTokenClaims: JwtPayload | null;
  refreshTokenClaims: JwtPayload | null;
}

export interface RequestWithCookies extends Request {
  cookies?: { auth?: AuthTokens };
}
