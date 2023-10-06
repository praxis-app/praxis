import { rule } from 'graphql-shield';
import { UNAUTHORIZED } from '../../shared/shared.constants';
import { getJti, getSub } from '../../auth/auth.utils';
import { Context } from '../../context/context.types';

export const isAuthenticated = rule({ cache: 'contextual' })(async (
  _parent,
  _args,
  { user }: Context,
) => {
  if (!user) {
    return UNAUTHORIZED;
  }
  return true;
});

export const hasValidRefreshToken = rule({ cache: 'contextual' })(async (
  _parent,
  _args,
  {
    claims: { refreshTokenClaims },
    services: { refreshTokensService },
  }: Context,
) => {
  const jti = getJti(refreshTokenClaims);
  const sub = getSub(refreshTokenClaims);
  if (!jti || !sub) {
    return UNAUTHORIZED;
  }
  return refreshTokensService.validateRefreshToken(jti, sub);
});
