import { JwtPayload } from "jsonwebtoken";

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface RequestWithCookies extends Request {
  cookies?: { auth?: AuthTokens };
}

export interface Claims {
  accessTokenClaims: JwtPayload | null;
  refreshTokenClaims: JwtPayload | null;
}
