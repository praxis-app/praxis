import { JwtPayload } from 'jsonwebtoken';

export interface AuthTokens {
  access_token: string;
}

export interface AuthTokenClaims {
  accessTokenClaims: JwtPayload | null;
}

export interface RequestWithCookies extends Request {
  cookies?: { auth?: AuthTokens };
}
