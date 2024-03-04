import { rule } from 'graphql-shield';
import { Context } from '../../context/context.types';
import { Rule } from '../../rules/models/rule.model';
import { hasServerPermission } from '../shield.utils';

export const isPublicRule = rule({ cache: 'strict' })(
  async (parent: Rule, _args, { services: { rulesService } }: Context) =>
    rulesService.isPublicRule(parent.id),
);

export const canManageRules = rule({ cache: 'contextual' })(
  async (_parent, _args, { permissions }: Context) =>
    hasServerPermission(permissions, 'manageRules'),
);
