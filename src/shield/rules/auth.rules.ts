import { rule } from 'graphql-shield';
import { Context } from '../../context/context.types';
import { UNAUTHORIZED } from '../../shared/shared.constants';

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
