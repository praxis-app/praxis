import { rule } from 'graphql-shield';
import { Context } from '../../context/context.types';
import { hasServerPermission } from '../shield.utils';

export const canManageServerRoles = rule({ cache: 'contextual' })(
  async (_parent, _args, { permissions }: Context) =>
    hasServerPermission(permissions, 'manageRoles'),
);
