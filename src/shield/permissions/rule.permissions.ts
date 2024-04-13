import { allow, or } from 'graphql-shield';
import { canManageRules, isPublicRule } from '../rules/rule.rules';
import { isVerified } from '../rules/user.rules';

export const rulePermissions = {
  Query: {
    serverRules: allow,
  },
  Mutation: {
    createRule: canManageRules,
    deleteRule: canManageRules,
    updateRule: canManageRules,
    updateRulesPriority: canManageRules,
  },
  ObjectTypes: {
    Rule: or(isVerified, isPublicRule),
  },
};
