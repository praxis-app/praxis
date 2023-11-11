export interface AuthTokens {
  access_token: string;
}

export interface RequestWithCookies extends Request {
  cookies?: { access_token: string };
}
